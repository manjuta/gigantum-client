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
from typing import List

from promise import Promise
from promise.dataloader import DataLoader
from lmcommon.environment.utils import get_package_manager
from lmcommon.labbook import LabBook
from lmcommon.logging import LMLogger

logger = LMLogger.get_logger()


class PackageLatestVersionLoader(DataLoader):
    """Dataloader for PackageComponent instances

    Primary advantage is that with conda managed packages, we can coalesce latest version queries to boost performance

    The key for this object is  manager&package
    """
    def __init__(self, keys: List[str], labbook: LabBook, username: str):
        DataLoader.__init__(self)
        self.keys = keys
        self.latest_versions = dict()
        self.labbook = labbook
        self.username = username

    def populate_latest_versions(self):
        conda3_pkgs = list()
        conda2_pkgs = list()
        normal_pkgs = list()
        for key in self.keys:
            # Repack key data
            manager, package = key.split('&')
            if manager == 'conda2':
                conda2_pkgs.append([package, key])
            elif manager == 'conda3':
                conda3_pkgs.append([package, key])
            else:
                normal_pkgs.append([manager, package, key])

        if conda2_pkgs:
            # load all versions at once
            all_pkgs = [x[0] for x in conda2_pkgs]
            mgr = get_package_manager('conda2')
            try:
                versions = mgr.latest_versions(all_pkgs, labbook=self.labbook, username=self.username)

                # save
                for version, pkg in zip(versions, conda2_pkgs):
                    self.latest_versions[pkg[1]] = version

            except ValueError as err:
                logger.warning(f"An error occurred while looking up conda2 latest versions: {err}")

        if conda3_pkgs:
            # load all versions at once
            all_pkgs = [x[0] for x in conda3_pkgs]
            mgr = get_package_manager('conda3')
            try:
                versions = mgr.latest_versions(all_pkgs, labbook=self.labbook, username=self.username)

                # save
                for version, pkg in zip(versions, conda3_pkgs):
                    self.latest_versions[pkg[1]] = version

            except ValueError as err:
                logger.warning(f"An error occurred while looking up conda3 latest versions: {err}")

        if normal_pkgs:
            # For these package managers, look up each latest version individually
            for pkg in normal_pkgs:
                mgr = get_package_manager(pkg[0])
                self.latest_versions[pkg[2]] = mgr.latest_version(pkg[1], labbook=self.labbook, username=self.username)

    def get_version(self, key: str):
        if not self.latest_versions:
            self.populate_latest_versions()

        return self.latest_versions[key]

    def batch_load_fn(self, keys: List[str]):
        """Method to load labbook objects based on a list of unique keys

        Args:
            keys(list(str)): Unique key to identify the labbook

        Returns:

        """
        # Resolve objects
        return Promise.resolve([self.get_version(key) for key in keys])


class PackageValidator(DataLoader):
    """Dataloader for validating packages

    Primary advantage is that with conda managed packages, we can coalesce latest version queries to boost performance

    The key for this object is  manager&package
    """
    def __init__(self, keys: List[str], labbook: LabBook, username: str):
        DataLoader.__init__(self)
        self.keys = keys
        self.latest_versions = dict()
        self.labbook = labbook
        self.username = username

    def populate_latest_versions(self):
        conda3_pkgs = list()
        conda2_pkgs = list()
        normal_pkgs = list()
        for key in self.keys:
            # Repack key data
            manager, package = key.split('&')
            if manager == 'conda2':
                conda2_pkgs.append([package, key])
            elif manager == 'conda3':
                conda3_pkgs.append([package, key])
            else:
                normal_pkgs.append([manager, package, key])

        if conda2_pkgs:
            # load all versions at once
            all_pkgs = [x[0] for x in conda2_pkgs]
            mgr = get_package_manager('conda2')
            versions = mgr.latest_versions(all_pkgs, labbook=self.labbook, username=self.username)

            # save
            for version, pkg in zip(versions, conda2_pkgs):
                self.latest_versions[pkg[1]] = version

        if conda3_pkgs:
            # load all versions at once
            all_pkgs = [x[0] for x in conda3_pkgs]
            mgr = get_package_manager('conda3')
            versions = mgr.latest_versions(all_pkgs, labbook=self.labbook, username=self.username)

            # save
            for version, pkg in zip(versions, conda3_pkgs):
                self.latest_versions[pkg[1]] = version

        if normal_pkgs:
            # For these package managers, look up each latest version individually
            for pkg in normal_pkgs:
                mgr = get_package_manager(pkg[0])
                self.latest_versions[pkg[2]] = mgr.latest_version(pkg[1], labbook=self.labbook, username=self.username)

    def get_version(self, key: str):
        if not self.latest_versions:
            self.populate_latest_versions()

        return self.latest_versions[key]

    def batch_load_fn(self, keys: List[str]):
        """Method to load labbook objects based on a list of unique keys

        Args:
            keys(list(str)): Unique key to identify the labbook

        Returns:

        """
        # Resolve objects
        return Promise.resolve([self.get_version(key) for key in keys])
