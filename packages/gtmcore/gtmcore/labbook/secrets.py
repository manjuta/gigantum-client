import shutil
import json
import os

from typing import Dict, List, Optional

from gtmcore.exceptions.exceptions import GigantumException
from gtmcore.labbook import LabBook


class SecretStoreException(GigantumException):
    pass


class SecretStore(object):
    """ Data structure that contains "secrets" files and a mapping into where
    they should be placed in the running Project container. Secrets files may
    be SSH keys, AWS credentials, or anything of the like.

    The *content* of these files must always remain outside of the Project
    directory at all times.

    However, the mapping that indicates where the given files should go
    is indeed tracked inside the Project. """

    def __init__(self, labbook: LabBook, username: str) -> None:
        self.labbook = labbook
        self.username = username

        # secret_path contains the file defining the mapping between a
        # mnemonic and where the files for it should go.
        self.secret_path = os.path.join(self.labbook.metadata_path, 'secrets.json')

    @property
    def secret_map(self) -> Dict[str, str]:
        """Mnemonic to map names of secret directories to the path of
        where they should be mapped into the filesystem of the running
        container. """
        if os.path.exists(self.secret_path):
            return json.load(open(self.secret_path))
        else:
            return {}

    @property
    def as_mount_dict(self) -> Dict[str, str]:
        """Return the mapping such that:
        (source-path-on-host-disk -> dest-path-in-container)"""
        return {path_on_disk(self.labbook, self.username, k): v
                for k, v in self.secret_map.items()}

    def insert_file(self, src_path: str, target_dir: str,
                    dst_filename: Optional[str] = None) -> str:
        """Insert the given file into the given secret name (key).
        This will *move* the file from its src_path (source location)
        to relevant location for the key store (secret name).

        Args:
            src_path: Path of the file containing the key or credentials
            target_dir: Name of directory INSIDE project container to place this
            dst_filename: Optional name to force the destination filename.

        Returns:
            Full path to the secrets file that was just inserted.
        """
        owner = self.labbook.owner
        if not owner:
            # If we get here, the project is probably not in the appropriate place
            raise SecretStoreException(f'{str(self.labbook)} cannot accept secrets')
        full_path = path_on_disk(self.labbook, self.username)
        os.makedirs(full_path, exist_ok=True)
        if dst_filename:
            full_path = os.path.join(full_path, dst_filename)
        final_file_path = shutil.move(src_path, full_path)
        self[os.path.basename(final_file_path)] = target_dir
        return final_file_path

    def delete_files(self, file_paths: List[str]) -> None:
        """Delete the given files from the host machine.

        Args:
            secret_name: Name of the secret vault (key).
            file_paths: List of filenames to remove from host.

        Returns:
            None
        """
        file_dir = path_on_disk(self.labbook, self.username)
        for file_path in file_paths:
            # TODO - Make safe path to get rid of all special chars
            file_path = file_path.replace('..', '')
            os.remove(os.path.join(file_dir, file_path))

    def list_files(self) -> List[str]:
        """List the files (full_path) associated with a given secret.

        Return:
            List of files for that key (sorted alphabetically).
        """
        secret_file_dir = path_on_disk(self.labbook, self.username)
        if not os.path.exists(secret_file_dir):
            return []
        return sorted(os.listdir(secret_file_dir))

    def clear_files(self) -> None:
        """Completely delete the secret files from disk. """
        lb_secrets_dir = path_on_disk(self.labbook, self.username)
        shutil.rmtree(lb_secrets_dir)

    def __len__(self) -> int:
        return len(self.secret_map)

    def __iter__(self):
        return iter(self.secret_map)

    def __contains__(self, item):
        return item in self.secret_map

    def __getitem__(self, item):
        return self.secret_map[item]

    def __setitem__(self, key: str, value: str) -> None:
        if '/mnt/labbook' in value or '/mnt/project' in value:
            raise SecretStoreException('Cannot put secret in Project directory')
        if not valid_token(key, '._-'):
            raise SecretStoreException('Key must be alphanumeric with _-. character only')
        if not valid_token(value, './_-'):
            raise SecretStoreException('Value must be a valid directory string')
        if key in self.secret_map.keys():
            raise KeyError(f'Secret name {key} already exists')
        new_map = self.secret_map
        new_map.update({key: value})
        with open(self.secret_path, 'w') as secret_file:
            json.dump(new_map, secret_file, indent=2, sort_keys=True)

    def __delitem__(self, key):
        new_map = self.secret_map
        if key not in new_map:
            raise KeyError(f'Secret {key} not in {self}')
        del new_map[key]
        with open(self.secret_path, 'w') as secret_file:
            json.dump(new_map, secret_file, indent=2, sort_keys=True)

        # Delete all local secret files for this key on disk.
        shutil.rmtree(path_on_disk(self.labbook, self.username, key), ignore_errors=True)


def valid_token(token: str, extra_allowed_chars: str) -> bool:
    """ Ensure the given token is alphanumeric
    (with the exception of the extra characters)"""
    for echar in extra_allowed_chars:
        token = token.replace(echar, '')
    return token.isalnum()


def path_on_disk(labbook: LabBook, username: str, key: Optional[str] = None) -> str:
    """Return the path (on host) for the secrets file."""
    tokens = [labbook.client_config.app_workdir, '.labmanager',
              'secrets', username, labbook.owner, labbook.name]
    if key:
        tokens.append(key)
    return os.path.join(*tokens)
