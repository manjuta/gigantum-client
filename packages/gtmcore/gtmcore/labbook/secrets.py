import shutil
import json
import os

from typing import Dict

from gtmcore.exceptions.exceptions import GigantumException
from gtmcore.labbook import LabBook


class SecretStoreException(GigantumException):
    pass


class SecretStore(dict):

    def __init__(self, labbook: LabBook):
        self.labbook = labbook
        self.secret_path = os.path.join(self.labbook.metadata_path, 'secrets.json')

    @property
    def secret_map(self) -> Dict[str, str]:
        if os.path.exists(self.secret_path):
            return json.load(open(self.secret_path))
        else:
            return {}

    def insert_file(self, src_path: str, secret_name: str, username: str) -> None:
        owner = self.labbook.owner
        if not owner:
            # If we get here, the project is probably not in the appropriate place
            raise SecretStoreException(f'{str(self.lb)} cannot accept secrets')
        tokens = [self.labbook.client_config.app_workdir,
                  '.labmanager', 'secrets', owner, self.labbook.name]
        full_path = os.path.join(*tokens)
        os.makedirs(full_path, exist_ok=True)
        shutil.move(src_path, full_path)

    def __len__(self) -> int:
        return len(self.secret_map)

    def __iter__(self):
        return iter(self.secret_map)

    def __getitem__(self, item):
        return self.secret_map[item]

    def __setitem__(self, key: str, value: str) -> None:
        if '/mnt/labbook' in value:
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


def valid_token(token: str, extra_allowed_chars: str) -> bool:
    for echar in extra_allowed_chars:
        token = token.replace(echar, '')
    return token.isalnum()
