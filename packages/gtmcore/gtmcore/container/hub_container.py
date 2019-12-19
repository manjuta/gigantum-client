import json
import os
import time
from typing import Optional, Callable, List, Dict
import requests

from gtmcore.container.container import ContainerOperations, _check_allowed_args, logger
from gtmcore.container.exceptions import ContainerBuildException, ContainerException
from gtmcore.dataset.cache import get_cache_manager_class
from gtmcore.inventory.inventory import InventoryManager, InventoryException
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
        self._launch_service = os.environ['LAUNCH_SERVICE_URL']
        self._client_id = os.environ['GIGANTUM_CLIENT_ID']

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
        # Handle the case where the feedback callback isn't set by logging the messages instead
        def _dummy_feedback(msg: str) -> None:
            logger.info(f"hub_container.build_image feedback: {msg}")

        if not feedback_callback:
            feedback_callback = _dummy_feedback

        if self.check_cached_hash(self.image_tag, self.env_dir) == 'match':
            if self.image_available():
                # No need to build!
                logger.info(f"Reusing Docker image for {str(self.labbook)}")
                feedback_callback(f"No environment changes detected. Reusing existing image.")
                return

        feedback_callback(f"Starting Project container build. Please wait.\n\n Note, build output is not yet available "
                          f"when running in Gigantum Hub. If you need to debug an environment configuration and "
                          f"require the build output, you must run the Client locally.")

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
        build_timeout_seconds = self.labbook.client_config.config['container']['build_timeout']
        while True:
            time_elapsed = time.time() - start_time
            if time_elapsed > int(build_timeout_seconds):
                feedback_callback("Container build timed out. If this problem persists, contact support@gigantum.com")
                raise ContainerException(f"Timed out building project in launch service:"
                                         f" {response.status_code} : {response.json()}")
            resp = requests.get(f"{self._launch_service}/v1/client/{self._client_id}/namespace/{self.labbook.owner}/"
                                f"project/{self.labbook.name}/projectbuild")
            if resp.status_code == 200:
                logger.info(f"HubProjectContainer.build_image() in progress: {resp.json()}")
                status = resp.json()["state"]
                if status == "COMPLETE":
                    feedback_callback("Container build complete")
                    return None
            elif resp.status_code != 304:
                # back off if the server is throwing errors
                time.sleep(5)
                continue
            time.sleep(1)

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
        logger.debug(f"HubProjectContainer.image_available()")
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
                      volumes: Optional[Dict] = None, wait_for_output=False, container_name: Optional[str] = None,
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
        logger.info(f"volumes: {volumes}")
        url = f"{self._launch_service}/v1/project"
        data = {"client_id": self._client_id,
                "project_id": None,
                "project_namespace": self.labbook.owner,
                "project_name": self.labbook.name,
                "volumes": volumes
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
        logger.debug(f"HubProjectContainer.stop_container()")
        url = f"{self._launch_service}/v1/client/{self._client_id}/namespace/{self.labbook.owner}/project/{self.labbook.name}"
        response = requests.delete(url)
        if response.status_code != 200:
            logger.error(f"hub_container.stop_container(), response status: {response.status_code}")
            raise ContainerException(f"Failed to stop Project container.")

        logger.debug(f"Project state: {response.json()}")
        projectCRPhase = response.json()["state"]

        if projectCRPhase == "STOPPED":
            return True

        return False

    def query_container(self, container_name: Optional[str] = None) -> Optional[str]:
        """Query the Project container and get its status. E.g., "running" or "stopped"

        Returns:
            String of container status - "stopped", "running", etc., or None if container is NotFound

        message ProjectStatus {
            string client_id = 1;
            string project_id = 2;
            string state = 3;
        }
        """
        logger.debug(f"HubProjectContainer.query_container()")
        url = f"{self._launch_service}/v1/client/{self._client_id}/namespace/{self.labbook.owner}/project/{self.labbook.name}"

        project_cr_phase = None
        for cnt in range(10):
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    logger.debug(f"Project state: {response.json()}")
                    project_cr_phase = response.json()["state"]
                    break
                elif response.status_code == 404:
                    return None
                else:
                    logger.info(f"Fetching Project state not yet ready: {response.status_code} : {response.json()}")
            except requests.exceptions.ConnectionError:
                pass

            time.sleep(1)

        if not project_cr_phase:
            logger.error(f"Failed to fetch container status after retries.")
            return None

        if project_cr_phase == "PENDING":
            return "created"
        if project_cr_phase == "BUILDING":
            return "created"
        if project_cr_phase == "BUILT":
            return "created"
        if project_cr_phase == "RUNNING":
            return "running"
        if project_cr_phase == "STOPPED":
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
        logger.debug(f"HubProjectContainer.exec_command()")
        url = f"{self._launch_service}/v1/exec/{self._client_id}/{self.labbook.owner}/{self.labbook.name}"
        data = {
            "cmd": command,
            "detach": not get_results
        }
        response = requests.post(url, json=data)

        if response.status_code != 200:
            logger.error(f"Failed to exec into project container {self._client_id}:{self.labbook.owner}/{self.labbook.name}.")
            return None

        if get_results:
            raw_out = response.json()
            output = raw_out.get("stdout", "")
            output = raw_out.get("stderr", "") if output == "" else output
            return output

        return None

    def query_container_env(self, container_name: Optional[str] = None) -> List[str]:
        """Get the list of environment variables from the container
        Args:
            container_name: an optional container name (otherwise, will use self.image_tag)

        Returns:
            A list of strings like 'VAR=value'
        """
        logger.debug(f"HubProjectContainer.query_container_env()")
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
        logger.warning(f"HubProjectContainer.copy_into_container()")
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

    def start_project_container(self):
        """Start the Docker container for the Project connected to this instance.

        Expects the Hub API to set the Client hostname to the environment variable `GIGANTUM_CLIENT_IP`

        All relevant configuration for a fully functional Project is set up here, then passed off to self.run_container()
        """
        logger.debug(f"HubProjectContainer.start_project_container")
        if not self.labbook:
            raise ValueError('labbook must be specified for run_container')

        if not os.environ.get('HOST_WORK_DIR'):
            raise ValueError("Environment variable HOST_WORK_DIR must be set")

        mnt_point = self.labbook.root_dir.replace('/mnt/gigantum', os.environ['HOST_WORK_DIR'])

        volumes_dict = {
            mnt_point: {'bind': '/mnt/labbook', 'mode': 'cached'},
            'labmanager_share_vol': {'bind': '/mnt/share', 'mode': 'rw'}
        }

        # Set up additional bind mounts for datasets if needed.
        datasets = InventoryManager().get_linked_datasets(self.labbook)
        for ds in datasets:
            try:
                cm_class = get_cache_manager_class(ds.client_config)
                cm = cm_class(ds, self.username)
                ds_cache_dir = cm.current_revision_dir.replace('/mnt/gigantum', os.environ['HOST_WORK_DIR'])
                volumes_dict[ds_cache_dir] = {'bind': f'/mnt/labbook/input/{ds.name}', 'mode': 'ro'}
            except InventoryException:
                continue

        self.run_container(volumes=volumes_dict)

    def open_ports(self, port_list: List[int]) -> None:
        """A method to dynamically open ports to a running container. Locally this isn't really needed, but in the hub
        it is required

        Args:
            port_list: list of ports to open

        Returns:
            None
        """
        url = f"{self._launch_service}/v1/project"

        data = {
            "client_id": self._client_id,
            "project_namespace": self.labbook.owner,
            "project_name": self.labbook.name,
            "ports": port_list
        }

        response = requests.put(url, data=json.dumps(data))
        if response.status_code != 200:
            raise ContainerException(f"Failed to opened ports {port_list} for {self.labbook.owner}/{self.labbook.name}"
                                     f":: {response.status_code} :: {response.json()}")

        logger.info(f"Opened ports {port_list} for {self.labbook.owner}/{self.labbook.name} dynamically.")

    def configure_dev_tool(self, dev_tool: str) -> None:
        """A method to configure a dev tool if needed. This is to be inserted right before starting the tool process,
        so it lets you configure things after the giguser is created and everything is set up, but before the dev
        tool process starts. This method exists here, because projects running in different contexts (e.g. hub, local)
        may require different configuration.

        Args:
            dev_tool: dev tool to configure (i.e jupyterlab, notebook, rstudio)

        Returns:
            None
        """
        if dev_tool == "jupyterlab" or dev_tool == "notebook":
            self.exec_command("mkdir -p /home/giguser/.jupyter/custom/", get_results=True)
            cmd = "echo \"define(['base/js/namespace'],function(Jupyter){Jupyter._target='_self';});\" >> /home/giguser/.jupyter/custom/custom.js"
            self.exec_command(cmd, get_results=True)

        elif dev_tool == "rstudio":
            # No configuration needed for rstudio
            pass
        else:
            raise ValueError(f"Unsupported development tool type '{dev_tool}' when trying to configure pre-launch.")
