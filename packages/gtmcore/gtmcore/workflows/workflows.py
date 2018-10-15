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
import datetime
import subprocess
import shutil
import time
import os
from typing import Optional, Callable

from gtmcore.configuration import Configuration
from gtmcore.configuration.utils import call_subprocess
from gtmcore.labbook import LabBook
from gtmcore.logging import LMLogger
from gtmcore.workflows import core

logger = LMLogger.get_logger()


class GitWorkflow(object):

    def __init__(self, labbook: LabBook) -> None:
        self.labbook = labbook

    def garbagecollect(self):
        """ Run a `git gc` on the labbook. """
        core.git_garbage_collect(self.labbook)

    def publish(self, username: str, access_token: Optional[str] = None, remote: str = "origin",
                public: bool = False) -> None:
        """ Publish this labbook to the remote GitLab instance.

        Args:
            username: Subject username
            access_token: Temp token/password to gain permissions on GitLab instance
            remote: Name of Git remote (always "origin" for now).
            public: Allow public read access

        Returns:
            None
        """

        logger.info(f"Publishing {str(self.labbook)} for user {username} to remote {remote}")
        if self.labbook.has_remote:
            raise ValueError("Cannot publish Labbook when remote already set.")

        if self.labbook.active_branch != f'gm.workspace-{username}':
            raise ValueError(f"Must be on user workspace (gm.workspace-{username}) to sync")

        try:
            self.labbook.sweep_uncommitted_changes()
            vis = "public" if public is True else "private"
            t0 = time.time()
            core.create_remote_gitlab_repo(labbook=self.labbook, username=username,
                                           access_token=access_token, visibility=vis)
            logger.info(f"Created remote repo for {str(self.labbook)} in {time.time()-t0:.1f}sec")
            t0 = time.time()
            core.publish_to_remote(labbook=self.labbook, username=username, remote=remote)
            logger.info(f"Published {str(self.labbook)} in {time.time()-t0:.1f}sec")
        except Exception as e:
            # Unsure what specific exception add_remote creates, so make a catchall.
            logger.error(f"Publish failed {e}: {str(self.labbook)} may be in corrupted Git state!")
            call_subprocess(['git', 'reset', '--hard'], cwd=self.labbook.root_dir)
            self.labbook.checkout_branch(f"gm.workspace-{username}")
            raise e

    def sync(self, username: str, remote: str = "origin", force: bool = False) -> int:
        """ Sync with remote GitLab repo (i.e., pull any upstream changes and push any new changes). Following
        a sync operation both the local repo and remote should be at the same revision.

        Args:
            username: Subject user
            remote: Name of remote (usually only origin for now)
            force: In the event of conflict, force overwrite local changes

        Returns:
            Integer number of commits pulled down from remote.
        """
        return core.sync_with_remote(labbook=self.labbook, username=username, remote=remote, force=force)

    def _add_remote(self, remote_name: str, url: str):
        self.labbook.add_remote(remote_name=remote_name, url=url)


class ZipExporter(object):

    @classmethod
    def export_zip(cls, labbook_path: str, lb_export_directory: str) -> str:
        if not os.path.exists(os.path.join(labbook_path, '.gigantum')):
            # A gigantum labbook will contain a .gigantum hidden directory inside it.
            raise ValueError(f'Directory at {labbook_path} does not appear to be a Gigantum LabBook')

        if not os.path.isdir(lb_export_directory):
            os.makedirs(lb_export_directory, exist_ok=True)

        labbook: LabBook = LabBook()
        labbook.from_directory(labbook_path)
        core.sync_locally(labbook)

        labbook_dir, _ = labbook.root_dir.rsplit(os.path.sep, 1)

        logger.info(f"Exporting `{labbook.root_dir}` to `{lb_export_directory}`")
        if not os.path.exists(lb_export_directory):
            logger.warning(f"Creating client app export directory at `{lb_export_directory}`")
            os.makedirs(lb_export_directory)

        lb_zip_name = f'{labbook.name}_{datetime.datetime.now().strftime("%Y-%m-%d")}'
        zip_path = os.path.join(lb_export_directory, lb_zip_name)

        # zip data using subprocess - NOTE! Python zipfile library does not work correctly.
        call_subprocess(['zip', '-r', zip_path, labbook.name], cwd=labbook_dir, check=True)

        logger.info(f"Finished exporting {str(labbook)} to {zip_path}.zip")
        return f"{zip_path}.zip"

    @classmethod
    def import_zip(cls, archive_path: str, username: str, owner: str,
                   config_file: Optional[str] = None, base_filename: Optional[str] = None,
                   update_meta: Callable = lambda _ : None) -> LabBook:
        statusmsg = "Initializing..."
        update_meta(statusmsg)

        if not os.path.isfile(archive_path):
            raise ValueError(f'Archive at {archive_path} is not a file or does not exist')

        if '.zip' not in archive_path and '.lbk' not in archive_path:
            raise ValueError(f'Archive at {archive_path} does not have .zip (or legacy .lbk) extension')

        logger.info(f"Using {config_file or 'default'} LabManager configuration.")
        lm_config = Configuration(config_file)
        lm_working_dir: str = os.path.expanduser(lm_config.config['git']['working_directory'])

        # Infer the final labbook name
        inferred_labbook_name = os.path.basename(archive_path).split('_')[0]
        if base_filename:
            inferred_labbook_name = base_filename.split('_')[0]
        lb_containing_dir: str = os.path.join(lm_working_dir, username, owner, 'labbooks')

        if os.path.isdir(os.path.join(lb_containing_dir, inferred_labbook_name)):
            raise ValueError(
                f'LabBook {inferred_labbook_name} already exists at {lb_containing_dir}, cannot overwrite.')

        logger.info(f"Extracting LabBook from archive {archive_path} into {lb_containing_dir}")
        if lb_containing_dir[-1] != os.path.sep:
            dest_path = lb_containing_dir + os.path.sep
        else:
            dest_path = lb_containing_dir

        statusmsg = f'{statusmsg}\nUnzipping Project Archive...'
        update_meta(statusmsg)

        call_subprocess(['unzip', archive_path, '-d', dest_path], cwd=lm_working_dir, check=True)

        statusmsg = f'{statusmsg}\nFinished Unzip, checking integrity...'
        update_meta(statusmsg)

        new_lb_path = os.path.join(lb_containing_dir, inferred_labbook_name)
        if not os.path.isdir(new_lb_path):
            raise ValueError(f"Expected LabBook not found at {new_lb_path}")

        # Make sure you actually unzipped a Project archive
        if not os.path.exists(os.path.join(new_lb_path, '.gigantum', 'labbook.yaml')):
            # Delete bad import
            logger.warning(f'Imported invalid project archive. Deleting {new_lb_path}.')
            shutil.rmtree(new_lb_path)
            raise ValueError("Malformed Project archive. Verify you uploaded the correct file.")

        # Make the user also the new owner of the Labbook on import.
        lb = LabBook(config_file)
        lb.from_directory(new_lb_path)
        logger.info(f'Extracted archive resolves to new LabBook {str(lb)}')

        # Ignore execution bit changes (due to moving between windows/mac/linux)
        subprocess.check_output("git config core.fileMode false", cwd=lb.root_dir, shell=True)

        statusmsg = f'{statusmsg}\nCreating workspace branch...'
        update_meta(statusmsg)

        # This makes sure the working directory is set properly.
        core.sync_locally(lb, username=username)

        if not lb._data:
            raise ValueError(f'Could not load data from imported LabBook {lb}')
        lb._data['owner']['username'] = owner

        lb._save_labbook_data()
        if not lb.is_repo_clean:
            lb.git.add('.gigantum/labbook.yaml')
            lb.git.commit(message="Updated owner in labbook.yaml")

        if lb._data['owner']['username'] != owner:
            raise ValueError(f'Error importing LabBook {lb} - cannot set owner')

        # Also, remove any lingering remotes. If it gets re-published, it will be to a new remote.
        if lb.has_remote:
            lb.git.remove_remote('origin')

        statusmsg = f'{statusmsg}\nImport Complete'
        update_meta(statusmsg)

        logger.info(f"LabBook {inferred_labbook_name} imported to {lb.root_dir}")
        return lb
