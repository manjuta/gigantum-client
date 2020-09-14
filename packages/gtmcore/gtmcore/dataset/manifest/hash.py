from hashlib import blake2b
import aiofiles

from typing import List, Optional
import pickle
import os
from gtmcore.logging import LMLogger

logger = LMLogger.get_logger()


class SmartHash(object):
    """Class to handle file hashing that is operationally optimized for Gigantum.

    Keeping track of hashes should be handled in calling code."""

    def __init__(self, root_dir: str, files_root: str, current_revision: str) -> None:
        """

        Args:
            root_dir: The location of the dataset (either top-level or inside a Project)
            file_cache_root: For Gigantum Datasets, the object cache. Otherwise, wherever the files are from the
              perspective of the client.
            current_revision:
        """
        self.root_dir = root_dir
        self.current_revision = current_revision
        self.files_root = files_root

        self.hashing_block_size = 65536


    def get_abs_path(self, relative_path: str) -> str:
        """Method to generate the absolute path to the file

        Args:
            relative_path:

        Returns:

        """
        if relative_path[0] == '/':
            relative_path = relative_path[1:]

        return os.path.join(self.files_root, self.current_revision, relative_path)

    # TODO DJWC - need to complete refactor of items using self.fast_hash_data
    #  which is now moved up a level to manifest.py (for now)
    def is_cached(self, path: str) -> bool:
        """Method to check if a file has been loaded into the file cache

        Args:
            path: relative path to the file in the dataset

        Returns:

        """
        return path in self.fast_hash_data

    def has_changed_fast(self, path: str) -> bool:
        """Method to check if a file has changed according to the fast hash

        Args:
            path: Relative path to the file in the dataset

        Returns:

        """
        return self._compute_fast_hash(path) != self.fast_hash_data.get(path)

    def get_deleted_files(self, file_list: List[str]) -> list:
        """Method to list files that have previously been in the fast hash (exist locally) and have been removed

        Args:
            file_list: List of relative paths to files in the dataset

        Returns:

        """
        return sorted(list(set(self.fast_hash_data.keys()).difference(file_list)))

    def delete_fast_hashes(self, file_list: List[str]) -> None:
        """Method to remove fast hashes from the stored hash file

        Args:
            file_list: list of relative paths to remove from the fast hash data

        Returns:

        """
        for f in file_list:
            del self.fast_hash_data[f]

        self._save_fast_hash_file()

    def _compute_fast_hash(self, relative_path: str) -> Optional[str]:
        """

        Note, the delimiter `||` is used as it's unlikely to be in a path. Hash structure:

        relative file path || size in bytes || mtime

        Args:
            relative_path:

        Returns:
            str
        """
        abs_path = self.get_abs_path(relative_path)
        fast_hash_val = None
        if os.path.exists(abs_path):
            file_info = os.stat(abs_path)
            fast_hash_val = f"{relative_path}||{file_info.st_size}||{file_info.st_mtime}"
        return fast_hash_val

    # TODO DJWC - harmonize API WRT async
    def fast_hash(self, path_list: list) -> List[Optional[str]]:
        """Compute fast hashes for a list of paths

        See SmarthHash._compute_fast_hash() for details

        Args:
            path_list: Strings specifying files in the dataset

        Returns:
            A list of hash results
        """
        fast_hash_result: List[Optional[str]] = list()
        if len(path_list) > 0:
            fast_hash_result = [self._compute_fast_hash(x) for x in path_list]

        return fast_hash_result

    async def compute_file_hash(self, path: str, blocksize: int = 4096) -> Optional[str]:
        """Method to compute the black2b hash for the provided file

        Args:
            path: Relative path to the file
            blocksize: Blocksize to use when reading the file and computing the hash

        Returns:
            str
        """
        h = blake2b()
        try:
            abs_path = self.get_abs_path(path)
            if os.path.isfile(abs_path):
                async with aiofiles.open(abs_path, 'rb') as fh:
                    chunk = await fh.read(blocksize)
                    while chunk:
                        h.update(chunk)
                        chunk = await fh.read(blocksize)
            elif os.path.isdir(abs_path):
                # If a directory, just hash the path as an alternative
                h.update(abs_path.encode('utf-8'))
            else:
                return None
        except Exception as err:
            logger.exception(err)
            return None

        return h.hexdigest()

    async def hash(self, path_list: List[str]) -> List[Optional[str]]:
        """Method to compute the blake2b hash of a file's contents.

        Args:
            path_list: path names for files to hash / compare

        Returns:
            list
        """
        hash_result_list: List[Optional[str]] = [await self.compute_file_hash(path,
                                                 self.hashing_block_size) for path in path_list]

        return hash_result_list
