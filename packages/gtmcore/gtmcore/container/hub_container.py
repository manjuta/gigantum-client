import json
import os
import socket
import tarfile
import tempfile
import time
from typing import Optional, Callable, List, Dict
import requests

from docker.models.containers import Container

from gtmcore.container.container import ContainerOperations, _check_allowed_args, logger
from gtmcore.container.exceptions import ContainerBuildException, ContainerException

from gtmcore.inventory.inventory import InventoryManager
from gtmcore.labbook import LabBook


class HubProjectContainer(ContainerOperations):
    """Implementation of ContainerOperations for when running in Gigantum Hub"""
    def __init__(self, username: str, labbook: Optional[LabBook] = None, path: Optional[str] = None,
                 override_image_name: Optional[str] = None):
        """Set up local Docker access and proceed to standard superclass init

        Args:
            username: the logged-in Gigantum username (or a special-purpose username)
            labbook: if provided, it is assumed that labbook.name and labbook.owner are populated (including from a path)
            path: (ignored if labbook is not None) a path where we can load a LabBook from
            override_image_name: should be set programmatically if we can obtain labbok owner and name, and there's no
                "override" image "tag"
        """
        # We can populate _image_id with .build_image() or .image_available(),
        # the latter doesn't check the environment hash and is fast
        self._image_id: Optional[str] = None
        self._container: Optional[Container] = None
        self._launch_service = os.environ['LAUNCH_SERVICE_URL']
        self._client_id = os.environ['GIGANTUM_CLIENT_ID']

        logger.info(f"HubProjectContainer.init()")
        ContainerOperations.__init__(self, username, labbook=labbook, path=path,
                                     override_image_name=override_image_name)

    # Manipulating images
    def build_image(self, nocache: bool = False, feedback_callback: Optional[Callable] = None) -> None:
        """"Build a new docker image from the Dockerfile in the labbook's `.gigantum/env` directory.

        This image will be named by the self.image_tag attribute.

        Also note - This will delete any existing (but out-of-date) image pertaining to the given labbook.
        Thus if this call fails, there will be no docker images pertaining to that labbook.

        Args:
            nocache: Don't user the Docker cache if True
            feedback_callback: a function taking a str as it's sole argument to report progress back to the caller

        Raises:
            ContainerBuildException if container build fails.
        """
        logger.info(f"HubProjectContainer.build_image()")
        url = f"{self._launch_service}/v1/projectbuild"
        data = {"client_id": self._client_id,
                "project_id": None,
                "project_namespace": self.labbook.owner,
                "project_name": self.labbook.name
                }
        response = requests.post(url, json=data)
        if response.status_code != 200:
            raise ContainerException(f"Failed to launch project build in launch service:"
                                     f" {response.status_code} : {response.json()}")

        # Wait for build completion
        start_time = time.time()
        while True:
            time_elapsed = time.time() - start_time
            if time_elapsed > 900:
                raise ContainerException(f"Timed out building project in launch service:"
                                         f" {response.status_code} : {response.json()}")
            resp = requests.get(f"{self._launch_service}/v1/client/{self._client_id}/namespace/{self.labbook.owner}/project/{self.labbook.name}/projectbuild")
            if resp.status_code == 200:
                logger.info(resp.json())
                status = resp.json()["state"]
                if status == "COMPLETE":
                    return None
            elif resp.status_code != 304:
                # back off if the server is throwing errors
                time.sleep(10)
                continue
            time.sleep(0.5)
        return None

    def delete_image(self, override_image_name: Optional[str] = None) -> bool:
        """ Delete the Docker image for the given LabBook

        Args:
            override_image_name: Alternate Tag of docker image (optional)

        Returns:
            Did we succeed? (includes image already non-existent)
        """
        logger.info(f"HubProjectContainer.delete_image()")
        return True

    def image_available(self) -> bool:
        """Do we currently see an up-to-date Docker image?

        Returns:
            True if we've gotten an Image ID stored.
        """
        logger.info(f"HubProjectContainer.image_available()")
        url = f"{self._launch_service}/v1/image_exists/{self.labbook.owner}/{self.labbook.name}"
        try:
            response = requests.get(url)
        except requests.ConnectionError:
            logger.Error("Couldn't connect to {url}.")
            return False
        if response.status_code != 200:
            logger.error("Couldn't determine if image exists.")
            return False
        existsRaw = response.json()["exists"]
        return True if existsRaw == "true" else False

    def run_container(self, cmd: Optional[str] = None, image_name: Optional[str] = None, environment: List[str] = None,
                      volumes: Dict = None, wait_for_output=False, container_name: Optional[str] = None,
                      **run_args) -> Optional[str]:
        """ Start a Docker container, by default for the Project connected to this instance.

        The container should be reachable from the Client network.

        WARNING - wait_for_output by design may lead to an infinite loop. Be careful!

        Args:
            cmd: override the default cmd for the image
            image_name: use a different image than the current build for this Project
            environment: modeled on the containers.run() API
            volumes: same
            wait_for_output: should the method collect and return stdout?
            container_name: by default, container_name will be the same as image_name. Override by passing this argument
            run_args: any other args are passed to containers.run()

        Returns:
            If wait_for_output is specified, the stdout of the cmd. Otherwise, or if stdout cannot be obtained, None.
        """
        logger.info(f"HubProjectContainer.run_container()")
        url = f"{self._launch_service}/v1/project"
        data = {"client_id": self._client_id,
                "project_id": None,
                "project_namespace": self.labbook.owner,
                "project_name": self.labbook.name
                }
        response = requests.post(url, json=data)
        if response.status_code != 200:
            raise ContainerException(f"Failed to start container in launch service:"
                                     f" {response.status_code} : {response.json()}")

        return None

    def stop_container(self, container_name: Optional[str] = None) -> bool:
        """ Stop the given labbook.

        If there's an exception other than a NotFound, that exception is raised.

        Returns:
            A boolean indicating whether the container was successfully stopped (False implies no container
            was running).
        """
        logger.info(f"HubProjectContainer.stop_container()")
        return True

    def query_container(self, container_name: Optional[str] = None) -> Optional[str]:
        """Query the Project container and get its status. E.g., "running" or "stopped"

        Also caches a Container instance in self._container.

        Returns:
            String of container status - "stopped", "running", etc., or None if container is NotFound

        message ProjectStatus {
            string client_id = 1;
            string project_id = 2;
            string state = 3;
        }
        """
        logger.info(f"HubProjectContainer.query_container()")
        url = f"{self._launch_service}/v1/client/{self._client_id}/namespace/{self.labbook.owner}/project/{self.labbook.name}"
        response = requests.get(url)
        if response.status_code != 200:
            logger.info(f"hub_container.query_container(), response status: {response.status_code}")
            return None
        logger.info(f"Project state: {response.json()}")
        projectCRPhase = response.json()["state"]

        if projectCRPhase == "PENDING":
            return "created"
        if projectCRPhase == "BUILDING":
            return "created"
        if projectCRPhase == "BUILT":
            return "created"
        if projectCRPhase == "RUNNING":
            return "running"
        if projectCRPhase == "STOPPED":
            return "exited"

        return None

    def exec_command(self, command: str, container_name: Optional[str] = None, get_results=False,
                     **kwargs) -> Optional[str]:
        """Run a command inside a given container, defaulting to the Project container.

        Args:
            command: e.g., 'ls -la'. This will be tokenized
            container_name: ID string of container in which to run
            get_results: Don't detach - instead wait for the command to finish and return the output as a str
            kwargs: see below for allowed keys, passed to `exec_run` in docker-py

        Returns:
            If get_results is True (or unspecified), a str with output of the command.
            Otherwise, None.
        """
        logger.info(f"HubProjectContainer.exec_command()")
        logger.info(f"HubProjectContainer.run_container()")
        url = f"{self._launch_service}/v1/exec/{self._client_id}/{self.labbook.owner}/{self.labbook.name}"
        data = command
        response = requests.post(url, json=data)
        if response.status_code != 200:
            logger.error(f"Failed to exec into project container {self._client_id}:{self.labbook.owner}/{self.labbook.name}.")
            return None

        if get_results:
            raw_out = response.json()
            output = raw_out.get("stdout", "")
            output = raw_out.get("stderr", "") if output == "" else ""
            return output

        return None

    def query_container_env(self, container_name: Optional[str] = None) -> List[str]:
        """Get the list of environment variables from the container
        Args:
            container_name: an optional container name (otherwise, will use self.image_tag)
        
        Returns:
            A list of strings like 'VAR=value'
        """
        logger.info(f"HubProjectContainer.query_container_env()")
        url = f"{self._launch_service}/v1/client/{self._client_id}/namespace/{self.labbook.owner}/project/{self.labbook.name}"
        response = requests.get(url)
        if response.status_code != 200:
            raise ContainerException(f"Failed to get container environment:"
                f" {response.status_code} : {response.json()}")
        env = response.json()["vars"]
        envvars = ['='.join(kv) for kv in env]
        return envvars

    def query_container_ip(self, container_name: Optional[str] = None) -> str:
        """Query the given container's IP address. Defaults to the Project container for this instance.

        Args:
            container_name: alternative to the current project container. Use anything that works for containers.get()

        Returns:
            IP address as string
        """
        url = f"{self._launch_service}/v1/hostnames/client/{self._client_id}/project/{self.labbook.owner}/{self.labbook.name}"
        response = requests.get(url)
        if response.status_code != 200:
            raise ContainerException(f"Failed to get container hostname:"
                                     f" {response.status_code} : {response.json()}")
        try:
            hostname = response.json()["hostname"]
        except AttributeError:
            raise ContainerException(f"No hostname attribute in response:"
                                     f" {response.json()}")
        logger.info(f"HubProjectContainer.query_container_ip() found: {hostname}")
        return hostname

    def copy_into_container(self, src_path: str, dst_dir: str) -> None:
        """Copy the given file in src_path into the project's container.

        Args:
            src_path: Source path ON THE HOST of the file - callers responsibility to sanitize
            dst_dir: Destination directory INSIDE THE CONTAINER.
        """
        logger.info(f"HubProjectContainer.copy_into_container()")
        raise NotImplemented

    # Utility methods
    def get_gigantum_client_ip(self) -> str:
        """Method to get the monitored lab book container's IP address on the Docker bridge network

        Returns:
            str of IP address
        """
        url = f"{self._launch_service}/v1/hostnames/client/{self._client_id}"
        response = requests.get(url)
        if response.status_code != 200:
            raise ContainerException(f"Failed to get client hostname:"
                f" {response.status_code} : {response.json()}")
        hostname = response.json()["hostname"]
        logger.info(f"HubProjectContainer.get_gigantum_client_ip() found: {hostname}")
        return hostname

    # TODO #1063 - update MITMproxy and related code so it no longer needs this logic
    def container_list(self, ancestor: Optional[str]) -> List[str]:
        """Return a list of containers, optionally only those that are based on `ancestor`

        Args:
            ancestor: the name of an image or container this container is derived from
        """
        logger.info(f"HubProjectContainer.container_list")
        raise NotImplemented

    def start_project_container(self):
        """Start the Docker container for the Project connected to this instance.

        Expects the Hub API to set the Client hostname to the environment variable `GIGANTUM_CLIENT_IP`

        All relevant configuration for a fully functional Project is set up here, then passed off to self.run_container()
        """
        logger.info(f"HubProjectContainer.start_project_container")
        if not self.labbook:
            raise ValueError('labbook must be specified for run_container')

        if not os.environ.get('HOST_WORK_DIR'):
            raise ValueError("Environment variable HOST_WORK_DIR must be set")

        self.run_container()
