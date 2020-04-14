import tempfile
from pathlib import Path

import pytest

import os
os.environ['GITLIB_FS_BACKEND'] = 'filesystem-shim'

from gtmcore.gitlib import GitFilesystemShimmed
from gtmcore.gitlib.tests.git_interface_mixin import GitInterfaceMixin, get_backend, write_file
from gtmcore.gitlib.tests.git_interface_mixin import mock_config_filesystem as mock_config
from gtmcore.gitlib.tests.git_interface_mixin import mock_initialized_filesystem as mock_initialized
from gtmcore.gitlib.tests.git_interface_mixin import mock_initialized_filesystem_with_remote as mock_initialized_remote



@pytest.mark.usefixtures("mock_config")
class TestGitFilesystem(GitInterfaceMixin):
    """Class to test the GitFilesystem interface"""
    class_type = GitFilesystemShimmed

    def get_git_obj(self, config):
        print('----------------------')
        import pprint; pprint.pprint(config)
        return GitFilesystemShimmed(config)

    def test_reset(self, mock_initialized_remote):
        bare_working_dir = mock_initialized_remote[3]
        with tempfile.TemporaryDirectory() as scratch_working_dir:
            config = {"backend": get_backend(), "working_directory": scratch_working_dir}
            git = self.get_git_obj(config)

            git.clone(bare_working_dir, scratch_working_dir)
            unwanted_fname = "go-away.txt"
            write_file(git, unwanted_fname, "Unwanted content", commit_msg="unwanted commit")
            assert Path(scratch_working_dir, unwanted_fname).exists()

            git.reset('origin/master')
            # We are back to the previous commit
            assert not Path(scratch_working_dir, unwanted_fname).exists()

    def test_remote_set_branches(self, mock_initialized_remote):
        bare_working_dir = mock_initialized_remote[3]
        with tempfile.TemporaryDirectory() as scratch_working_dir:
            config = {"backend": get_backend(), "working_directory": scratch_working_dir}
            git = self.get_git_obj(config)

            git.clone(bare_working_dir, scratch_working_dir, branch='test_branch', single_branch=True)
            git.fetch('master')
            with pytest.raises(ValueError):
                git.checkout('master')
            git.remote_set_branches(['master'])
            git.fetch('master')
            git.checkout('master')
