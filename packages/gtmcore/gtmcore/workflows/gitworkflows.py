# Copyright (c) 2018 FlashX, LLC
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
from typing import Optional, Callable, cast

from gtmcore.configuration.utils import call_subprocess
from gtmcore.configuration import Configuration
from gtmcore.logging import LMLogger
from gtmcore.labbook import LabBook
from gtmcore.workflows import gitworkflows_utils, loaders
from gtmcore.exceptions import GigantumException
from gtmcore.inventory import Repository
from gtmcore.inventory.inventory import InventoryManager
from gtmcore.dataset import Dataset
from gtmcore.inventory.branching import BranchManager
from gtmcore.dataset.manifest import Manifest
from gtmcore.dataset.io.manager import IOManager

logger = LMLogger.get_logger()


class GitWorkflowException(GigantumException):
    pass


class GitWorkflow(object):
    """Manages all aspects of interaction with Git remote server
    """

    def __init__(self, repository: Repository) -> None:
        self.repository = repository

    @property
    def remote(self) -> Optional[str]:
        return self.repository.remote

    @classmethod
    def import_remote_dataset(cls, remote_url: str, username: str) -> 'GitWorkflow':
        """Take a URL of a remote dataset and manifest it locally on this system. """
        inv_manager = InventoryManager()
        _, namespace, repo_name = remote_url.rsplit('/', 2)
        repo = loaders.clone_repo(remote_url=remote_url, username=username, owner=namespace,
                                  load_repository=inv_manager.load_dataset_from_directory,
                                  put_repository=inv_manager.put_dataset)
        return cls(cast(Dataset, repo))

    @classmethod
    def import_remote_labbook(cls, remote_url: str, username: str,
                              config_file: str = None) -> 'GitWorkflow':
        """Take a URL of a remote project and manifest it locally on this system. """
        inv_manager = InventoryManager(config_file=config_file)
        _, namespace, repo_name = remote_url.rsplit('/', 2)
        repo = loaders.clone_repo(remote_url=remote_url, username=username, owner=namespace,
                                  load_repository=inv_manager.load_labbook_from_directory,
                                  put_repository=inv_manager.put_labbook)
        return cls(cast(LabBook, repo))

    def garbagecollect(self):
        """ Run a `git gc` on the repository. """
        gitworkflows_utils.git_garbage_collect(self.repository)

    def _push_dataset_objects(self, dataset: Dataset, logged_in_username: str,
                              feedback_callback: Callable, access_token: str, id_token: str) -> None:
        dataset.backend.set_default_configuration(logged_in_username, access_token, id_token)
        m = Manifest(dataset, logged_in_username)
        iom = IOManager(dataset, m)
        iom.push_objects(status_update_fn=feedback_callback)
        iom.manifest.link_revision()

    def publish(self, username: str, access_token: Optional[str] = None, remote: str = "origin",
                public: bool = False, feedback_callback: Callable = lambda _ : None,
                id_token: Optional[str] = None) -> None:
        """ Publish this repository to the remote GitLab instance.

        Args:
            username: Subject username
            access_token: Temp token/password to gain permissions on GitLab instance
            remote: Name of Git remote (always "origin" for now).
            public: Allow public read access
            feedback_callback: Callback to give user-facing realtime feedback

        Returns:
            None
        """

        logger.info(f"Publishing {str(self.repository)} for user {username} to remote {remote}")
        if self.remote:
            raise GitWorkflowException("Cannot publish Labbook when remote already set.")

        branch_mgr = BranchManager(self.repository, username=username)
        if branch_mgr.active_branch != branch_mgr.workspace_branch:
            raise GitWorkflowException(f"Must be on branch {branch_mgr.workspace_branch} to publish")

        try:
            self.repository.sweep_uncommitted_changes()
            vis = "public" if public is True else "private"
            gitworkflows_utils.create_remote_gitlab_repo(repository=self.repository, username=username,
                                                         access_token=access_token, visibility=vis)
            gitworkflows_utils.publish_to_remote(repository=self.repository, username=username,
                                                 remote=remote, feedback_callback=feedback_callback)
            if isinstance(self.repository, Dataset):
                self._push_dataset_objects(self.repository, username, feedback_callback, # type: ignore
                                           access_token, id_token) # type: ignore
        except Exception as e:
            # Unsure what specific exception add_remote creates, so make a catchall.
            logger.error(f"Publish failed {e}: {str(self.repository)} may be in corrupted Git state!")
            call_subprocess(['git', 'reset', '--hard'], cwd=self.repository.root_dir)
            raise e

    def unpublish(self):
        """Deletes the remote repository...

        TODO: Implementation must be placed here from mutation. """

    def sync(self, username: str, remote: str = "origin", force: bool = False,
             feedback_callback: Callable = lambda _ : None,
             access_token: Optional[str] = None, id_token: Optional[str] = None) -> int:
        """ Sync with remote GitLab repo (i.e., pull any upstream changes and push any new changes). Following
        a sync operation both the local repo and remote should be at the same revision.

        Args:
            username: Subject user
            remote: Name of remote (usually only origin for now)
            force: In the event of conflict, force overwrite local changes
            feedback_callback: Used to give periodic feedback

        Returns:
            Integer number of commits pulled down from remote.
        """
        gitworkflows_utils.sync_branch(self.repository, username=username, feedback_callback=feedback_callback)

        # result = gitworkflows_utils.sync_with_remote(repository=self.repository, username=username, remote=remote,
        #                                              force=force, feedback_callback=feedback_callback)
        #
        # if isinstance(self.repository, Dataset):
        #     self._push_dataset_objects(self.repository, username, feedback_callback, access_token, id_token)
        #
        # return result

    def reset(self, username: str):
        """ Perform a Git reset to undo all local changes"""
        bm = BranchManager(self.repository, username)
        if self.remote and bm.active_branch in bm.branches_remote:
            self.repository.git.fetch()
            call_subprocess(['git', 'reset', '--hard', f'origin/{bm.active_branch}'],
                            cwd=self.repository.root_dir)
            call_subprocess(['git', 'clean', '-fd'], cwd=self.repository.root_dir)