"""Local-only Datasets are mounted into your Projects from the host machine. This allows for great flexiblity, but you
are responsible for managing data files - syncrhonization logic is implemented *only for metadata*.
"""
from pathlib import Path

from gtmcore.dataset.storage.backend import StorageBackend
from typing import Optional, Dict, Any

from gtmcore.exceptions import GigantumException
from gtmcore.logging import LMLogger
from gtmcore.configuration import Configuration

logger = LMLogger.get_logger()


class LocalFilesystemBackend(StorageBackend):

    def __init__(self, client_config: Configuration, mount: str, subdirectory: Optional[str] = None):
        """Configure the local data directory for mounting into the Project container

        Args:
            client_config: Configuration() instance
            mount: named mount-point, note that 'default' is reserved and points to <gigantum dir>/local_data
            subdirectory: a subdirectory within the mount, will be created on Project launch if it doesn't exist
              (validation should be handled prior to instantiating the backend)
        """
        if mount == 'default':
            host_dir = client_config.get_host_work_path()
            self.host_mount_path = host_dir / 'local_data'
            self.client_path = Path(client_config.app_workdir) / 'local_data'
        else:
            raise GigantumException("TODO - still need to implement arbitrary mount configuration")

        if subdirectory is not None:
            self.host_mount_path /= subdirectory
            self.client_path /= subdirectory

    @staticmethod
    def _backend_metadata() -> Dict[str, Any]:
        """Storage Backend metadata used to render the UI.

        Returns:
            Info for use of LocalFilesystemBackend
        """
        return {"storage_type": "local_filesystem",
                "name": "Local-only data",
                "description": "Use any data you copy into the local_data directory",
                "tags": ["local"],
                "icon": "gigantum_object_storage.png",  # TODO change to something else
                "url": "https://docs.gigantum.com",
                "readme": __doc__}

    def client_files_root(self, revision: str) -> Path:
        """In the local files case, the host mount path doesn't move around!"""
        return self.client_path
