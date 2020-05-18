import os
import pickle
from pathlib import Path
from subprocess import run

import pytest
from git import Repo

from gtmcore.environment import RepositoryManager
from gtmcore.fixtures import mock_config_file, setup_index, ENV_UNIT_TEST_BASE, ENV_UNIT_TEST_REPO, ENV_UNIT_TEST_REV
from gtmcore.fixtures.fixtures import _create_temp_work_dir
from gtmcore.environment.tests import ENV_SKIP_MSG, ENV_SKIP_TEST


@pytest.mark.skipif(ENV_SKIP_TEST, reason=ENV_SKIP_MSG)
class TestEnvironmentRepositoryManager(object):
    def test_clone_repositories_branch(self):
        """Test cloning a branch"""
        conf_file, working_dir = _create_temp_work_dir(override_dict={'environment':
                   {'repo_url': ["https://github.com/gigantum/base-images-testing.git@test-branch-DONOTDELETE"]}})

        # Run clone and index operation
        erm = RepositoryManager(conf_file)
        erm.update_repositories()

        assert os.path.exists(os.path.join(working_dir, ".labmanager")) is True
        assert os.path.exists(os.path.join(working_dir, ".labmanager", "environment_repositories")) is True
        assert os.path.exists(os.path.join(working_dir, ".labmanager", "environment_repositories",
                                           ENV_UNIT_TEST_REPO)) is True
        assert os.path.exists(os.path.join(working_dir, ".labmanager", "environment_repositories",
                                           ENV_UNIT_TEST_REPO, "README.md")) is True

        r = Repo(os.path.join(working_dir, ".labmanager", "environment_repositories", ENV_UNIT_TEST_REPO))
        assert r.active_branch.name == "test-branch-DONOTDELETE"

    def test_update_repositories(self, setup_index):
        """Test building the index"""
        erm, working_dir, conf_file = setup_index[:3]
        gigantum_path = Path(working_dir)
        base_repo = gigantum_path / ".labmanager" / "environment_repositories" / ENV_UNIT_TEST_REPO
        # Existence of the README file implies all intermediate directories exist
        assert (base_repo / "README.md").exists()
        # This will break if we change master, or if somehow we get some other HEAD that's not master
        assert run(['git', 'rev-parse', 'HEAD'], cwd=base_repo, capture_output=True).stdout.strip() == \
                b'3aa9bde4d2e03e28571e81d1ed099674dea8c7ad'

        # If the repositories are already checked out, this triggers a different code-path
        erm.update_repositories()

        assert run(['git', 'rev-parse', 'HEAD'], cwd=base_repo, capture_output=True).stdout.strip() == \
               b'3aa9bde4d2e03e28571e81d1ed099674dea8c7ad'

    def test_index_repositories_base_image(self, setup_index):
        """Test creating and accessing the detail version of the base image index"""
        # Verify index file contents
        with open(os.path.join(setup_index[0].local_repo_directory, "base_index.pickle"), 'rb') as fh:
            data = pickle.load(fh)

        assert ENV_UNIT_TEST_REPO in data
        assert ENV_UNIT_TEST_BASE in data[ENV_UNIT_TEST_REPO]
        assert ENV_UNIT_TEST_REV in data[ENV_UNIT_TEST_REPO][ENV_UNIT_TEST_BASE]
        assert "image" in data[ENV_UNIT_TEST_REPO][ENV_UNIT_TEST_BASE][ENV_UNIT_TEST_REV]
        assert "server" in data[ENV_UNIT_TEST_REPO][ENV_UNIT_TEST_BASE][ENV_UNIT_TEST_REV]['image']
        assert "package_managers" in data[ENV_UNIT_TEST_REPO][ENV_UNIT_TEST_BASE][ENV_UNIT_TEST_REV]
        assert "repository" in data[ENV_UNIT_TEST_REPO][ENV_UNIT_TEST_BASE][ENV_UNIT_TEST_REV]

    def test_index_repositories_base_image_list(self, setup_index):
        """Test accessing the list version of the base image index"""
        # Verify index file contents
        with open(os.path.join(setup_index[0].local_repo_directory, "base_list_index.pickle"), 'rb') as fh:
            data = pickle.load(fh)

        assert len(data) >= 2
        assert any(n.get('id') == ENV_UNIT_TEST_BASE for n in data)
