import shutil
import copy

from gtmcore.dataset.storage.backend import StorageBackend
from typing import Callable, Optional
import os

from gtmcore.logging import LMLogger
from gtmcore.configuration import Configuration
from gtmcore.dataset.manifest.manifest import Manifest, StatusResult

logger = LMLogger.get_logger()


class LocalFilesystemBackend(StorageBackend):

    def _backend_metadata(self) -> dict:
        """Method to specify Storage Backend metadata for each implementation. This is used to render the UI

        Simply implement this method in a child class. Note, 'icon' should be the name of the icon file saved in the
        thumbnails directory. It should be a 128x128 px PNG image.

        Returns:
            dict
        """
        return {"storage_type": "local_filesystem",
                "name": "Local Filesystem",
                "description": "Dataset type to use locally stored data. No files will sync with this dataset type.",
                "tags": ["local"],
                "icon": "local_filesystem.png",
                "url": "https://docs.gigantum.com",
                "readme": """Local Filesystem datasets simply mount a local directory for use inside your projects. 
For security reasons, only folders located the 'local_data' directory inside of your Gigantum working directory 
can be specified as the dataset root folder. This means you either need to place data there or symlink it. To learn
more, check out the docs here: [https://docs.gigantum.com](https://docs.gigantum.com)
"""}

    def _get_local_data_dir(self) -> str:
        """Method to get the local data directory inside the current container

        Returns:
            str
        """
        working_dir = Configuration().config['git']['working_directory']
        data_dir = self.configuration.get("Data Directory")
        if not data_dir:
            raise ValueError("Data Directory must be specified.")

        return os.path.join(working_dir, 'local_data', data_dir)

    @staticmethod
    def can_update_from_remote() -> bool:
        """Property indicating if this backend can automatically update its contents to the latest on the remote

        Returns:
            bool
        """
        return False

    def update_from_local(self, dataset, status_update_fn: Callable,
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
