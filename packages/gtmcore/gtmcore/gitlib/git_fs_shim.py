from typing import List

from gtmcore.gitlib.git_fs import GitFilesystem
from gtmcore.logging import LMLogger
import subprocess

logger = LMLogger.get_logger()


class GitFilesystemShimmed(GitFilesystem):

    def add(self, filename):
        """Add a file to a commit

        Args:
            filename(str): Filename to add.

        Returns:
            None
        """
        logger.info("Adding file {} to Git repository in {}".format(filename, self.working_directory))
        self._run(['git', 'add', f'{filename}'])

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
        """
        self._run(['git', 'remote', 'set-branches', remote_name] + branch_names)

    def _run(self, command: List[str]):
        """subprocess.run wrapped in a try block for error reporting

        Args:
            command: what to run with subprocess.run()
        """
        try:
            subprocess.run(command, stderr=subprocess.PIPE, stdout=subprocess.PIPE,
                               check=True, cwd=self.working_directory)
        except subprocess.CalledProcessError as x:
            logger.error(f'{x.stdout}, {x.stderr}')
            raise
