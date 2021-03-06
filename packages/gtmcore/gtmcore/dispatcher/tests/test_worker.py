import time
import pprint
import pytest
from gtmcore.dispatcher import Dispatcher, worker, jobs

from gtmcore.dispatcher.tests import BG_SKIP_MSG, BG_SKIP_TEST


@pytest.fixture("session")
def wait_for_workers():
    """A fixter to make sure workers are in the proper state before running tests"""
    ws = worker.WorkerService()
    ready = False
    for _ in range(10):
        r = ws.query()
        if r['isBursting'] is False:
            b = r['gigantum-build-queue']
            p = r['gigantum-publish-queue']
            d = r['gigantum-default-queue']
            if (b['idleWorkers'] > 0 and (b['idleWorkers'] == b['totalWorkers'])) and \
                    (p['idleWorkers'] > 0 and (p['idleWorkers'] == p['totalWorkers'])) and \
                    (d['idleWorkers'] > 0 and (d['idleWorkers'] == d['totalWorkers'])):
                ready = True
                break
        print("Waiting for workers to be ready\n")
        time.sleep(1)

    if ready is False:
        raise Exception("Workers did not boot up successfully. BG worker tests will not proceed.")

    yield


@pytest.mark.skipif(BG_SKIP_TEST, reason=BG_SKIP_MSG)
class TestWorkerService:
    def test_worker_service_already_initialized(self, wait_for_workers):
        ws = worker.WorkerService()
        for q in ws._queue_names:
            assert len(ws.get_all_workers(q)) > 0

    def test_query(self, wait_for_workers):
        ws = worker.WorkerService()
        assert ws
        assert ws.query()['isBursting'] is False

    def test_basic_bursting(self, wait_for_workers):
        ws = worker.WorkerService()
        assert ws.is_bursting is False

        # Initial count of all workers(
        w0 = len(ws.get_all_workers(worker.QUEUE_DEFAULT))

        d = Dispatcher()
        [d.dispatch_task(jobs.test_sleep, args=(5.2,)) for _ in range(9)]

        for _ in range(11):
            print(ws.is_bursting, len(ws.get_all_workers(worker.QUEUE_DEFAULT)), w0)
            if ws.is_bursting and len(ws.get_all_workers(worker.QUEUE_DEFAULT)) > w0:
                print('--- break')
                break
            pprint.pprint(ws.query())
            time.sleep(1)
        else:
            assert False, "Expected to find worker bursting"

        # Wait for all BG tasks to finish.
        for i in range(6):
            if ws.is_bursting:
                time.sleep(1)
        # Assert the count of workers goes back to the original amount
        # when bursting is done.
        assert len(ws.get_all_workers(worker.QUEUE_DEFAULT)) == w0
        assert ws.is_bursting is False
