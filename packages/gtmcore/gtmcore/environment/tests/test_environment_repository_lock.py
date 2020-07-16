import pytest
import time
from multiprocessing import Process, Queue
from gtmcore.environment.repository import RepositoryLock
from gtmcore.exceptions import GigantumLockedException

from gtmcore.fixtures import (mock_config_file_for_lock, ENV_UNIT_TEST_REPO, ENV_UNIT_TEST_BASE, ENV_UNIT_TEST_REV)
from gtmcore.environment.tests import ENV_SKIP_MSG, ENV_SKIP_TEST


def process_function(delay: float, value: str, queue: Queue) -> None:
    """
    A test function that puts a value on a queue after a delay
    """
    time.sleep(delay)
    with RepositoryLock():
        queue.put(value)
        time.sleep(2)


class TestEnvironmentRepositoryLock(object):
    def test_failfast(self, mock_config_file_for_lock):
        """Test trying to acquire a lock that is acquired"""
        lock1 = RepositoryLock()
        lock2 = RepositoryLock()

        with lock1:
            with pytest.raises(GigantumLockedException):
                lock2.acquire(failfast=True)

            assert lock2.lock is None

    def test_timeout(self, mock_config_file_for_lock):
        """Test trying to acquire a lock that is acquired"""
        lock1 = RepositoryLock()
        lock2 = RepositoryLock()

        with lock1:
            with pytest.raises(IOError):
                lock2.acquire()

            assert lock2.lock is None

    def test_duplicate_release(self, mock_config_file_for_lock):
        """Test trying to release a lock that is not acquired"""
        lock = RepositoryLock()

        lock.acquire(failfast=True)
        _lock_obj = lock.lock
        lock.release()

        assert lock.lock is None

        lock.lock = _lock_obj # restore lock object as it is cleared by release()
        lock.release()

        assert lock.lock is None

    def test_multiple_workers(self, mock_config_file_for_lock):
        """Test trying to lock with multiple workers"""
        queue = Queue()

        proc1 = Process(target=process_function, args=(1, "1", queue))
        proc1.start()
        proc2 = Process(target=process_function, args=(0, "2", queue))
        proc2.start()
        proc3 = Process(target=process_function, args=(.5, "3", queue))
        proc3.start()

        time.sleep(7)

        for proc in [proc1, proc2, proc3]:
            proc.join()
            proc.terminate()

        assert queue.get() == "2"
        assert queue.get() == "3"
        assert queue.get() == "1"

    def test_decorator(self, mock_config_file_for_lock):
        """Test decorator and context manager without errors"""
        @RepositoryLock()
        def wrapped_function(a, b, c):
            return a + b + c

        r = wrapped_function(1, 2, 3)

        assert r == 6

    def test_decorator_error(self, mock_config_file_for_lock):
        """Test decorator and context manager with an exception"""
        @RepositoryLock()
        def wrapped_function():
            assert wrapped_function.__wrapper__.lock != None
            raise Exception("error")

        assert wrapped_function.__wrapper__.lock == None

        with pytest.raises(Exception):
            wrapped_function(1, 2, 3)

        assert wrapped_function.__wrapper__.lock == None
