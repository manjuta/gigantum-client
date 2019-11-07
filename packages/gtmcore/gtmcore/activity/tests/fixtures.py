import pytest
import mockredis
import redis
from unittest.mock import patch
import os
from jupyter_client.manager import start_new_kernel
import json
from pkg_resources import resource_filename


REDIS_TEST_CLIENT = None


@patch('redis.Redis', mockredis.mock_redis_client)
def get_redis_client_mock(db=1):
    global REDIS_TEST_CLIENT

    if not REDIS_TEST_CLIENT:
        REDIS_TEST_CLIENT = redis.Redis(db=db)
    return REDIS_TEST_CLIENT


@pytest.fixture()
def redis_client(monkeypatch):
    """A pytest fixture to manage getting a redis client for test purposes"""
    monkeypatch.setattr(redis, 'Redis', get_redis_client_mock)

    redis_conn = redis.Redis(db=1)

    yield redis_conn

    redis_conn.flushdb()


@pytest.fixture()
def mock_kernel():
    """A pytest fixture that creates a jupyter kernel"""
    km, kc = start_new_kernel(kernel_name='python3')

    yield kc, km

    km.shutdown_kernel(now=True)


class MockSessionsResponse(object):
    """A mock for the session query request call in monitor_juptyerlab.py"""
    def __init__(self, url):
        self.status_code = 200

    def json(self):
        with open(os.path.join(resource_filename("gtmcore", "activity/tests"), "mock_session_data.json"), 'rt') as j:
            data = json.load(j)
        return data
