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
        else:
            raise GigantumException("TODO DJWC - still need to implement arbitrary mount configuration")

        if subdirectory is not None:
            self.host_mount_path /= subdirectory

    @staticmethod
    def _backend_metadata() -> Dict[str, Any]:
        """Storage Backend metadata used to render the UI.

        Returns:
            Info for use of LocalFilesystemBackend
        """
        return {"storage_type": "gigantum_object_v1",
                "name": "Gigantum Cloud",
                "description": "Dataset storage provided by your Gigantum account supporting files up to 5GB in size",
                "tags": ["gigantum"],
                "icon": "gigantum_object_storage.png",
                "url": "https://docs.gigantum.com",
                "readme": __doc__}

    def client_files_root(self, revision: str) -> Path:
        """In the local files case, the host mount path doesn't move around!"""
        return self.host_mount_path
