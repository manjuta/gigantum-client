# Copyright (c) 2017 FlashX, LLC
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
import os
import re
import glob
import datetime

from git import Repo
from docker.errors import ImageNotFound, NotFound, APIError
import yaml

from gtm.common.console import ask_question
from gtm.common.dockerutil import get_docker_client
from gtm.common import get_resources_root, get_client_root


class LabManagerBuilder(object):
    """Class to manage building the gigantum client container
    """
    def __init__(self, image_name: str):
        """Constructor"""
        self.image_name = image_name
        self._container_name = None
        self.docker_client = get_docker_client()

    @staticmethod
    def _get_current_commit_hash() -> str:
        """Method to get the current commit hash of the gtm repository

        Returns:
            str
        """
        # Get the path of the root directory
        repo = Repo(get_client_root())
        return repo.head.commit.hexsha

    def _remove_pyc(self, directory: str) -> None:
        """Method to remove all pyc files recursively

        Args:
            directory(str) Root directory to walk

        Returns:

        """
        for filename in glob.glob('{}/**/*.pyc'.format(directory), recursive=True):
                os.remove(filename)

    def get_image_tag(self) -> str:
        """Method to generate a named tag for the Docker Image

        Returns:
            str
        """
        return self._get_current_commit_hash()[:8]

    def _generate_container_name(self) -> str:
        """Method to generate a name for the Docker container

        Returns:
            str
        """
        return self.image_name.replace("/", ".")

    @property
    def container_name(self) -> str:
        """Get the name of the LabManager container

        Returns:
            str8
        """
        if not self._container_name:
            self._container_name = self._generate_container_name()
        return self._container_name

    @container_name.setter
    def container_name(self, value: str) -> None:
        # Validate
        if not re.match("^(?![-\.])(?!.*--)[A-Za-z0-9_.-]+(?<![-\.])$", value):
            raise ValueError("Invalid container name. Only A-Za-z0-9._- allowed w/ no leading/trailing hyphens.")

        self._container_name = value

    def image_exists(self, name) -> bool:
        """Method to check if a Docker image exists

        Returns:
            bool
        """
        # Check if image exists
        try:
            self.docker_client.images.get(name)
            return True
        except ImageNotFound:
            return False

    def remove_image(self, image_name: str) -> None:
        """Remove a docker image by name

        Args:
            image_name(str): Name of the docker image to remove

        Returns:
            None
        """
        # Remove stopped container if it exists
        self.prune_container(image_name)

        # Remove image
        self.docker_client.images.remove(image_name)

    def prune_container(self, container_name: str) -> None:
        """Remove a docker container by name

        Args:
            container_name(str): Name of the docker container to remove

        Returns:
            None
        """
        # Remove stopped container if it exists
        try:
            # Replace / with . if the repo is in the image name
            container_name = container_name.replace("/", ".")

            build_container = self.docker_client.containers.get(container_name)
            build_container.remove()
        except NotFound:
            pass

    def build_image(self, show_output: bool=False, no_cache: bool=False,
                    build_args: dict=None, docker_args: dict=None) -> None:
        """Method to build the Gigantum Client Docker Image

        Args:
            show_output(bool): Flag indicating if method should print output
            no_cache(bool): Flag indicating if the docker cache should be ignored
            build_args(dict): Variables to prepare files for build
            docker_args(dict): Variables passed to docker during the build process

        build_args items:
            supervisor_file: The path to the target supervisor file to move into build dir
            config_override_file: The path to the target config file override file to use to render
                                  the

        docker_args items:
            CLIENT_CONFIG_FILE: The client config file
            NGINX_UI_CONFIG: Nginx config file for the UI
            NGINX_API_CONFIG: Nginx config file for the API
            SUPERVISOR_CONFIG: Supervisord config file
            ENTRYPOINT_FILE: Entrypoint file

        Returns:
            None
        """
        self.docker_client = get_docker_client()
        client_root_dir = get_client_root()
        build_dir = os.path.join(client_root_dir, build_args['build_dir'])
        if os.path.exists(build_dir) is False:
            os.makedirs(build_dir)

        named_image = "{}:{}".format(self.image_name, self.get_image_tag())
        if self.image_exists(named_image):
            # Image found. Make sure container isn't running.
            self.prune_container(named_image)

        # Write updated config file
        base_config_file = os.path.join(client_root_dir, "packages", 'gtmcore', 'gtmcore',
                                        'configuration', 'config', 'labmanager.yaml.default')
        final_config_file = docker_args['CLIENT_CONFIG_FILE']

        with open(base_config_file, "rt") as cf:
            base_data = yaml.load(cf)
        with open(os.path.join(client_root_dir, build_args['config_override_file']), "rt") as cf:
            overwrite_data = yaml.load(cf)

        # Merge sub-sections together
        for key in base_data:
            if key in overwrite_data:
                base_data[key].update(overwrite_data[key])

        # Add Build Info
        base_data['build_info'] = {'application': "LabManager",
                                   'built_on': str(datetime.datetime.utcnow()),
                                   'revision': self._get_current_commit_hash()}

        # Write out updated config file
        with open(os.path.join(client_root_dir, final_config_file), "wt") as cf:
            cf.write(yaml.dump(base_data, default_flow_style=False))

        # Write final supervisor file to set CHP parameters
        base_supervisor = os.path.join(client_root_dir, build_args['supervisor_file'])
        final_supervisor = os.path.join(client_root_dir, docker_args['SUPERVISOR_CONFIG'])

        with open(base_supervisor, 'rt') as source:
            with open(final_supervisor, 'wt') as dest:
                supervisor_data = source.read()

                ext_proxy_port = base_data['proxy']["external_proxy_port"]
                api_port = base_data['proxy']['api_port']

                dest.write(f"""{supervisor_data}\n\n
[program:chp]
command=configurable-http-proxy --ip=0.0.0.0 --port={ext_proxy_port} --api-port={api_port} --default-target='http://localhost:10002'
autostart=true
autorestart=true
priority=0""")

        # Image Labels
        labels = {'io.gigantum.app': 'client',
                  'io.gigantum.revision': self._get_current_commit_hash(),
                  'io.gigantum.maintainer.email': 'support@gigantum.com'}

        # Delete .pyc files in case dev tools used on something not ubuntu before building
        self._remove_pyc(os.path.join(client_root_dir, "packages"))

        # Build image
        dockerfile_path = os.path.join(client_root_dir, 'resources', 'docker', 'Dockerfile')
        print("\n\n*** Building Gigantum Client image `{}`, please wait...\n\n".format(self.image_name))
        if show_output:
            [print(ln[list(ln.keys())[0]],
                   end='') for ln in self.docker_client.api.build(path=client_root_dir,
                                                                  dockerfile=dockerfile_path,
                                                                  tag=named_image,
                                                                  labels=labels, nocache=no_cache,
                                                                  pull=True, rm=True,
                                                                  decode=True,
                                                                  buildargs=docker_args)]
        else:
            self.docker_client.images.build(path=client_root_dir, dockerfile=dockerfile_path,
                                            tag=named_image, nocache=no_cache,
                                            pull=True, labels=labels, buildargs=docker_args)

        # Tag with `latest` for auto-detection of image on launch
        # TODO: Rename container to gigantum/client
        self.docker_client.api.tag(named_image, self.image_name, 'latest')

    def publish(self, image_tag: str = None, verbose=False) -> None:
        """Method to push image to the logged in image repository server (e.g hub.docker.com)

        Args:
            image_tag(str): full image tag to publish

        Returns:
            None
        """
        # If no tag provided, use current repo hash
        if not image_tag:
            image_tag = self.get_image_tag()

        if verbose:
            [print(ln[list(ln.keys())[0]]) for ln in self.docker_client.api.push('gigantum/labmanager', tag=image_tag,
                                                                                 stream=True, decode=True)]
        else:
            self.docker_client.images.push('gigantum/labmanager', tag=image_tag)

        self.docker_client.images.push('gigantum/labmanager', tag='latest')

    def publish_edge(self, image_tag: str = None, verbose=False) -> None:
        """Method to push image to the logged in image repository server (e.g hub.docker.com)

        Args:
            image_tag(str): full image tag to publish

        Returns:
            None
        """
        # If no tag provided, use current repo hash
        if not image_tag:
            image_tag = self.get_image_tag()

        # Re-tag current labmanager build as edge locally
        self.docker_client.images.get('gigantum/labmanager:latest').tag(f'gigantum/labmanager-edge:{image_tag}')
        self.docker_client.images.get(f'gigantum/labmanager-edge:{image_tag}').tag('gigantum/labmanager-edge:latest')

        if verbose:
            [print(ln[list(ln.keys())[0]]) for ln in self.docker_client.api.push('gigantum/labmanager-edge',
                                                                                 tag=image_tag,
                                                                                 stream=True, decode=True)]
        else:
            self.docker_client.images.push('gigantum/labmanager-edge', tag=image_tag)

        self.docker_client.images.push('gigantum/labmanager-edge', tag='latest')

    def publish_demo(self, image_tag: str = None, verbose=False) -> None:
        """Method to push a cloud demo image to the logged in image repository server (e.g hub.docker.com)

        Args:
            image_tag(str): full image tag to publish

        Returns:
            None
        """
        # If no tag provided, use current repo hash
        if not image_tag:
            image_tag = self.get_image_tag()

        # Re-tag current labmanager build as edge locally
        self.docker_client.images.get('gigantum/labmanager:latest').tag(f'gigantum/gigantum-cloud-demo:{image_tag}')
        self.docker_client.images.get(f'gigantum/gigantum-cloud-demo:{image_tag}').tag('gigantum/gigantum-cloud-demo:latest')

        if verbose:
            [print(ln[list(ln.keys())[0]]) for ln in self.docker_client.api.push('gigantum/gigantum-cloud-demo',
                                                                                 tag=image_tag,
                                                                                 stream=True, decode=True)]
        else:
            self.docker_client.images.push('gigantum/gigantum-cloud-demo', tag=image_tag)

        self.docker_client.images.push('gigantum/gigantum-cloud-demo', tag='latest')

    def cleanup(self, dev_images=False):
        """Method to clean up old gigantum/labmanager images

        Args:
            dev_images(bool): If true, cleanup gigantum/labmanager-dev images instead

        Returns:
            None
        """
        if dev_images:
            image_name = "gigantum/labmanager-dev"
        else:
            image_name = "gigantum/labmanager"

        images = self.docker_client.images.list(image_name)

        cnt = 0
        for image in images:
            if any(['latest' in x for x in image.tags]):
                continue
            cnt += 1

        if cnt == 0:
            print(f" - No old {image_name} images to remove\n")
            return None

        if not ask_question(f"\nDo you want to remove {cnt} old {image_name} images?"):
            print(" - Prune operation cancelled\n")
            return None

        print(f"\nRemoving old {image_name} images:")
        for image in images:
            if image.tags:
                if any(['latest' in x for x in image.tags]):
                    continue
                print(f" - Removing {image.tags[0]}")
                try:
                    self.docker_client.images.remove(image.id, force=True)
                except APIError:
                    print(f"Error trying to remove image, skipping {image.id}")
