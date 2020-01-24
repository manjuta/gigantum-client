import os
import pickle
import functools
from typing import (Any, Dict, List, Optional)
from operator import itemgetter

import redis_lock
from redis import StrictRedis

from gtmcore.logging import LMLogger
from gtmcore.configuration import Configuration
from gtmcore.exceptions import GigantumLockedException

class RepositoryLock(object):
    """Lock for base image repo fetching and indexing

    Note: If there is a problem fetching the base image repositories this lock
          is not released, preventing any code from accessing the repositories

    Can be used as an object to manually acquire / release the lock
    Can be used as a context manager to automatically acquire / release the lock
    Can be used as a function decorator to automatically acquire / release the lock
    """
    def __init__(self, config_file: Optional[str] = None):
        """
        Args:
            config_file (Optional[str]): Optional config file location if don't want to load from default location
        """
        self.client_config = Configuration(config_file)

        self.key = "base_repository_updates"
        self.lock_key = f'filesystem_lock|{self.key}'

        self._lock_redis_client: Optional[StrictRedis] = None
        self.lock: Optional[redis_lock.Lock] = None

        self.logger = LMLogger.get_logger()

    # Start Context Manager Methods

    def __enter__(self):
        self.acquire()
        return self

    def __exit__(self, type, value, traceback):
        self.release()
        return None

    # End Context Manager Methods

    # Start Decorator Methods

    def __call__(self, func):
        @functools.wraps(func)
        def inner(*args, **kwargs):
            with self:
                return func(*args, **kwargs)
        inner.__wrapper__ = self # Allow unit tests to access the RepositoryLock instance
        return inner

    # End Decorator Methods

    def acquire(self, failfast: Optional[bool] = False):
        """Acquire the lock

        Args:
            failfast (Optional[bool]): Optional flag if the acquisition should
                     block for a given time or should return immediately if the
                     lock cannot be acquired

        Raises:
            GigantumLockedException: If the lock cannot be acquired and failfast is True
            IOError: If the lock cannot be acquired after the configured timeout
        """
        config = self.client_config.config['lock']

        # Get a redis client
        if not self._lock_redis_client:
            self._lock_redis_client = StrictRedis(host=config['redis']['host'],
                                                  port=config['redis']['port'],
                                                  db=config['redis']['db'])

        # Get a lock object
        self.lock = redis_lock.Lock(self._lock_redis_client, self.lock_key)

        # Get the lock - blocking and timeout kw args can not
        # be used simultaneously
        if failfast:
            lock_kwargs = {'blocking': False}
        else:
            lock_kwargs = {'timeout': config['timeout']}

        if not self.lock.acquire(**lock_kwargs):
            self.lock = None
            if failfast:
                raise GigantumLockedException("Cannot interrupt operation in progress")
            else:
                raise IOError(f"Could not acquire file system lock within {config['timeout']} seconds.")

    def release(self):
        """Release the lock"""
        if self.lock:
            try:
                self.lock.release()
            except redis_lock.NotAcquired as e:
                # if you didn't get the lock and an error occurs, you probably won't be able to release, so log.
                self.logger.error(e)
            self.lock = None


class BaseRepository(object):
    """Class to interface with local indices of base image repositories
    """

    def __init__(self, config_file: str=None) -> None:
        """Constructor

        Args:
            config_file(str): Optional config file location if don't want to load from default location
        """
        self.config = Configuration(config_file=config_file)
        self.local_repo_directory = os.path.expanduser(os.path.join(self.config.config["git"]['working_directory'],
                                                       ".labmanager", "environment_repositories"))

        # Dictionary to hold loaded index files in memory
        self.list_index_data: List[str] = list()
        self.detail_index_data: Dict[str, Any] = {}

    def _get_detail_index_data(self) -> Dict[str, Any]:
        """Private method to get detail index data from either the file or memory

        Returns:
            dict: the data stored in the index file
        """
        if not self.detail_index_data:
            # Load data for the first time
            with open(os.path.join(self.local_repo_directory, "base_index.pickle"), 'rb') as fh:
                self.detail_index_data = pickle.load(fh)

        return self.detail_index_data

    def get_base_list(self) -> List[str]:
        """Method to get a list of all components of a specific class (e.g base_image, development_environment, etc)
        The component class should map to a directory in the component repository

        Returns:
            list
        """
        if not self.list_index_data:
            with open(os.path.join(self.local_repo_directory, f"base_list_index.pickle"), 'rb') as fh:
                self.list_index_data = pickle.load(fh)

        return self.list_index_data

    def get_base_versions(self, repository: str, base: str) -> List[str]:
        """Method to get a detailed list of all available versions for a single component

        Args:
            repository(str): name of the component as provided via the list (<namespace>_<repo name>)
            base(str): name of the base

        Returns:
            list
        """
        # Open index
        index_data = self._get_detail_index_data()

        if repository not in index_data:
            raise ValueError("Repository `{}` not found.".format(repository))

        if base not in index_data[repository]:
            raise ValueError("Base `{}` not found in repository `{}`.".format(base, repository))

        data = list(index_data[repository][base].items())
        return sorted(data, key=itemgetter(0), reverse=True)

    def get_base(self, repository: str, base: str, revision: int) -> Dict[str, Any]:
        """Method to get a details for a version of a base

        Args:
            repository(str): name of the component as provided via the list (<namespace>_<repo name>)
            base(str): name of the component
            revision(str): the version string of the component

        Returns:
            dict
        """
        index_data = self._get_detail_index_data()

        if repository not in index_data:
            raise ValueError("Repository `{}` not found.".format(repository))

        if base not in index_data[repository]:
            raise ValueError("Base `{}` not found in repository `{}`.".format(base, repository))

        if revision not in index_data[repository][base]:
            raise ValueError("Revision `{}` not found in repository `{}`.".format(revision, repository))

        return index_data[repository][base][revision]
