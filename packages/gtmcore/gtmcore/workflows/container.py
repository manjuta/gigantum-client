import os

from gtmcore.labbook import LabBook, SecretStore
from gtmcore.container import ContainerOperations


def start_labbook(labbook: LabBook, username: str) -> str:

    _, container_id = ContainerOperations.start_container(labbook, username)

    secret_store = SecretStore(labbook, username)
    for secrets_name in secret_store:
        for secrets_file in secret_store.list_files(secrets_name):
            ContainerOperations.put_file(labbook, username, src_path=secrets_file,
                                         dst_dir=secret_store[secrets_name])

    # TODO - if putting a secret fails, then stop container and raise exception

    return container_id
