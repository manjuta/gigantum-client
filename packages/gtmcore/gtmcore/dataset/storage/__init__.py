import importlib
from typing import List, Dict, Any, Optional

from gtmcore.configuration import Configuration
from gtmcore.dataset.storage.backend import StorageBackend, ExternalProtectedStorage
from gtmcore.exceptions import GigantumException
from gtmcore.dataset.storage.gigantum import GigantumObjectStore
from gtmcore.dataset.storage.local import LocalFilesystemBackend

# Based on Client configuration, this dict may eventually be updated at start-up time (though not currently)
SUPPORTED_STORAGE_BACKENDS = {"gigantum_object_v1": GigantumObjectStore,
                              "local_filesystem":   LocalFilesystemBackend}


def get_storage_backend(client_config: Configuration, storage_type: str, backend_config: Optional[Dict[str, Any]] = None) -> StorageBackend:
    """Return a configured instance of the desired StorageBackend

    This function is designed to be called using dict-unpacking like so: get_storage_backend(**

    Args:
        client_config: An instance of the Configuration class for this Client
        storage_type: Identifier to load class
        backend_config: A dictionary with arguments to the class constructor (will be unpacked to keyword args)

    Returns:
        A supported subclass of StorageBackend

    Raises:
        GigantumException if storage_type is not supported
    """
    try:
        class_for_backend = SUPPORTED_STORAGE_BACKENDS[storage_type]
    except KeyError:
        raise GigantumException(f"Unsupported Dataset Storage Type: {storage_type}")

    try:
        if backend_config is None:
            instance = class_for_backend(client_config)
        else:
            instance = class_for_backend(client_config, **backend_config)
        return instance
    except ValueError:
        if backend_config is None:
            provided_args = 'None given'
        else:
            provided_args = ', '.join(backend_config.keys())
        raise GigantumException(f"Please check backend_config arguments for {storage_type}: {provided_args} ")


def storage_backend_metadata(storage_type: str) -> Dict[str, str]:
    """Retrieve the metadata from the class corresponding to storage_type

    Returns:
        Metadata about the storage_type
    """

    module, package = SUPPORTED_STORAGE_BACKENDS[storage_type]
    imported = importlib.import_module(module, package)
    class_for_backend = getattr(imported, package)
    return class_for_backend.metadata


def all_storage_backend_descriptions() -> List[Dict[str, str]]:
    """Assemble metadata from backend classes

    Returns:
        A list of dictionaries with class metadata for each supported backend type
    """
    result = list()
    for backend in SUPPORTED_STORAGE_BACKENDS:
        result.append(storage_backend_metadata(backend))

    return result
