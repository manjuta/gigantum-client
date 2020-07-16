import pytest
from gtmcore.activity.tests.fixtures import mock_redis_client

from gtmcore.activity.monitors.devenv import DevEnvMonitorManager
from gtmcore.activity.monitors.monitor_jupyterlab import JupyterLabMonitor


class TestDevEnvMonitorManager(object):
    def test_load_monitors(self, mock_redis_client):
        """Test loading monitors from the filesystem"""
        assert mock_redis_client.keys('##AVAILABLE_DEV_ENV_MONITOR_CLASSES##') == []

        demm = DevEnvMonitorManager()

        assert type(demm.available_monitors['jupyterlab']()) == JupyterLabMonitor
        assert mock_redis_client.keys('##AVAILABLE_DEV_ENV_MONITOR_CLASSES##') is not None
        data = mock_redis_client.hgetall('##AVAILABLE_DEV_ENV_MONITOR_CLASSES##')
        assert b'jupyterlab' in data

    def test_load_monitors_precached(self, mock_redis_client):
        """Test loading monitors from redis"""
        demm = DevEnvMonitorManager()

        assert type(demm.available_monitors['jupyterlab']()) == JupyterLabMonitor
        assert mock_redis_client.keys('##AVAILABLE_DEV_ENV_MONITOR_CLASSES##') is not None
        data = mock_redis_client.hgetall('##AVAILABLE_DEV_ENV_MONITOR_CLASSES##')
        assert b'jupyterlab' in data

        demm2 = DevEnvMonitorManager()

        assert demm.available_monitors == demm2.available_monitors
        assert type(demm2.available_monitors['jupyterlab']()) == JupyterLabMonitor
        assert mock_redis_client.keys('##AVAILABLE_DEV_ENV_MONITOR_CLASSES##') is not None
        data = mock_redis_client.hgetall('##AVAILABLE_DEV_ENV_MONITOR_CLASSES##')
        assert b'jupyterlab' in data

    def test_is_available(self, mock_redis_client):
        """Test if a dev env has a monitor available"""
        demm = DevEnvMonitorManager()

        assert demm.is_available("jupyterlab") is True
        assert demm.is_available("jsadfasdf") is False

    def test_get_monitor_instance(self, mock_redis_client):
        """Test getting a monitor instance"""
        demm = DevEnvMonitorManager()

        monitor = demm.get_monitor_instance("jupyterlab")
        assert type(monitor) is JupyterLabMonitor


