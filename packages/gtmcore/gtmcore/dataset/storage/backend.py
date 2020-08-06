import abc
import os
from pkg_resources import resource_filename
from typing import Optional, List, Dict, Callable
import base64
import asyncio

from gtmcore.dataset.io import PullObject, PullResult
from gtmcore.dataset.manifest.manifest import Manifest
from gtmcore.dataset.manifest.eventloop import get_event_loop


class StorageBackend(metaclass=abc.ABCMeta):
    """Parent class for Dataset storage backends"""

    def __init__(self):
        # Optional configuration data that is in the form of key-value pairs
        # No nesting of values is supported
        # Configuration is populated from the Dataset at runtime (via a file and in-memory secrets)
        self.configuration = dict()

        # Attributes used to store the required keys for a backend
        self._required_configuration_params = [{'parameter': 'username',
                                                'description': "the Gigantum username for the logged in user",
                                                'type': 'str'
                                                },
                                               {'parameter': 'gigantum_bearer_token',
                                                'description': "Gigantum bearer token for the current session",
                                                'type': 'str'
                                                },
                                               {'parameter': 'gigantum_id_token',
                                                'description': "Gigantum ID token for the current session",
                                                'type': 'str'
                                                }]
        if self._required_configuration():
            # If additional config required, append
            self._required_configuration_params.extend(self._required_configuration())

    @property
    def storage_type(self) -> str:
        """Return the string identifier for the dataset's storage class"""
        return self._backend_metadata()['storage_type']

    def _backend_metadata(self) -> dict:
        """Method to specify Storage Backend metadata for each implementation. This is used to render the UI

        Simply implement this method in a child class. Note, 'icon' should be the name of the icon file saved in the
        thumbnails directory. It should be a 128x128 px PNG image.

        return {"storage_type": "a_unique_identifier",
                "name": "My Dataset Type",
                "description": "Short string",
                "readme": "Long string",
                "icon": "my_icon.png",
                "url": "http://moreinfo.com"
                }

        Returns:
            dict
        """
        raise NotImplementedError

    @property
    def metadata(self):
        """

        Returns:

        """
        metadata = self._backend_metadata()

        dataset_pkg = resource_filename('gtmcore', 'dataset')
        icon_file = os.path.join(dataset_pkg, 'storage', 'thumbnails', metadata['icon'])

        with open(icon_file, 'rb') as icf:
            metadata['icon'] = base64.b64encode(icf.read()).decode("utf-8")

        return metadata

    def set_default_configuration(self, username: str, bearer_token: str, id_token: str) -> None:
        """Method to configure default keys. This should be called from API and other situations where
        remote ops are desired and the bearer and ID tokens exist

        Args:
            username: current logged in username
            bearer_token: current session bearer token (gigantum auth service)
            id_token: current session id token (gigantum auth service)

        Returns:
            None
        """
        self.configuration['username'] = username
        self.configuration['gigantum_bearer_token'] = bearer_token
        self.configuration['gigantum_id_token'] = id_token

    def _required_configuration(self) -> List[Dict[str, str]]:
        """A private method to return a list of parameters that must be set for a backend to be fully configured

        The format is a list of dictionaries, e.g.:

        [
          {
            "parameter": "server",
            "description": "URL of the remote server",
            "type": "str"
          },
          {
            "parameter": "username",
            "description": "The current logged in username",
            "type": "str"
          }
        ]

        "type" must be either `str` or `bool`

        There are 3 parameters that are always automatically populated:
           - username: the gigantum username for the logged in user
           - gigantum_bearer_token: the gigantum bearer token for the current session
           - gigantum_id_token: the gigantum id token for the current session
        """
        raise NotImplementedError

    def confirm_configuration(self, dataset) -> Optional[str]:
        """Method to verify a configuration and optionally allow the user to confirm before proceeding

        Should return the desired confirmation message if there is one. If no confirmation is required/possible,
        return None

        """
        raise NotImplementedError

    @property
    def is_configured(self) -> bool:
        """Boolean property indicating if a storage backend has all required config items set"""
        return len(self.missing_configuration) == 0

    @property
    def missing_configuration(self) -> List[Dict[str, str]]:
        """Property returning the missing configuration parameters"""
        configured_params = list(self.configuration.keys())

        missing_params = list()
        for param in self._required_configuration_params:
            if param['parameter'] not in configured_params:
                missing_params.append(param)

        return missing_params

    @property
    def safe_current_configuration(self) -> List[Dict[str, str]]:
        """Property returning the current configuration, excluding the default parameters which include secrets"""
        current_params = list()
        for param in self._required_configuration_params:
            if param['parameter'] in ['username', 'gigantum_bearer_token', 'gigantum_id_token']:
                continue
            param['value'] = self.configuration.get(param['parameter'])
            current_params.append(param)

        return current_params

    def prepare_pull(self, dataset, objects: List[PullObject]) -> None:
        """Method to prepare a backend for pulling objects locally

        Args:
            dataset: The dataset instance
            objects: A list of PullObjects, indicating which objects to pull

        Returns:

        """
        raise NotImplementedError

    def pull_objects(self, dataset, objects: List[PullObject], progress_update_fn: Callable) -> PullResult:
        """Method to pull objects locally

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

    def hash_file_key_list(self, dataset, keys):
        m = Manifest(dataset, self.configuration.get('username'))
        loop = get_event_loop()
        hash_task = asyncio.ensure_future(m.hasher.hash(keys))
        loop.run_until_complete(asyncio.gather(hash_task))
        return hash_task.result()

    def verify_contents(self, dataset, status_update_fn: Callable) -> List[str]:
        """Method to verify the hashes of all local files and indicate if they have changed

        Args:
            dataset: Dataset object
            status_update_fn: A callable, accepting a string for logging/providing status to the UI

        Returns:
            list
        """
        if 'username' not in self.configuration:
            raise ValueError("Dataset storage backend requires current logged in username to verify contents")

        m = Manifest(dataset, self.configuration.get('username'))
        keys_to_verify = list()
        for item in m.manifest:
            if os.path.isfile(os.path.join(m.cache_mgr.cache_root, m.dataset_revision, item)):
                # File exists locally
                keys_to_verify.append(item)

        # re-hash files
        status_update_fn(f"Validating contents of {len(keys_to_verify)} files. Please wait.")
        updated_hashes = self.hash_file_key_list(dataset, keys_to_verify)

        modified_items = list()
        for key, new_hash in zip(keys_to_verify, updated_hashes):
            item = m.manifest.get(key)
            if item:
                if new_hash != item.get('h'):
                    modified_items.append(key)

        if modified_items:
            status_update_fn(f"Integrity check complete. {len(modified_items)} files have been modified.")
        else:
            status_update_fn(f"Integrity check complete. No files have been modified.")

        return modified_items
