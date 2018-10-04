# Copyright (c) 2017 FlashX, LLC
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
import os
import pickle
from typing import (Any, List, Dict)

from gtmcore.configuration import Configuration


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

        return list(index_data[repository][base].items())

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
