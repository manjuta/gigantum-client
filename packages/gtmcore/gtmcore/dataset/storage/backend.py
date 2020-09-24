import abc
import os
from pathlib import Path

from pkg_resources import resource_filename
from typing import List, Callable, Dict, Any
import base64

from gtmcore.configuration import Configuration
from gtmcore.dataset.io import PullObject, PullResult


class StorageBackend(metaclass=abc.ABCMeta):
    """Parent class for Dataset storage backends

    The subclass should provide an ability to check current hashes of local files against known hashes (and optionally
    remote hashes). A StorageBackend will also provide the basic functionality required to copy data to or from a
    remote, including authentication."""
    @abc.abstractmethod
    def __init__(self, client_config: Configuration, **backend_config: Dict[str, Any]):
        """Subclasses should generally handle client_config followed by additional arguments"""
        pass

    @property
    def storage_type(self) -> str:
        """Return the string identifier for the dataset's storage class"""
        return self._backend_metadata()['storage_type']

    @staticmethod
    @abc.abstractmethod
    def _backend_metadata() -> Dict[str, Any]:
        """Method to specify Storage Backend metadata for each implementation. This is used to render the UI

        Simply implement this method in a child class. Note, 'icon' should be the name of the icon file saved in the
        thumbnails directory. It should be a 128x128 px PNG image.

        Returns:
            Info for use of the backend, something like:
                {"storage_type": "a_unique_identifier",
                 "name": "My Dataset Type",
                 "description": "Short string",
                 "readme": "Long string",
                 "icon": "my_icon.png",
                 "url": "http://moreinfo.com"
                }
        """
        pass

    @classmethod
    def metadata(cls) -> Dict[str, Any]:
        """

        Returns:

        """
        metadata = cls._backend_metadata()

        dataset_pkg_dir = resource_filename('gtmcore', 'dataset')
        icon_file = os.path.join(dataset_pkg_dir, 'storage', 'thumbnails', metadata['icon'])

        with open(icon_file, 'rb') as icf:
            metadata['icon'] = base64.b64encode(icf.read()).decode("utf-8")

        return metadata

    @abc.abstractmethod
    def client_files_root(self, revision: str) -> Path:
        """All backends must be able to provide a path on the client where files are located

        Args:
            revision: Will generally be the current revision of the Dataset git repo, OK to ignore but must accept!
        """
        pass

    def prepare_mount_source(self, revision: str) -> Path:
        """Do any needed steps so we're ready to mount files into Project containers

        Note that this may be revision-specific, but revision can also be ignored. It's fine not to override this
        method if no setup is needed!
        """
        return self.client_files_root(revision)

    # TODO DJWC delete these commented functions
    # def hash_file_key_list(self, dataset, keys):
    #     m = Manifest(dataset, self.configuration.get('username'))
    #     loop = asyncio.get_event_loop()
    #     hash_task = asyncio.create_task(m.hasher.hash(keys))
    #     loop.run_until_complete(hash_task)
    #     return hash_task.result()

    # def verify_contents(self, dataset, status_update_fn: Callable) -> List[str]:
    #     """Method to verify the hashes of all local files and indicate if they have changed

    #     Args:
    #         dataset: Dataset object
    #         status_update_fn: A callable, accepting a string for logging/providing status to the UI

    #     Returns:
    #         list
    #     """
    #     if 'username' not in self.configuration:
    #         raise ValueError("Dataset storage backend requires current logged in username to verify contents")

    #     m = Manifest(dataset, self.configuration.get('username'))
    #     keys_to_verify = list()
    #     for item in m.manifest:
    #         if os.path.isfile(os.path.join(m.cache_mgr.cache_root, m.dataset_revision, item)):
    #             # File exists locally
    #             keys_to_verify.append(item)

    #     # re-hash files
    #     status_update_fn(f"Validating contents of {len(keys_to_verify)} files. Please wait.")
    #     updated_hashes = self.hash_file_key_list(dataset, keys_to_verify)

    #     modified_items = list()
    #     for key, new_hash in zip(keys_to_verify, updated_hashes):
    #         item = m.manifest.get(key)
    #         if item:
    #             if new_hash != item.get('h'):
    #                 modified_items.append(key)

    #     if modified_items:
    #         status_update_fn(f"Integrity check complete. {len(modified_items)} files have been modified.")
    #     else:
    #         status_update_fn(f"Integrity check complete. No files have been modified.")

    #     return modified_items


class ExternalProtectedStorage(StorageBackend):
    """A place-holder class to allow us to generically refer to PublicS3Bucket and similar (as yet unwritten) classes.

    Instances of this class will require credentials.

    Once other descendants are implemented, this can be moved to some generic place. Keeping it in the same file as the
    S3 backend for now to facilitate rapid iteration.
    """

    @abc.abstractmethod
    def set_credentials(self, credentials: Dict[str, str]):
        pass

    @property
    def has_credentials(self) -> bool:
        """Boolean property indicating if a storage backend has all required config items set.

        We may ultimately want a third option for invalid credentials."""
        raise NotImplementedError

    def prepare_pull(self, dataset, objects: List[PullObject]) -> None:
        """Method to prepare a backend for pulling objects locally. It's optional to implement as not all back-ends
        support pull

        Args:
            dataset: The dataset instance
            objects: A list of PullObjects, indicating which objects to pull
        """
        raise NotImplementedError

    def pull_objects(self, dataset, objects: List[PullObject], progress_update_fn: Callable) -> PullResult:
        """Method to pull objects locally. It's optional to implement as not all back-ends
        support pull


        Args:
            dataset: The dataset instance
            objects: A list of PullObjects, indicating which objects to pull
            progress_update_fn: A callable with arg "completed_bytes" (int) indicating how many bytes have been
                                downloaded in since last called

        Returns:
            PullResult
        """
        raise NotImplementedError

    def finalize_pull(self, dataset) -> None:
        """Method to finalize and cleanup a backend after pulling objects locally

        Args:
            dataset: The dataset instance

        Returns:

        """
        raise NotImplementedError
