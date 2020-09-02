import pytest
import os
import redis

from jupyter_client.manager import start_new_kernel
import json
from pkg_resources import resource_filename


@pytest.fixture()
def mock_kernel():
    """A pytest fixture that creates a jupyter kernel"""
    km, kc = start_new_kernel(kernel_name='python3')

    yield kc, km

    km.shutdown_kernel(now=True)


@pytest.fixture()
def mock_redis_client():
    """A pytest fixture that creates a redis client and cleans up the db, specifically for activity testing"""
    redis_conn = redis.Redis(db=1)
    yield redis_conn
    redis_conn.flushdb()


class MockSessionsResponse(object):
    """A mock for the session query request call in monitor_juptyerlab.py"""
    def __init__(self, url):
        self.status_code = 200

    def json(self):
        with open(os.path.join(resource_filename("gtmcore", "activity/tests"), "mock_session_data.json"), 'rt') as j:
            data = json.load(j)
        return data
