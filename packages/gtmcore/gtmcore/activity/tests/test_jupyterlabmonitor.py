import json
from pkg_resources import resource_filename
import os
import requests
from gtmcore.activity.tests.fixtures import get_redis_client_mock, redis_client, MockSessionsResponse
from gtmcore.container import container_for_context

from gtmcore.activity.monitors.monitor_jupyterlab import JupyterLabMonitor


def mock_ip(key):
    return "172.0.1.2"


class TestJupyterLabMonitor(object):

    def mock_sessions_request(self):
        with open(os.path.join(resource_filename("gtmcore", "activity/tests"), "mock_session_data.json"), 'rt') as j:
            data = json.load(j)
        return data

    def test_supported_names(self, redis_client):
        """Test getting the supported names of the dev env monitor"""
        monitor = JupyterLabMonitor()

        assert len(monitor.get_dev_env_name()) == 1
        assert 'jupyterlab' in monitor.get_dev_env_name()

    def test_get_sessions(self, redis_client, monkeypatch):
        """Test getting the session information from jupyterlab"""
        monkeypatch.setattr(requests, 'get', MockSessionsResponse)
        monitor = JupyterLabMonitor()

        # prep redis data
        dev_env_key = "dev_env_monitor:{}:{}:{}:{}".format('default',
                                                           'default',
                                                           'test-labbook',
                                                           'jupyterlab')
        project_info = container_for_context(username='default')
        lb_key = project_info.default_image_tag('default', 'test-labbook')
        redis_client.set(f"{lb_key}-jupyter-token", "afaketoken")
        redis_client.hset(dev_env_key, "url", "http://localhost:10000/jupyter/asdf/")

        sessions = monitor.get_sessions(dev_env_key, redis_conn=redis_client)

        assert sessions['6e529520-2a6d-4adb-a2a1-de10b85b86a6']['kernel_id'] == '6e529520-2a6d-4adb-a2a1-de10b85b86a6'
        assert sessions['6e529520-2a6d-4adb-a2a1-de10b85b86a6']['kernel_name'] == 'python3'
        assert sessions['6e529520-2a6d-4adb-a2a1-de10b85b86a6']['kernel_type'] == 'notebook'
        assert sessions['6e529520-2a6d-4adb-a2a1-de10b85b86a6']['path'] == 'Untitled2.ipynb'
        assert sessions['146444cd-b4ec-4c00-b29c-d8cef4a503b0']['kernel_id'] == '146444cd-b4ec-4c00-b29c-d8cef4a503b0'
        assert sessions['146444cd-b4ec-4c00-b29c-d8cef4a503b0']['kernel_name'] == 'python3'
        assert sessions['146444cd-b4ec-4c00-b29c-d8cef4a503b0']['kernel_type'] == 'notebook'
        assert sessions['146444cd-b4ec-4c00-b29c-d8cef4a503b0']['path'] == 'code/Untitled.ipynb'

    def test_run(self, redis_client, monkeypatch):
        """Test running the monitor process"""
        monkeypatch.setattr(requests, 'get', MockSessionsResponse)
        # TODO: Mock dispatch methods once added
        monitor = JupyterLabMonitor()

        dev_env_key = "dev_env_monitor:{}:{}:{}:{}".format('default',
                                                           'default',
                                                           'test-labbook',
                                                           'jupyterlab-ubuntu1604')
        project_info = container_for_context(username='default')
        lb_key = project_info.default_image_tag('default', 'test-labbook')
        redis_client.set(f"{lb_key}-jupyter-token", "afaketoken")
        redis_client.hset(dev_env_key, "author_name", "default")
        redis_client.hset(dev_env_key, "author_email", "default@default.io")
        redis_client.hset(dev_env_key, "url", "http://localhost:10000/jupyter/asdf/")

        monitor.run(dev_env_key)

        data = redis_client.hgetall('{}:activity_monitor:6e529520-2a6d-4adb-a2a1-de10b85b86a6'.format(dev_env_key))
        assert data[b'kernel_id'] == b'6e529520-2a6d-4adb-a2a1-de10b85b86a6'
        assert data[b'kernel_name'] == b'python3'
        assert data[b'kernel_type'] == b'notebook'
        assert data[b'path'] == b'Untitled2.ipynb'
        assert data[b'dev_env_monitor'].decode() == dev_env_key
        assert 'rq:job' in data[b'process_id'].decode()

        data = redis_client.hgetall('{}:activity_monitor:146444cd-b4ec-4c00-b29c-d8cef4a503b0'.format(dev_env_key))
        assert data[b'kernel_id'] == b'146444cd-b4ec-4c00-b29c-d8cef4a503b0'
        assert data[b'kernel_name'] == b'python3'
        assert data[b'kernel_type'] == b'notebook'
        assert data[b'path'] == b'code/Untitled.ipynb'
        assert data[b'dev_env_monitor'].decode() == dev_env_key
        assert 'rq:job' in data[b'process_id'].decode()
