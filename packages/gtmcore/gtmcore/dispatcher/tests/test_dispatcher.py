import json
import time
import datetime
import os
from subprocess import run
from unittest.mock import patch

import pytest
import rq

from gtmcore.dispatcher import Dispatcher, default_redis_conn
import gtmcore.dispatcher.jobs as bg_jobs

from gtmcore.dispatcher.tests import RUNNING_ON_CI, BG_SKIP_MSG, BG_SKIP_TEST
from gtmcore.dispatcher.tests.test_worker import wait_for_workers


@pytest.fixture
def redis_stop_start_fixture():
    d = Dispatcher()
    if not RUNNING_ON_CI:
        assert d.ready_for_job(test_redis_not_running)
        run(['supervisorctl', 'stop', 'redis'], check=True)
        run(['supervisorctl', 'stop', 'rq-worker'], check=True)
        run(['supervisorctl', 'stop', 'rqscheduler'], check=True)
        time.sleep(2)

    yield d

    if not RUNNING_ON_CI:
        run(['supervisorctl', 'start', 'redis'], check=True)
        time.sleep(5)
        run(['supervisorctl', 'start', 'rq-worker'], check=True)
        run(['supervisorctl', 'start', 'rqscheduler'], check=True)
        time.sleep(10)


@pytest.mark.skipif(BG_SKIP_TEST, reason=BG_SKIP_MSG)
def test_redis_not_running(redis_stop_start_fixture):
    d = redis_stop_start_fixture
    assert not d.ready_for_job(test_redis_not_running)


@pytest.mark.skipif(BG_SKIP_TEST, reason=BG_SKIP_MSG)
class TestDispatcher(object):
    def test_ready_for_job(self, wait_for_workers):
        """tests existing and non-existing queues, and redis not running"""
        bad_queue = rq.Queue('a-totally-nonexistent-queue', connection=default_redis_conn())
        with patch.object(Dispatcher, '_get_queue', return_value=bad_queue):
            d = Dispatcher()
            # Here the method is ignored because of the patch above
            assert not d.ready_for_job(self.test_ready_for_job)
        time.sleep(1)
        d = Dispatcher()
        # Since this is an unknown method, it'll go to the default queue
        assert d.ready_for_job(self.test_ready_for_job)

    def test_simple_task(self, wait_for_workers):
        d = Dispatcher()
        job_ref = d.dispatch_task(bg_jobs.test_exit_success)
        time.sleep(2)
        res = d.query_task(job_ref)

        assert res
        assert res.status == 'finished'
        assert res.result == 0
        assert res.failure_message is None
        assert res.finished_at is not None

    def test_failing_task(self, wait_for_workers):
        d = Dispatcher()
        job_ref = d.dispatch_task(bg_jobs.test_exit_fail)
        time.sleep(2)
        res = d.query_task(job_ref)
        assert res
        assert res.status == 'failed'
        assert res.failure_message == 'Exception: Intentional Exception from job `test_exit_fail`'

    def test_query_failed_tasks(self, wait_for_workers):
        d = Dispatcher()
        job_ref = d.dispatch_task(bg_jobs.test_exit_fail)
        time.sleep(1)
        assert job_ref in [j.job_key for j in d.failed_jobs]
        assert job_ref not in [j.job_key for j in d.finished_jobs]
        t = d.query_task(job_ref)
        assert t.failure_message == 'Exception: Intentional Exception from job `test_exit_fail`'

    def test_query_complete_tasks(self, wait_for_workers):
        d = Dispatcher()
        job_ref = d.dispatch_task(bg_jobs.test_exit_success)
        time.sleep(2)
        assert job_ref in [j.job_key for j in d.finished_jobs]
        assert job_ref not in [j.job_key for j in d.failed_jobs]

    def test_abort(self, wait_for_workers):
        d = Dispatcher()
        job_ref_1 = d.dispatch_task(bg_jobs.test_sleep, args=(3,))
        time.sleep(2)
        assert d.query_task(job_ref_1).status == 'started'
        workers = rq.Worker.all(connection=d._redis_conn)
        wk = [w for w in workers if w.state == 'busy']
        assert len(wk) == 1, "There must be precisely one busy worker"
        job_pid = wk[0].get_current_job().meta['pid']
        d.abort_task(job_ref_1)
        time.sleep(0.1)
        j = d.query_task(job_ref_1)

        # There should be no result, cause it was cancelled
        assert j.result is None

        # RQ should identify the task as failed
        assert j.status == "failed"

        # Assert the JOB pid is gone
        with pytest.raises(OSError):
            os.kill(int(job_pid), 0)

        # Now assert the worker pid is still alive (so it can be assigned something else)
        worker_pid = wk[0].pid
        try:
            os.kill(int(worker_pid), 0)
            assert True, "Worker process is still hanging around."
        except OSError:
            assert False, "Worker process is killed"

    def test_simple_dependent_job(self, wait_for_workers):
        d = Dispatcher()
        job_ref_1 = d.dispatch_task(bg_jobs.test_sleep, args=(2,))
        job_ref_2 = d.dispatch_task(bg_jobs.test_exit_success, dependent_job=job_ref_1)
        time.sleep(0.5)
        assert d.query_task(job_ref_2).status == 'deferred'
        time.sleep(3)
        assert d.query_task(job_ref_1).status == 'finished'
        assert d.query_task(job_ref_2).status == 'finished'
        n = d.query_task(job_ref_1)
        assert n.meta.get('sample') == 'test_sleep metadata'

    def test_fail_dependent_job(self, wait_for_workers):
        d = Dispatcher()
        job_ref_1 = d.dispatch_task(bg_jobs.test_exit_fail)
        job_ref_2 = d.dispatch_task(bg_jobs.test_exit_success, dependent_job=job_ref_1)
        time.sleep(3)
        assert d.query_task(job_ref_1).status == 'failed'
        assert d.query_task(job_ref_2).status == 'deferred'

    def test_simple_scheduler(self, wait_for_workers):
        # Run a simple tasks that increments the integer contained in a file.
        d = Dispatcher()
        path = "/tmp/labmanager-unit-test-{}".format(os.getpid())
        if os.path.exists(path):
            os.remove(path)

        d.schedule_task(bg_jobs.test_incr, args=(path,), repeat=3, interval=2)

        time.sleep(8)

        try:
            with open(path) as fp:
                assert json.load(fp)['amt'] == 3
        except Exception as e:
            raise e

    def test_run_only_once(self, wait_for_workers):
        # Assert that this method only gets called once.
        d = Dispatcher()

        path = "/tmp/labmanager-unit-test-{}".format(os.getpid())
        if os.path.exists(path):
            os.remove(path)

        future_t = datetime.datetime.utcnow() + datetime.timedelta(seconds=1)
        jr = d.schedule_task(bg_jobs.test_incr, scheduled_time=future_t, args=(path,), repeat=0)

        time.sleep(4)

        with open(path) as fp:
            assert json.load(fp)['amt'] == 1

    def test_schedule_with_repeat_is_zero(self, wait_for_workers):
        # When repeat is zero, it should run only once.
        d = Dispatcher()

        path = "/tmp/labmanager-unit-test-{}".format(os.getpid())
        if os.path.exists(path):
            os.remove(path)

        jr = d.schedule_task(bg_jobs.test_incr, args=(path,), repeat=0, interval=4)
        time.sleep(6)
        n = d.unschedule_task(jr)
        time.sleep(5)
        with open(path) as fp:
            assert json.load(fp)['amt'] in [1], "When repeat=0, the task should run only once."

    def test_unschedule_task(self, wait_for_workers):
        d = Dispatcher()
        path = "/tmp/labmanager-unit-test-{}".format(os.getpid())
        if os.path.exists(path):
            os.remove(path)

        future_t = datetime.datetime.utcnow() + datetime.timedelta(seconds=5)
        jr = d.schedule_task(bg_jobs.test_incr, scheduled_time=future_t, args=(path,), repeat=4, interval=1)
        time.sleep(2)
        n = d.unschedule_task(jr)
        assert n, "Task should have been cancelled, instead it was not found."
        time.sleep(5)
        assert not os.path.exists(path=path)

    def test_unschedule_midway_through(self, wait_for_workers):
        d = Dispatcher()

        path = "/tmp/labmanager-unit-test-{}".format(os.getpid())
        if os.path.exists(path):
            os.remove(path)

        future_t = None  # i.e., start right now.
        jr = d.schedule_task(bg_jobs.test_incr, scheduled_time=future_t, args=(path,), repeat=6, interval=5)
        time.sleep(8)
        n = d.unschedule_task(jr)
        assert n, "Task should have been cancelled, instead it was not found."
        time.sleep(5)
        with open(path) as fp:
            assert json.load(fp)['amt'] in [2]
