from pathlib import Path
import shutil
import docker


class ProjectHelperUtility(object):
    """Helper utility for project directory"""

    def delete_local_project(self, project_title: str, username: str) -> bool:
        """Removes the project directories.

        Args:
            project_title: Name of the created project
            username: Name of the current user
        """
        directories = ['labbooks']
        self.__stop_containers()
        self.__delete_local_images(project_title)
        for directory in directories:
            self.__delete_directory(project_title, username, directory)
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

    def __delete_local_images(self, project_title: str) -> bool:
        """Removes the local project images

        Args:
            project_title: Name of the created project
        """
        images = docker.from_env().images.list()
        for image in images:
            for tag in image.tags:
                if 'gmlb-' in tag and project_title in tag:
                    docker.from_env().images.remove(image.id, force=True, noprune=False)
        return True

    def __delete_directory(self, project_title: str, username: str, directory_name: str) -> bool:
        """Deletes project directory.

        Args:
            project_title: Name of the project
            username: Name of the current user
            directory_name: Name of the directory to remove
        """
        home_dir = Path('~/gigantum').expanduser()
        user_project = home_dir / username / username / directory_name / project_title
        if user_project.exists():
            shutil.rmtree(user_project)
            return True
        else:
            return False
