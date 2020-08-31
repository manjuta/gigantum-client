import os
from typing import List, Optional

from gtmcore.gitlib.git_fs import GitFilesystem
from gtmcore.logging import LMLogger
import subprocess

logger = LMLogger.get_logger()


class GitFilesystemShimmed(GitFilesystem):

    # INFORMATIONAL
    def check_ignored(self, path: str) -> bool:
        """Check if path is ignored (e.g., via .gitignore)

        path: a path relative to the repository root

        Returns:
            is the path ignored?
        """
        result = self._run(['git', 'check-ignore', path], check=False)

        return result != ''

    def list_submodules(self):
        """Method to list the name of configured submodules

            Should return a list of dicts with the format:

        Returns:
            list(str)
        """
        # Git-python is broken when not all submodules have been initialized and you try to do remote git ops.
        # So instead of listing with self.repo.submodules, we just look at the .gitmodule file
        submodule_list = list()
        gitmodules_file = os.path.join(self.working_directory, '.gitmodules')
        if os.path.exists(gitmodules_file):
            if os.stat(gitmodules_file).st_size > 0:
                result = self._run(['git', 'config', '--file', '.gitmodules', '--name-only', '--get-regexp', 'path'])
                if result:
                    for line in result.split('\n'):
                        if line:
                            _, part = line.split('submodule.')
                            name, _ = part.split('.path')
                            submodule_list.append(name)

        return submodule_list

    # MODIFY
    def add(self, filename) -> bool:
        """Add a file to a commit

        Args:
            filename(str): Filename to add.

        Returns:
            None
        """
        if self.check_ignored(filename):
            # This file is ignored - don't do any git operations
            logger.info(f"Skipped adding untracked {filename} to Git repository in {self.working_directory}")
            return False
        else:
            logger.info(f"Adding file {filename} to Git repository in {self.working_directory}")
            self._run(['git', 'add', f'{filename}'])

        # We added something
        return True

    def add_all(self, relative_directory=None) -> bool:
        """Add all changes/files using the `git add -A` command

        Args:
            relative_directory(str): Relative directory (from the root_dir) to add everything

        Returns:
            None
        """
        if relative_directory:
            if self.check_ignored(relative_directory):
                # This file is ignored - don't do any git operations
                logger.info(f"Skipped adding untracked {relative_directory} to Git repository in {self.working_directory}")
                return False
            self.repo.git.add(relative_directory, A=True)
        else:
            self.repo.git.add(A=True)

        return True

    def reset(self, branch_name: str):
        """git reset --hard current branch to the treeish specified by branch_name

        Args:
            branch_name: What to reset current branch to? Will be passed directly to git
        """
        self._run(['git', 'reset', '--hard', branch_name])

    def remote_set_branches(self, branch_names: List[str], remote_name: str = 'origin'):
        """git remote set-branch to the list of branches

        Args:
            branch_names: What branches do you want to track?
            remote_name: Which git remote? Default is 'origin'
        """
        self._run(['git', 'remote', 'set-branches', remote_name] + branch_names)

    def _run(self, command: List[str], working_directory: Optional[str] = None, check=True) -> str:
        """subprocess.run wrapped in a try block for error reporting

        Args:
            command: what to run with subprocess.run()
            working_directory: usually a path within a Git repo. Defaults to the instance working_directory
            check: Raise an exception on non-zero return code?

        Returns:
            The stdout from the process as a string
        """
        if working_directory is None:
            working_directory = self.working_directory

        try:
            result = subprocess.run(command, capture_output=True, text=True, check=check, cwd=working_directory)
        except subprocess.CalledProcessError as x:
            logger.error(f'{x.stdout}, {x.stderr}')
            raise

        return result.stdout

    # SYNC / REPLICATE
    def clone(self, source: str, directory: str, branch: Optional[str] = None, single_branch=False):
        """Clone a repo

        Args:
            source: Git ssh or https string to clone - should be a bare path, or include '/' as a final delimiter
            directory: Directory to clone into
            branch: The name of the desired branch to be checked out (defaults to master)
            single_branch: Fetch ONLY the contents of the specified branch

        Returns:
            None
        """
        if self.repo:
            raise ValueError("Cannot init an existing git repository. Choose a different working directory")

        logger.info("Cloning Git repository from {} into {}".format(source, directory))
        args = []
        if branch is not None:
            args.extend(['--branch', branch])
        if single_branch:
            args.append('--single-branch')

        command_string = ['git', 'clone'] + args + [source, directory]

        self._run(command_string)
        self.set_working_directory(directory)
