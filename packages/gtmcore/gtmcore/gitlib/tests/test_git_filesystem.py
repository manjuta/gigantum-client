import pytest

import os
os.environ['GITLIB_FS_BACKEND'] = 'filesystem-shim'

from .git_interface_mixin import GitInterfaceMixin
from .git_interface_mixin import mock_config_filesystem as mock_config
from .git_interface_mixin import mock_initialized_filesystem as mock_initialized
from .git_interface_mixin import mock_initialized_filesystem_with_remote as mock_initialized_remote
from gtmcore.gitlib import GitFilesystem


@pytest.mark.xfail
@pytest.mark.usefixtures("mock_config")
class TestGitFilesystem(GitInterfaceMixin):
    """Class to test the GitFilesystem interface"""
    class_type = GitFilesystem

    def get_git_obj(self, config):
        return GitFilesystem(config)

