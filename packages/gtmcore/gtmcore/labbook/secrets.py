import shutil
import json
import os

from typing import Dict, List, Optional

from gtmcore.exceptions.exceptions import GigantumException
from gtmcore.labbook import LabBook


class SecretStoreException(GigantumException):
    pass


class SecretStore(object):

    def __init__(self, labbook: LabBook, username: str) -> None:
        self.labbook = labbook
        self.username = username
        self.secret_path = os.path.join(self.labbook.metadata_path, 'secrets.json')

    @property
    def secret_map(self) -> Dict[str, str]:
        if os.path.exists(self.secret_path):
            return json.load(open(self.secret_path))
        else:
            return {}

    @property
    def as_mount_dict(self) -> Dict[str, str]:
        return {path_on_disk(self.labbook, self.username, k): v
                for k, v in self.secret_map.items()}

    def insert_file(self, src_path: str, secret_name: str) -> str:
        owner = self.labbook.owner
        if not owner:
            # If we get here, the project is probably not in the appropriate place
            raise SecretStoreException(f'{str(self.labbook)} cannot accept secrets')
        full_path = path_on_disk(self.labbook, self.username, secret_name)
        os.makedirs(full_path, exist_ok=True)
        final_file_path = shutil.move(src_path, full_path)
        return final_file_path

    def delete_files(self, secret_name: str, file_paths: List[str]):
        file_dir = path_on_disk(self.labbook, self.username, secret_name)
        for file_path in file_paths:
            # TODO - Make safe path to get rid of all special chars
            file_path = file_path.replace('..', '')
            os.remove(os.path.join(file_dir, file_path))

    def list_files(self, secret_name: str) -> List[str]:
        if secret_name not in self:
            return []
        secret_file_dir = path_on_disk(self.labbook, self.username, secret_name)
        if not os.path.exists(secret_file_dir):
            return []
        return sorted(os.listdir(secret_file_dir))

    def clear_files(self):
        lb_secrets_dir = path_on_disk(self.labbook, self.username)
        shutil.rmtree(lb_secrets_dir)

    # TODO(bvb) - Insert bit to delete artifacts here when project deleted locally.

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
        if not valid_token(key, '_-'):
            raise SecretStoreException('Key must be alphanumeric with _ or - character only')
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


def path_on_disk(labbook: LabBook, username: str, secret_name: Optional[str] = None) -> str:
    tokens = [labbook.client_config.app_workdir, '.labmanager',
              'secrets', username, labbook.owner, labbook.name]
    if secret_name:
        tokens.append(secret_name)
    return os.path.join(*tokens)
