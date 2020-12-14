from pathlib import Path
import shutil
import docker
from configuration.configuration import ConfigurationManager
from framework.factory.models_enums.constants_enums import LoginUser


class ProjectHelperUtility(object):
    """Helper utility for project directory"""

    def delete_local_project(self) -> bool:
        """Removes the project directories"""
        directories = ['labbooks']
        self.__stop_containers()
        self.__delete_local_images()
        for directory in directories:
            self.__delete_directory(directory)
        return True

    def __stop_containers(self) -> bool:
        """Stops the project containers"""
        containers = docker.from_env().containers.list()
        for container in containers:
            for tag in container.image.tags:
                if 'gmlb-' in tag:
                    container.stop()
        docker.from_env().containers.prune()
        return True

    def __delete_local_images(self) -> bool:
        """Removes the local project images"""
        images = docker.from_env().images.list()
        for image in images:
            for tag in image.tags:
                if 'gmlb-' in tag and 'p-' in tag:
                    docker.from_env().images.remove(image.id, force=True, noprune=False)
        return True

    def __delete_directory(self, directory_name: str) -> bool:
        """Deletes project directory.

        Args:
            directory_name: Name of the directory to remove
        """
        user_credentials = ConfigurationManager.getInstance().get_user_credentials(LoginUser.User1)
        username = user_credentials.user_name
        home_dir = Path('~/gigantum').expanduser()
        # Only the option for the default server set in configuration is taken up.
        # Fetching the current server id is not included.
        if ConfigurationManager.getInstance().get_app_setting("default_server"):
            server_name = ConfigurationManager.getInstance().get_app_setting("default_server")
        else:
            return False
        user_directory = home_dir / 'servers' / server_name / username / username / directory_name
        user_projects = user_directory.glob('p-*')
        if user_projects:
            for project in user_projects:
                if project.exists():
                    shutil.rmtree(user_directory / project.name)
        return True
