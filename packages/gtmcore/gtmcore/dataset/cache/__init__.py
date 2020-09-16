import importlib
from typing import Callable, Type, Dict

from gtmcore.dataset import Dataset
from gtmcore.exceptions import GigantumException
from gtmcore.dataset.cache.cache import CacheManager
from gtmcore.dataset.cache.filesystem import HostFilesystemCache
from gtmcore.configuration import Configuration

SUPPORTED_CACHE_MANAGERS: Dict[str, Type[CacheManager]] = {"host": HostFilesystemCache}


def get_cache_manager(config: Configuration, dataset: Dataset, username: str) -> CacheManager:
    """Instantiate a CacheManager for Dataset in the appropriate location(s) for the logged-in user

    Args:
        config: Configuration for the client
        dataset: The dataset being managed
        username: Currently logged in username

    Returns:
        gtmcore.dataset.cache.CacheManager
    """
    dataset_config = config.config.get('datasets')
    if not dataset_config:
        # Fallback to default host manager
        manager_str = 'host'
    else:
        try:
            manager_str = dataset_config['cache_manager']
        except KeyError:
            raise GigantumException("Misconfigured Datasets config, missing 'cache_manager'")

    try:
        cache_class = SUPPORTED_CACHE_MANAGERS[manager_str]
        return cache_class(dataset, username)
    except KeyError:
        raise GigantumException(f"Unsupported Dataset File Cache Manager: {manager_str}")
