import os
from typing import Optional

from gtmcore.labbook import LabBook, SecretStore
from gtmcore.container import container_for_context


class ContainerWorkflows(object):

    @staticmethod
    def start_labbook(labbook: LabBook, username: str) -> Optional[str]:
        project_container = container_for_context(username, labbook=labbook)
        project_container.start_project_container()

        secret_store = SecretStore(labbook, username)

        secrets_dir_map = secret_store.as_mount_dict.items()
        for sec_local_src, sec_container_dst in secrets_dir_map:
            project_container.copy_into_container(src_path=sec_local_src, dst_dir=sec_container_dst)

        # TODO #1064 - if putting a secret fails, then stop container and raise exception

        return project_container.image_tag
