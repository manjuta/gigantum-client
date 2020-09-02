import os
import re
import yaml
import datetime

from typing import Optional, Dict

from gtmcore.gitlib import GitAuthor
from gtmcore.dataset.schemas import validate_dataset_schema
from gtmcore.activity import ActivityDetailType, ActivityType
from gtmcore.dataset.storage import get_storage_backend, StorageBackend

from gtmcore.inventory.repository import Repository


class Dataset(Repository):
    """Class representing a single Dataset

    As with the other Repository class (LabBook), the primary configuration file is located in
    `.gigantum/gigantum.yaml`. Additional configuration information for the contained StorageBackend subclass may
    optionally be stored in `.gigantum/backend.json`. The backend file should describe a dict than can be unpacked into
    keyword arguments to the StorageBackend constructor.
    """
    _default_activity_type = ActivityType.DATASET
    _default_activity_detail_type = ActivityDetailType.DATASET
    _default_activity_section = "Dataset Root"

    def __init__(self, storage_type: str, backend_config: Optional[Dict[str, str]] = None,
                 namespace: Optional[str] = None, author: Optional[GitAuthor] = None) -> None:
        super().__init__(author)
        self.namespace = namespace
        self._storage_type = storage_type
        self._backend = get_storage_backend(storage_type, backend_config)

    def __str__(self):
        if self._root_dir:
            return f'<Dataset at `{self._root_dir}`>'
        else:
            return f'<Dataset UNINITIALIZED>'

    def __eq__(self, other):
        return isinstance(other, Dataset) and other.root_dir == self.root_dir

    @property
    def id(self) -> str:
        if self._data:
            return self._data["id"]
        else:
            raise ValueError("No ID assigned to the Dataset.")

    @property
    def name(self) -> str:
        if self._data:
            return self._data["name"]
        else:
            raise ValueError("No name assigned to the Dataset.")

    @name.setter
    def name(self, value: str) -> None:
        if not value:
            raise ValueError("value cannot be None or empty")

        if not self._data:
            self._data = {'name': value}
        else:
            self._data["name"] = value
        self._validate_gigantum_data()

        # Update data file
        self._save_gigantum_data()

        # Rename directory
        if self._root_dir:
            base_dir, _ = self._root_dir.rsplit(os.path.sep, 1)
            os.rename(self._root_dir, os.path.join(base_dir, value))
        else:
            raise ValueError("Dataset root dir not specified. Failed to configure git.")

        # Update the root directory to the new directory name
        self._set_root_dir(os.path.join(base_dir, value))

    @property
    def creation_date(self) -> Optional[datetime.datetime]:
        """Get creation date from the gigantum.yaml file"""
        if self._data:
            created_at = self._data["created_on"]
            d = datetime.datetime.strptime(created_at, '%Y-%m-%dT%H:%M:%S.%f')
            d = d.replace(tzinfo=datetime.timezone.utc)  # Make tz aware so rendering in API is consistent
            d = d.replace(microsecond=0)  # Make all times consistent
            return d
        else:
            raise ValueError("No creation date set.")

    @property
    def build_details(self) -> str:
        return self._data["build_info"]

    @property
    def description(self) -> str:
        if self._data:
            return self._data["description"]
        else:
            raise ValueError("No description assigned to this Dataset.")

    @description.setter
    def description(self, value) -> None:
        if not self._data:
            self._data = {'description': value}
        else:
            self._data["description"] = value

        self._save_gigantum_data()

    @property
    def storage_type(self) -> str:
        if self._data:
            return self._data["storage_type"]
        else:
            raise ValueError("No storage type assigned to this Dataset.")

    @storage_type.setter
    def storage_type(self, value) -> None:
        if not self._data:
            self._data = {'storage_type': value}
        else:
            self._data["storage_type"] = value

        self._save_gigantum_data()

    @property
    def backend(self) -> StorageBackend:
        """Property to access the storage backend for this dataset"""
        return self._backend

    def _save_gigantum_data(self) -> None:
        """Method to save changes to the LabBook

        Returns:
            None
        """
        if not self.root_dir:
            raise ValueError("No root directory assigned to Dataset. Failed to get root directory.")

        with open(os.path.join(self.root_dir, ".gigantum", "gigantum.yaml"), 'wt') as df:
            df.write(yaml.safe_dump(self._data, default_flow_style=False))
            df.flush()

    def _load_gigantum_data(self) -> None:
        """Method to load the dataset YAML file to a dictionary

        Returns:
            None
        """
        if not self.root_dir:
            raise ValueError("No root directory assigned to Dataset. Failed to get root directory.")

        with open(os.path.join(self.root_dir, ".gigantum", "gigantum.yaml"), 'rt') as df:
            self._data = yaml.safe_load(df)

    def _validate_gigantum_data(self) -> None:
        """Method to validate the Dataset data file contents

        Returns:
            None
        """
        if not re.match("^(?!-)(?!.*--)[a-z0-9-]+(?<!-)$", self.name):
            raise ValueError("Invalid `name`. Only a-z 0-9 and hyphens allowed. No leading or trailing hyphens.")

        if len(self.name) > 100:
            raise ValueError("Invalid `name`. Max length is 100 characters")

        # Validate schema is supported by running version of the software and valid
        if not validate_dataset_schema(self.schema, self.data):
            errmsg = f"Schema in Dataset {str(self)} does not match indicated version {self.schema}"
            raise ValueError(errmsg)

    def linked_to(self) -> Optional[str]:
        """Method that provides an identifier to a Project if this instance is linked to a Project (embedded as a
        submodule)

        Returns:
            str
        """
        labbook_key = None
        if ".gigantum/datasets/" in self.root_dir:
            _, username, owner, _, labbook_name, _, _, _, _ = self.root_dir.rsplit("/", 8)
            labbook_key = f"{username}|{owner}|{labbook_name}"

        return labbook_key
