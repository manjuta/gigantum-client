import os
from pathlib import Path


class HostFilesystemCache:
    """A simple cache manager for Gigantum Dataset objects

    It uses the host filesystem mounted from the gigantum working directory
    """

    def __init__(self, cache_root: Path) -> None:
        """

        Args:
            dataset: Current dataset object
            username: Username of current logged in user, which may be required by the CacheManager implementation
        """
        self.cache_root = cache_root
        self.initialize()

    def initialize(self):
        """Method to configure a file cache for use.

        Returns:
            None
        """
        (self.cache_root / 'objects').mkdir(parents=True, exist_ok=True)

        return self.cache_root
