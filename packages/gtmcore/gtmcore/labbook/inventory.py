import os
import shutil

from typing import Optional

from gtmcore.configuration import Configuration
from gtmcore.configuration.utils import call_subprocess
from gtmcore.labbook.labbook import LabBook


class InventoryException(Exception):
    pass


class InventoryManager(object):
    """ This class absorbs the complexity of accepting data structures into the client's
        working directory. We need this class because interacting with the "inventory"
        (i.e., the tree of labbooks located in the user's working directory) can be
        a messy and error-prone process. Any other functionality that needs to insert
        data into the inventory no longer needs to be aware of any specifics of the internal
        structure of it or worry about cleanup. """

    def __init__(self, config_file: Optional[str] = None) -> None:
        self.config_file = config_file
        cfg = Configuration(self.config_file)
        self.inventory_root = os.path.expanduser(cfg.config['git']['working_directory'])

    def __str__(self) -> str:
        return f'<InventoryManager: {self.inventory_root}>'

    def __eq__(self, other) -> bool:
        return isinstance(other, InventoryManager) \
               and self.inventory_root == other.inventory_root

    def _accept_labbook(self, path: str, username: str, owner: str) -> LabBook:
        # Validate that given path contains labbook
        temp_lb = LabBook(self.config_file)
        temp_lb.from_directory(path)

        p = os.path.join(self.inventory_root, username, owner, 'labbooks')
        dname = os.path.basename(path)
        if os.path.exists(p) and dname in os.listdir(p):
            raise InventoryException(f"Project directory {dname} already exists")

        if not os.path.exists(p):
            os.makedirs(p, exist_ok=True)

        if os.path.exists(os.path.join(p, dname)):
            raise InventoryException(f"Project directory {dname} already exists")

        final_path = shutil.move(path, p)
        assert os.path.dirname(final_path) != 'labbooks', \
               f"shutil.move used incorrectly"

        lb = LabBook(self.config_file)
        lb.from_directory(final_path)

        return lb

    def accept_labbook(self, path: str, username: str, owner: str) -> LabBook:
        """ Take given path to a candidate labbook and insert it
        into its proper place in the file system.

        Args:
            path: Path to a given labbook
            username: Active username
            owner: Intended owner of labbook

        Returns:
            LabBook
        """
        try:
            return self._accept_labbook(path, username, owner)
        except Exception as e:
            raise InventoryException(e)
