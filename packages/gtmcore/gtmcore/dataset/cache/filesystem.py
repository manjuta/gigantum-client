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

    @property
    def current_revision_dir(self):
        """Method to return the directory containing files for the current dataset revision

        Returns:
            str
        """
        return os.path.join(self.cache_root, self.dataset.git.repo.head.commit.hexsha)

    @property
    def revision_cache_dir(self, revision: str):
        """Method to return the directory containing files for the current dataset revision

        Returns:
            str
        """
        return self.cache_root / revision

    def initialize(self):
        """Method to configure a file cache for use.

        Returns:
            None
        """
        (self.cache_root / 'objects').mkdir(parents=True, exist_ok=True)

        return self.cache_root
