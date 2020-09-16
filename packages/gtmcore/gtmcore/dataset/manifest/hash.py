import asyncio
from hashlib import blake2b
from pathlib import Path

import aiofiles

from typing import List, Optional, Union, Awaitable
from gtmcore.logging import LMLogger

logger = LMLogger.get_logger()


class SmartHash(object):
    """Class to handle file hashing that is operationally optimized for Gigantum.

    Keeping track of hashes should be handled in calling code."""

    def __init__(self, files_root: Union[Path, str]) -> None:
        """

        Args:
            files_root: Where we can find file contents. For Gigantum Datasets, the object cache. Otherwise, wherever
              the files are from the perspective of the client.
        """
        if isinstance(files_root, str):
            files_root = Path(files_root)
        self.files_root: Path = files_root
        self.hashing_block_size = 65536


    def get_abs_path(self, relative_path: str) -> Path:
        """Method to generate the absolute path to the file

        Args:
            relative_path:

        Returns:

        """
        if relative_path[0] == '/':
            relative_path = relative_path[1:]

        return self.files_root / relative_path

    def compute_fast_hash(self, relative_path: str) -> Optional[str]:
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
        if abs_path.exists():
            file_info = abs_path.stat()
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
            fast_hash_result = [self.compute_fast_hash(x) for x in path_list]

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
            if abs_path.is_file():
                async with aiofiles.open(abs_path, 'rb') as fh:
                    chunk = await fh.read(blocksize)
                    while chunk:
                        h.update(chunk)
                        chunk = await fh.read(blocksize)
            elif abs_path.is_dir():
                # If a directory, just hash the path as an alternative
                h.update(str(abs_path).encode('utf-8'))
            else:
                return None
        except Exception as err:
            logger.exception(err)
            return None

        return h.hexdigest()

    async def hash(self, path_list: List[str]) -> Awaitable[List[Optional[str]]]:
        """Method to compute the blake2b hash of a file's contents.

        Args:
            path_list: path names for files to hash / compare

        Returns:
            list
        """
        hashes = [self.compute_file_hash(path, self.hashing_block_size) for path in path_list]

        return asyncio.gather(*hashes)
