import pytest

import os
os.environ['GITLIB_FS_BACKEND'] = 'filesystem-shim'

from gtmcore.gitlib import GitFilesystemShimmed
from gtmcore.gitlib.tests.git_interface_mixin import GitInterfaceMixin
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
