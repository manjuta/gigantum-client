"""Local-only Datasets are mounted into your Projects from the host machine. This allows for great flexiblity, but you
are responsible for managing data files - syncrhonization logic is implemented *only for metadata*.
"""

import shutil
import copy
from pathlib import Path

from gtmcore.dataset import Dataset
from gtmcore.dataset.storage.backend import StorageBackend
from typing import Callable, Optional, Dict, Any
import os

from gtmcore.exceptions import GigantumException
from gtmcore.logging import LMLogger
from gtmcore.configuration import Configuration
from gtmcore.dataset.manifest.manifest import Manifest, StatusResult

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
        super().__init__(client_config)

        if mount == 'default':
            host_dir = client_config.get_host_work_path()
            self.host_mount_path = host_dir / 'local_data'
        else:
            raise GigantumException("TODO DJWC - still need to implement arbitrary mount configuration")

        if subdirectory is not None:
            self.host_mount_path /= subdirectory

    def _backend_metadata(self) -> dict:
        """Method to specify Storage Backend metadata for each implementation. This is used to render the UI

        Simply implement this method in a child class. Note, 'icon' should be the name of the icon file saved in the
        thumbnails directory. It should be a 128x128 px PNG image.

        Returns:
            dict
        """
        return {"storage_type": "gigantum_object_v1",
                "name": "Gigantum Cloud",
                "description": "Dataset storage provided by your Gigantum account supporting files up to 5GB in size",
                "tags": ["gigantum"],
                "icon": "gigantum_object_storage.png",
                "url": "https://docs.gigantum.com",
                "readme": __doc__}

    # TODO DJWC Moving logic up to dataset_jobs
    def update_from_local(self, dataset: Dataset, status_update_fn: Callable,
                          verify_contents: bool = False,
                          status_result: Optional[StatusResult] = None) -> None:
        """Method to update the dataset manifest for changed files that exists locally

        Args:
            dataset: Dataset object
            status_update_fn: A callable, accepting a string for logging/providing status to the UI
            verify_contents: Boolean indicating if "verify_contents" should be run, and the results added to modified
            status_result: Optional StatusResult object to include in the update (typically from update_from_remote())

        Returns:
            None
        """
        if 'username' not in self.configuration:
            raise ValueError("Dataset storage backend requires current logged in username to verify contents")
        m = Manifest(dataset, self.configuration.get('username'))

        status_update_fn("Updating Dataset manifest from local file state.")

        if (status_result is not None) and (status_result.modified is not None):
            modified_keys = copy.deepcopy(status_result.modified)
        else:
            modified_keys = list()

        if verify_contents:
            modified_keys.extend(self.verify_contents(dataset, status_update_fn))

        # Create StatusResult to force modifications
        if status_result:
            created_result = copy.deepcopy(status_result.created)
            # Check if any directories got created
            for key in status_result.created:
                if key[-1] != '/':
                    # a file
                    if os.path.dirname(key) not in m.manifest:
                        # Add the directory to the manifest
                        created_result.append(f"{os.path.dirname(key)}/")

            created_result = list(set(created_result))
            if '/' in created_result:
                created_result.remove('/')

            # Combine a previous StatusResult object (typically from "update_from_remote")
            status = StatusResult(created=created_result,
                                  modified=modified_keys,
                                  deleted=status_result.deleted)
        else:
            status = StatusResult(created=[], modified=modified_keys, deleted=[])

        # Update the manifest
        previous_revision = m.dataset_revision

        m.update(status)
        m.create_update_activity_record(status)

        # Link the revision dir
        m.link_revision()
        if os.path.isdir(os.path.join(m.cache_mgr.cache_root, previous_revision)):
            shutil.rmtree(os.path.join(m.cache_mgr.cache_root, previous_revision))

        status_update_fn("Update complete.")
