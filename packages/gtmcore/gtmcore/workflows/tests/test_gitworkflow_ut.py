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
# OUT OF OR IN CO
import pytest
import mock
import os

from gtmcore.workflows import GitWorkflow, GitWorkflowException
from gtmcore.fixtures import (_MOCK_create_remote_repo2 as _MOCK_create_remote_repo, mock_labbook_lfs_disabled,
                              mock_config_file)
from gtmcore.inventory.branching import BranchManager


class TestGitWorkflowsMethods(object):

    @mock.patch('gtmcore.workflows.gitworkflows_utils.create_remote_gitlab_repo', new=_MOCK_create_remote_repo)
    def test_publish_simple(self, mock_labbook_lfs_disabled):
        """Test a simple publish and ensuring master is active branch. """
        username = 'test'
        lb = mock_labbook_lfs_disabled[2]
        bm = BranchManager(lb, username)
        bm.create_branch('test-local-only')
        assert bm.branches_remote == []
        assert bm.branches_local == ['master', 'test-local-only']

        wf = GitWorkflow(lb)

        # Test you can only publish on master.
        with pytest.raises(GitWorkflowException):
            wf.publish(username=username)
        assert wf.remote is None

        # Once we return to master branch, then we can publish.
        bm.workon_branch(bm.workspace_branch)
        wf.publish(username=username)
        assert os.path.exists(wf.remote)

        # Assert that publish only pushes up the master branch.
        assert bm.branches_local == ['master', 'test-local-only']
        assert bm.branches_remote == ['master']

    @mock.patch('gtmcore.workflows.gitworkflows_utils.create_remote_gitlab_repo', new=_MOCK_create_remote_repo)
    def test_publish_cannot_overwrite(self, mock_labbook_lfs_disabled):
        """ Test cannot publish a project already published. """
        username = 'test'
        lb = mock_labbook_lfs_disabled[2]
        wf = GitWorkflow(lb)
        wf.publish(username=username)
        with pytest.raises(GitWorkflowException):
            wf.publish(username=username)

    @mock.patch('gtmcore.workflows.gitworkflows_utils.create_remote_gitlab_repo', new=_MOCK_create_remote_repo)
    def test_import_remote_labbook(self, mock_labbook_lfs_disabled, mock_config_file):
        """ test import_remote_labbook method """
        username = 'testuser'
        lb = mock_labbook_lfs_disabled[2]
        wf = GitWorkflow(lb)
        wf.publish(username=username)

        other_user = 'other-test-user2'
        wf_other = GitWorkflow.import_remote_labbook(wf.remote, username=other_user,
                                                     config_file=mock_config_file[0])
        # The remotes must be the same, cause it's the same remote repo
        assert wf_other.remote == wf.remote
        # The actual path on disk will be different, though
        assert wf_other.repository != wf.repository
        # Check imported into namespace of original owner (testuser)
        assert 'testuser/labbooks/labbook1' in wf_other.repository.root_dir

    @mock.patch('gtmcore.workflows.gitworkflows_utils.create_remote_gitlab_repo', new=_MOCK_create_remote_repo)
    def test_import_remote_dataset(self, mock_labbook_lfs_disabled, mock_config_file):
        """ test import_remote_labbook method """
        assert False

    @mock.patch('gtmcore.workflows.gitworkflows_utils.create_remote_gitlab_repo', new=_MOCK_create_remote_repo)
    def test_sync___push_up_new_branch(self, mock_labbook_lfs_disabled, mock_config_file):
        """ test import_remote_labbook method """
        username = 'test'
        lb = mock_labbook_lfs_disabled[2]
        wf = GitWorkflow(lb)
        wf.publish(username=username)
        bm = BranchManager(lb, username='test')
        bm.create_branch('new-branch-to-push')
        assert 'new-branch-to-push' not in bm.branches_remote
        wf.sync('test')
        assert 'new-branch-to-push' in bm.branches_remote
