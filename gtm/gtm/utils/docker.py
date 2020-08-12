import socket
import json
import os

import docker
from docker.errors import NotFound


class DockerVolume(object):
    """Class to manage docker volumes used within the build system
    """
    def __init__(self, volume_name: str, client=None) -> None:
        self.volume_name = volume_name

        if not client:
            self.client = get_docker_client()
        else:
            self.client = client

    def exists(self) -> bool:
        """Check if a docker volume exists

        Returns:
            bool
        """
        try:
            self.client.volumes.get(self.volume_name)
            return True
        except NotFound:
            return False

    def create(self) -> None:
        """Create the volume

        Returns:
            None
        """
        self.client.volumes.create(self.volume_name)

    def remove(self) -> None:
        """Remove the volume

        Returns:
            None
        """
        volume = self.client.volumes.get(self.volume_name)
        volume.remove()


def _get_docker_server_api_version() -> str:
    """Retrieve the Docker server API version. """

    socket_path = '/var/run/docker.sock'
    if not os.path.exists(socket_path):
        raise ValueError('No docker.sock on machine (is a Docker server installed?)')

    socket_connection = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    socket_connection.connect(socket_path)
    socket_connection.send(b'GET http://*/version HTTP/1.1\r\nHost: *\r\n\r\n')

    response_data = socket_connection.recv(4000)
    content_lines = response_data.decode().split('\r\n')

    version_dict = json.loads(content_lines[-1])
    if 'ApiVersion' not in version_dict.keys():
        raise ValueError('ApiVersion not in Docker version config data')
    else:
        return version_dict['ApiVersion']


def get_docker_client(check_server_version=True, fallback=True):
    """Return a docker client with proper version to match server API. """

    if check_server_version:
        try:
            docker_server_api_version = _get_docker_server_api_version()
            return docker.from_env(version=docker_server_api_version)
        except ValueError as e:
            if fallback:
                return docker.from_env()
            else:
                raise e
    else:
        return docker.from_env()


def dockerize_mount_path(host_path: str, image_name_with_tag: str) -> str:
    """Returns a path that can be mounted as a docker volume from the host

    Docker uses non-standard formats for windows mounts.
    Last we checked, this routine converts C:\a/gigantum -> /host_mnt/c/a/gigantum
    on Windows with Hyper-V, other stuff on WSL 2, and does nothing on posix systems.

    Args:
        host_path: a path on the host - Windows can use a mix of forward and back slashes
        image_name_with_tag: e.g., 'gigantum/labmanager:latest' - MUST include /usr/bin/tail

    Returns:
        path that can be handed to Docker inside another container for a volume mount
    """
    client = get_docker_client()
    volume_mapping = {host_path: {'bind': '/mnt/gigantum', 'mode': 'ro'}}
    container = client.containers.run(image=image_name_with_tag,
                                      entrypoint='/usr/bin/tail',
                                      command='-f /dev/null',
                                      detach=True,
                                      init=True,
                                      volumes=volume_mapping,
                                      remove=True)
    rewritten_work_dir = container.attrs['Mounts'][0]['Source']
    container.stop()

    return rewritten_work_dir
