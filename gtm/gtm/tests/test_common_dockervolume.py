import pytest
from docker.errors import NotFound

from gtm.utils import DockerVolume, get_docker_client


@pytest.fixture()
def setup_docker_vol():
    """Fixture to create a Build instance with a test image name that does not exist and cleanup after"""
    client = get_docker_client()
    vol = client.volumes.create(name='test-labmanager-volume')

    yield 'test-labmanager-volume', client

    # Remove image post test if it still exists
    vol.remove()


@pytest.fixture()
def cleanup_docker_vol():
    """Fixture to create a Build instance with a test image name that does not exist and cleanup after"""
    yield 'test-labmanager-volume'

    # Remove image post test if it still exists
    client = get_docker_client()
    try:
        vol = client.volumes.get('test-labmanager-volume')
        vol.remove()
    except NotFound:
        pass


class TestLabManagerBuild(object):
    def test_does_not_exist(self):
        """Test checking for a docker volume that does not exist"""
        dv = DockerVolume("adfdsfgdfsglsdflgdsflgj")

        assert dv.exists() is False

    def test_does_exist(self, setup_docker_vol):
        """Test checking for a docker volume that does exist"""
        dv = DockerVolume(setup_docker_vol[0], client=setup_docker_vol[1])

        assert dv.exists() is True

    def test_create(self, cleanup_docker_vol):
        """Test checking for a docker volume that does exist"""
        dv = DockerVolume(cleanup_docker_vol)

        assert dv.exists() is False

        dv.create()

        assert dv.exists() is True

    def test_remove(self, cleanup_docker_vol):
        """Test checking for a docker volume that does exist"""
        dv = DockerVolume(cleanup_docker_vol)

        assert dv.exists() is False

        dv.create()

        assert dv.exists() is True

        dv.remove()

        assert dv.exists() is False

