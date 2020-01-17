import pytest
import time
from multiprocessing import Process, Queue

from gtmcore.environment import BaseRepository
from gtmcore.environment.repository import RepositoryLock
from gtmcore.exceptions import GigantumLockedException

from gtmcore.fixtures import (mock_config_with_repo, ENV_UNIT_TEST_REPO, ENV_UNIT_TEST_BASE, ENV_UNIT_TEST_REV)

from gtmcore.environment.tests import ENV_SKIP_MSG, ENV_SKIP_TEST


@pytest.mark.skipif(ENV_SKIP_TEST, reason=ENV_SKIP_MSG)
class TestEnvironmentRepository(object):
    def test_get_list_index_base_image(self, mock_config_with_repo):
        """Test accessing the list version of the index"""

        repo = BaseRepository(mock_config_with_repo[0])
        data = repo.get_base_list()

        assert type(data) == list
        assert len(data) == 6

        assert any(n.get('id') == ENV_UNIT_TEST_BASE for n in data)
        assert any(n.get('repository') == ENV_UNIT_TEST_REPO for n in data)

    def test_get_component_index_base(self, mock_config_with_repo):
        """Test accessing the detail version of the index"""
        repo = BaseRepository(mock_config_with_repo[0])
        data = repo.get_base_versions(ENV_UNIT_TEST_REPO,
                                      ENV_UNIT_TEST_BASE)
        assert type(data) == list
        assert len(data) >= 1
        assert data[-1][1]['id'] == ENV_UNIT_TEST_BASE
        assert data[-1][1]['repository'] == ENV_UNIT_TEST_REPO

    def test_get_component_version_base(self, mock_config_with_repo):
        """Test accessing the a single version of the index"""
        repo = BaseRepository(mock_config_with_repo[0])
        data = repo.get_base(ENV_UNIT_TEST_REPO,
                             ENV_UNIT_TEST_BASE,
                             ENV_UNIT_TEST_REV)

        assert type(data) == dict
        assert data['id'] == ENV_UNIT_TEST_BASE
        assert data['revision'] == ENV_UNIT_TEST_REV
        assert 'image' in data
        assert len(data['package_managers']) == 2
        assert data['repository'] == ENV_UNIT_TEST_REPO

    def test_get_component_version_base_does_not_exist(self, mock_config_with_repo):
        """Test accessing the a single version of the index that does not exist"""
        repo = BaseRepository(mock_config_with_repo[0])
        with pytest.raises(ValueError):
            repo.get_base('gig-dev_environment-componentsXXX',
                               'quickstart-jupyterlab', '0.1')
        with pytest.raises(ValueError):
            repo.get_base(ENV_UNIT_TEST_REPO,
                               'quickstart-jupyterlab', '3')
        with pytest.raises(ValueError):
            repo.get_base(ENV_UNIT_TEST_REPO,
                               'quickstart-jupyterlabXXX', 0)
        with pytest.raises(ValueError):
            repo.get_base(ENV_UNIT_TEST_REPO,
                               'quickstart-jupyterlab', 99)


def process_function(config_file: str, delay: float, value: str, queue: Queue) -> None:
    """
    A test function that puts a value on a queue after a delay
    """
    time.sleep(delay)
    with RepositoryLock(config_file):
        queue.put(value)
        time.sleep(2)


class TestEnvironmentRepositoryLock(object):
    def test_failfast(self, mock_config_with_repo):
        """Test trying to acquire a lock that is acquired"""
        lock1 = RepositoryLock(mock_config_with_repo[0])
        lock2 = RepositoryLock(mock_config_with_repo[0])

        with lock1:
            with pytest.raises(GigantumLockedException):
                lock2.acquire(failfast=True)

            assert lock2.lock == None

    def test_timeout(self, mock_config_with_repo):
        """Test trying to acquire a lock that is acquired"""
        lock1 = RepositoryLock(mock_config_with_repo[0])
        lock2 = RepositoryLock(mock_config_with_repo[0])

        with lock1:
            with pytest.raises(IOError):
                lock2.acquire()

            assert lock2.lock == None

    def test_duplicate_release(self, mock_config_with_repo):
        """Test trying to release a lock that is not acquired"""
        lock = RepositoryLock(mock_config_with_repo[0])

        lock.acquire(failfast=True)
        _lock_obj = lock.lock
        lock.release()

        assert lock.lock == None

        lock.lock = _lock_obj # restore lock object as it is cleared by release()
        lock.release()

        assert lock.lock == None

    def test_multiple_workers(self, mock_config_with_repo):
        """Test trying to lock with multiple workers"""
        queue = Queue()

        proc1 = Process(target=process_function, args=(mock_config_with_repo[0], 1, "1", queue))
        proc1.start()
        proc2 = Process(target=process_function, args=(mock_config_with_repo[0], 0, "2", queue))
        proc2.start()
        proc3 = Process(target=process_function, args=(mock_config_with_repo[0], .5, "3", queue))
        proc3.start()

        time.sleep(7)

        for proc in [proc1, proc2, proc3]:
            proc.join()
            proc.terminate()

        assert queue.get() == "2"
        assert queue.get() == "3"
        assert queue.get() == "1"

    def test_decorator(self, mock_config_with_repo):
        """Test decorator and context manager without errors"""
        @RepositoryLock(mock_config_with_repo[0])
        def wrapped_function(a, b, c):
            return a + b + c

        r = wrapped_function(1, 2, 3)

        assert r == 6

    def test_decorator_error(self, mock_config_with_repo):
        """Test decorator and context manager with an exception"""
        @RepositoryLock(mock_config_with_repo[0])
        def wrapped_function():
            assert wrapped_function.__wrapper__.lock != None
            raise Exception("error")

        assert wrapped_function.__wrapper__.lock == None

        with pytest.raises(Exception):
            wrapped_function(1, 2, 3)

        assert wrapped_function.__wrapper__.lock == None
