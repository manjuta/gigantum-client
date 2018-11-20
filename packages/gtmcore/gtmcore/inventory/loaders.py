from typing import Optional
import subprocess
import shutil
import tempfile
import time
import os

from gtmcore.configuration.utils import call_subprocess
from gtmcore.labbook.labbook import LabBook
from gtmcore.inventory.branching import BranchManager
from gtmcore.inventory.inventory import InventoryManager
from gtmcore.exceptions import GigantumException
from gtmcore.logging import LMLogger

logger = LMLogger.get_logger()


def _clone(labbook: LabBook, remote_url: str, working_dir: str) -> str:
    if labbook.client_config.config["git"]["lfs_enabled"]:
        clone_tokens = f"git lfs clone {remote_url} --branch gm.workspace".split()
    else:
        clone_tokens = f"git clone {remote_url} --branch gm.workspace".split()

    # Perform a Git clone
    call_subprocess(clone_tokens, cwd=working_dir)

    # Affirm there is only one directory created
    dirs = os.listdir(working_dir)
    if len(dirs) != 1:
        assert False
    p = os.path.join(working_dir, dirs[0])
    assert os.path.exists(p)
    return p


def _switch_owner(labbook: LabBook, username: str) -> LabBook:
    logger.info(f"Cloning public repo; changing owner to {username}")
    labbook._load_gigantum_data()
    if labbook._data:
        labbook._data['owner']['username'] = username
    else:
        raise GigantumException("LabBook _data not defined")
    labbook._save_gigantum_data()
    labbook.remove_remote('origin')
    msg = f"Imported and changed owner to {username}"
    labbook.sweep_uncommitted_changes(extra_msg=msg)
    return labbook


def from_remote(remote_url: str, username: str, owner: str,
                labbook_name: str, labbook: Optional[LabBook] = None,
                make_owner: bool = False) -> LabBook:
    """Clone a labbook from a remote Git repository.

    Args:
        remote_url: URL or path of remote repo
        username: Username of logged in user
        owner: Owner/namespace of labbook
        labbook_name: Name of labbook
        labbook: Optional labbook instance with config
        make_owner: After cloning, make the owner the "username"

    Returns:
        LabBook
    """
    if labbook == None:
        s_labbook = LabBook()
    else:
        s_labbook = labbook # type: ignore

    with tempfile.TemporaryDirectory() as tempdir:
        # Clone into a temporary directory, such that if anything
        # gets messed up, then this directory will be cleaned up.
        path = _clone(s_labbook, remote_url=remote_url, working_dir=tempdir)
        inv_manager = InventoryManager(s_labbook.client_config.config_file)
        candidate_lb = inv_manager.load_labbook_from_directory(path)
        bm = BranchManager(candidate_lb, username=username)
        bm.workon_branch("gm.workspace")
        user_workspace = f'gm.workspace-{username}'
        if user_workspace in bm.branches:
            bm.workon_branch(user_workspace)
        else:
            bm.create_branch(user_workspace)

        if make_owner:
            # Make the owner of the imported labbook the username
            candidate_lb = _switch_owner(candidate_lb, username)
            new_owner = username
        else:
            new_owner = owner

        lb = inv_manager.put_labbook(path, username=username, owner=new_owner)

    return lb
