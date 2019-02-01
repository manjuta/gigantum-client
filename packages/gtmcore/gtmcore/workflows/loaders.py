from typing import Optional, Callable, Any, cast
import tempfile
import os

from gtmcore.configuration.utils import call_subprocess
from gtmcore.configuration import Configuration
from gtmcore.dataset.dataset import Dataset
from gtmcore.inventory import Repository
from gtmcore.inventory.branching import BranchManager
from gtmcore.inventory.inventory import InventoryManager
from gtmcore.exceptions import GigantumException
from gtmcore.logging import LMLogger

logger = LMLogger.get_logger()


def _clone(remote_url: str, working_dir: str) -> str:
    if Configuration().config['git']['lfs_enabled'] and False:
        clone_tokens = f"git lfs clone {remote_url}".split()
    else:
        clone_tokens = f"git clone {remote_url}".split()

    # Perform a Git clone
    call_subprocess(clone_tokens, cwd=working_dir)

    # Affirm there is only one directory created
    dirs = os.listdir(working_dir)
    if len(dirs) != 1:
        raise GigantumException('Git clone produced extra directories')

    p = os.path.join(working_dir, dirs[0])
    if not os.path.exists(p):
        raise GigantumException('Could not find expected path of repo after clone')

    return p


def _switch_owner(repository: Repository, username: str) -> Repository:
    #TODO: owner is no longer used and this function should be removed
    logger.info(f"Cloning public repo; changing owner to {username}")
    repository._load_gigantum_data()
    if repository._data:
        if 'owner' in repository._data.keys():
            repository._data['owner']['username'] = username
    else:
        raise GigantumException("LabBook _data not defined")
    repository._save_gigantum_data()
    repository.remove_remote('origin')
    msg = f"Imported and changed owner to {username}"
    repository.sweep_uncommitted_changes(extra_msg=msg)
    return repository


def clone_repo(remote_url: str, username: str, owner: str,
               load_repository: Callable[[str], Any],
               put_repository: Callable[[str, str, str], Any],
               make_owner: bool = False) -> Repository:

    with tempfile.TemporaryDirectory() as tempdir:
        # Clone into a temporary directory, such that if anything
        # gets messed up, then this directory will be cleaned up.
        path = _clone(remote_url=remote_url, working_dir=tempdir)
        candidate_repo = load_repository(path)

        if os.environ.get('WINDOWS_HOST'):
            logger.warning("Imported on Windows host - set fileMode to false")
            call_subprocess("git config core.fileMode false".split(),
                            cwd=candidate_repo.root_dir)

        bm = BranchManager(candidate_repo, username=username)

        repository = put_repository(candidate_repo.root_dir, username, owner)

    return repository