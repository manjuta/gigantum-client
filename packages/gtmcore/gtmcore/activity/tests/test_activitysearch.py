import pytest
import random
import os
import shutil
import mock
from datetime import datetime

from gtmcore.labbook import LabBook
from gtmcore.inventory.inventory import InventoryManager
from gtmcore.files import FileOperations
from gtmcore.activity import ActivityRecord, ActivityDetailRecord, ActivityType, ActivityDetailType, ActivityStore
from gtmcore.workflows import LabbookWorkflow, DatasetWorkflow, MergeError, MergeOverride
from gtmcore.activity.search import ActivitySearch
from gtmcore.fixtures import (mock_config_with_activitystore, mock_config_lfs_disabled, mock_labbook_lfs_disabled, _MOCK_create_remote_repo2 as _MOCK_create_remote_repo)


def helper_create_labbook_change(labbook, cnt=0):
    """Helper method to create a change to the labbook"""
    # Make a new file
    new_filename = os.path.join(labbook.root_dir, ''.join(random.choice('0123456789abcdef') for i in range(15)))
    with open(new_filename, 'wt') as f:
        f.write(''.join(random.choice('0123456789abcdef ') for i in range(50)))

    # Add and commit file
    labbook.git.add_all()
    return labbook.git.commit("test commit {}".format(cnt))


class TestActivitySearch():

    def test_index_details(self, mock_config_with_activitystore):
        """Add a bunch of fields and make sure that search results match."""

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        # Create test values
        adr1 = ActivityDetailRecord(ActivityDetailType.CODE)
        adr1.show = True
        adr1.importance = 100
        adr1.tags = ['foo', 'bar']
        adr1.add_value("text/plain", "first one")

        adr2 = ActivityDetailRecord(ActivityDetailType.CODE)
        adr2.show = True
        adr2.importance = 0
        adr2.tags = ['mu', 'wah']
        adr2.add_value("text/plain", "second one")
        adr2.add_value("text/markdown", "<code>second two</code>")

        adr3 = ActivityDetailRecord(ActivityDetailType.CODE)
        adr3.show = True
        adr3.importance = 0
        adr3.tags = ['foo', 'mu']
        adr3.add_value("text/plain", "third one")
        adr3.add_value("text/markdown", "##third two")

        ar = ActivityRecord(ActivityType.CODE,
                            show=True,
                            message="added some code",
                            importance=50,
                            linked_commit=linked_commit.hexsha)

        ar.add_detail_object(adr1)
        ar.add_detail_object(adr2)
        ar.add_detail_object(adr3)

        ar_written = mock_config_with_activitystore[0].create_activity_record(ar)

        test_activitysearch = mock_config_with_activitystore[0].asearch

        res = test_activitysearch.searchDetail("tags","*")

        # check for tags
        res = test_activitysearch.searchDetail("tags","foo")
        assert(len(res)==2)

        res = test_activitysearch.searchDetail("tags","bar")
        assert(len(res)==1)

        # freetext searches
        res = test_activitysearch.searchDetail("freetext","two")
        assert(len(res)==2)

        res = test_activitysearch.searchDetail("freetext","three")
        assert(len(res)==0)

        res = test_activitysearch.searchDetail("freetext","third")
        assert(len(res)==1)

        # and search for mimetypes
        res = test_activitysearch.searchDetail("mimetypes","text/plain")
        assert(len(res)==3)

    def test_add_and_search(self, mock_config_with_activitystore):
        """Add a bunch of fields and make sure that search results match."""

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        a = ActivityRecord(ActivityType.NOTE)
        a.timestamp = datetime.now()
        a.linked_commit = linked_commit.hexsha
        a.tags = ['foo','bar']
        a.message = 'and this bird you cannot'

        recorda = mock_config_with_activitystore[0].create_activity_record(a)

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        b = ActivityRecord(ActivityType.CODE)
        b.timestamp = datetime.now()
        b.linked_commit = linked_commit.hexsha
        b.tags = ['moo','wah']
        b.message = 'whoa whoa whoa whoa waho and this bird'

        recordb = mock_config_with_activitystore[0].create_activity_record(b)

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        c = ActivityRecord(ActivityType.NOTE)
        c.commit = ''.join(random.choice('0123456789abcdef') for i in range(40))
        c.timestamp = datetime.now()
        c.linked_commit = linked_commit.hexsha
        c.tags = ['foo','moo']
        c.message = 'what song do y\'all wanna hear'

        recordc = mock_config_with_activitystore[0].create_activity_record(c)

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        d = ActivityRecord(ActivityType.MILESTONE)
        d.commit = ''.join(random.choice('0123456789abcdef') for i in range(40))
        d.timestamp = datetime.now()
        d.linked_commit = linked_commit.hexsha
        d.tags = ['bar','wah']
        d.message = 'free bird'

        recordd = mock_config_with_activitystore[0].create_activity_record(d)

        test_activitysearch = mock_config_with_activitystore[0].asearch

        test_activitysearch.refresh()

        res = test_activitysearch.search("tags","*")

        # 2 records with foo
        res = test_activitysearch.search("tags","foo")
        assert(len(res)==2)

        # 2 record that are NOTES
        res = test_activitysearch.search("record_type","NOTE")
        assert(len(res)==2)

        # 1 records that's a MILESTEONE
        res = test_activitysearch.search("record_type","MILESTONE")
        assert(len(res)==1)

        # 3 records with bird in the message
        res = test_activitysearch.search("commit_message","bird")
        assert(len(res)==3)

        # 3 records with commit in the message
        res = test_activitysearch.search("linked_commit_message","commit")
        assert(len(res)==4)


    def test_add_duplicates(self, mock_config_with_activitystore):
        """Add a bunch of fields and make sure that search results match."""

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        a = ActivityRecord(ActivityType.NOTE)
        a.timestamp = datetime.now()
        a.linked_commit = linked_commit.hexsha
        a.tags = ['foo','bar']
        a.message = 'and this bird you cannot'

        recorda = mock_config_with_activitystore[0].create_activity_record(a)

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        b = ActivityRecord(ActivityType.CODE)
        b.timestamp = datetime.now()
        b.linked_commit = linked_commit.hexsha
        b.tags = ['moo','wah']
        b.message = 'whoa whoa whoa whoa waho and this bird'

        recordb = mock_config_with_activitystore[0].create_activity_record(b)

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        c = ActivityRecord(ActivityType.NOTE)
        c.commit = ''.join(random.choice('0123456789abcdef') for i in range(40))
        c.timestamp = datetime.now()
        c.linked_commit = linked_commit.hexsha
        c.tags = ['foo','moo']
        c.message = 'what song do y\'all wanna hear'

        recordc = mock_config_with_activitystore[0].create_activity_record(c)

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        d = ActivityRecord(ActivityType.MILESTONE)
        d.commit = ''.join(random.choice('0123456789abcdef') for i in range(40))
        d.timestamp = datetime.now()
        d.linked_commit = linked_commit.hexsha
        d.tags = ['bar','wah']
        d.message = 'free bird'

        recordc = mock_config_with_activitystore[0].create_activity_record(d)

        test_activitysearch = mock_config_with_activitystore[0].asearch

        # check that there are 4 records
        res = test_activitysearch.search("*","*")
        assert(len(res)==4)

        # reindex the records
        mock_config_with_activitystore[0].index_activity()

        # check that we didn't make duplicates 
        res = test_activitysearch.search("*","*")
        assert(len(res)==4)

    @mock.patch('gtmcore.workflows.gitworkflows_utils.create_remote_gitlab_repo', new=_MOCK_create_remote_repo)
    def test_index_fromremote(self, mock_labbook_lfs_disabled, mock_config_lfs_disabled):
        """Create. Make records. Push to remote.  Delete. Pull.
           and then verify that the whoosh index was rebuilt correctly."""

        lb = mock_labbook_lfs_disabled[2]

        ## 1 - Make initial set of contributions to Labbook.
        assert lb.active_branch == "master"
        FileOperations.makedir(lb, relative_path='code/testy-tacked-dir', create_activity_record=True)
        FileOperations.makedir(lb, relative_path='input/input-dir', create_activity_record=True)
        FileOperations.makedir(lb, relative_path='output/output-dir', create_activity_record=True)

        # Count the whoosh records and make sure there are three
        astore = ActivityStore(lb)
        res = astore.asearch.search("*","*")
        assert(len(res)==3)

        # push the labbook to remote`
        wf = LabbookWorkflow(lb)
        # Now publish to remote (creating it in the process).
        wf.publish(username='test')

        # grab the remote
        remote = wf.remote

        # delete indexes and root
        res = astore.asearch.delete()
        shutil.rmtree(lb.root_dir)

        # now pull a remote
        fr_wf = LabbookWorkflow.import_from_remote(remote_url=remote, username="test",
                                                      config_file=mock_config_lfs_disabled[0])
        fr_lb = fr_wf.repository

        # Count the whoosh records and make sure there are three
        astore = ActivityStore(fr_lb)
        res = astore.asearch.search("*","*")
        assert(len(res)==3)

        # add some records
        FileOperations.makedir(fr_lb, relative_path='input/input-2-dir', create_activity_record=True)
        FileOperations.makedir(fr_lb, relative_path='output/output-2-dir', create_activity_record=True)

        # make sure there are 5
        res = astore.asearch.search("*","*")
        assert(len(res)==5)

        # delete indexes and root
        res = astore.asearch.delete()
        shutil.rmtree(fr_lb.root_dir)

        # get another from labbook
        fr_wf = LabbookWorkflow.import_from_remote(remote_url=remote, username="test",
                                                      config_file=mock_config_lfs_disabled[0])
        fr_lb = fr_wf.repository

        # should still be three -- no sync
        astore = ActivityStore(fr_lb)
        res = astore.asearch.search("*","*")
        assert(len(res)==3)

        # add some records
        FileOperations.makedir(fr_lb, relative_path='input/input-2-dir', create_activity_record=True)
        FileOperations.makedir(fr_lb, relative_path='output/output-2-dir', create_activity_record=True)

        # make sure there are 5
        res = astore.asearch.search("*","*")
        assert(len(res)==5)

        # and sync to remote
        # push the labbook to remote`
        fr_wf = LabbookWorkflow(fr_lb)
        # Now publish to remote (creating it in the process).
        fr_wf.sync(username='test')

        # delete indexes and root
        res = astore.asearch.delete()
        shutil.rmtree(fr_lb.root_dir)

        # get another from labbook
        fr_wf = LabbookWorkflow.import_from_remote(remote_url=remote, username="test",
                                                      config_file=mock_config_lfs_disabled[0])
        fr_lb = fr_wf.repository

        # should be five -- after sync
        astore = ActivityStore(fr_lb)
        res = astore.asearch.search("*","*")
        assert(len(res)==5)

    @mock.patch('gtmcore.workflows.gitworkflows_utils.create_remote_gitlab_repo', new=_MOCK_create_remote_repo)
    def test_merge_fromremote(self, mock_labbook_lfs_disabled, mock_config_lfs_disabled):
        """Create (in LB1), push, pull (as LB2), modify, sync, pull (changes from LB2 to LB1)
            Check index merge.
        """

        lb = mock_labbook_lfs_disabled[2]

        ## 1 - Make initial set of contributions to Labbook.
        assert lb.active_branch == "master"
        FileOperations.makedir(lb, relative_path='code/testy-tacked-dir', create_activity_record=True)
        FileOperations.makedir(lb, relative_path='input/input-dir', create_activity_record=True)
        FileOperations.makedir(lb, relative_path='output/output-dir', create_activity_record=True)

        # Count the whoosh records and make sure there are three
        astore = ActivityStore(lb)
        res = astore.asearch.search("*","*")
        assert(len(res)==3)

        # push the labbook to remote`
        wf = LabbookWorkflow(lb)
        # Now publish to remote (creating it in the process).
        wf.publish(username='test')

        # grab the remote
        remote = wf.remote

        # get another from labbook
        fr_wf = LabbookWorkflow.import_from_remote(remote_url=wf.remote, username="other",
                                                      config_file=mock_config_lfs_disabled[0])
        fr_lb = fr_wf.repository
        assert fr_lb.active_branch == "master"

        # Count the whoosh records and make sure there are three
        fr_astore = ActivityStore(fr_lb)
        res = fr_astore.asearch.search("*","*")
        assert(len(res)==3)

        # add some records
        FileOperations.makedir(fr_lb, relative_path='input/input-2-dir', create_activity_record=True)
        FileOperations.makedir(fr_lb, relative_path='output/output-2-dir', create_activity_record=True)

        # make sure there are 5
        res = fr_astore.asearch.search("*","*")
        assert(len(res)==5)

        # and sync to remote
        # push the labbook to remote`
        fr_wf = LabbookWorkflow(fr_lb)
        # Now publish to remote (creating it in the process).
        fr_wf.sync(username='other')

        # back in the context of lb
        wf.sync(username="test")

        # make sure there are 5
        res = astore.asearch.search("*","*")
        assert(len(res)==5)

    def test_checkout(self, mock_labbook_lfs_disabled):
        """ Create and merge indexes on checkout.
        """

        lb = mock_labbook_lfs_disabled[2]

        ## 1 - Make initial set of contributions to Labbook.
        assert lb.active_branch == "master"
        FileOperations.makedir(lb, relative_path='code/testy-tacked-dir', create_activity_record=True)
        FileOperations.makedir(lb, relative_path='input/input-dir', create_activity_record=True)
        FileOperations.makedir(lb, relative_path='output/output-dir', create_activity_record=True)

        # Count the whoosh records and make sure there are three
        astore = ActivityStore(lb)
        res = astore.asearch.search("*","*")
        assert(len(res)==3)

        # Checkout a different branch
        lb.checkout_branch("other-branch", new=True)

        # add some records
        FileOperations.makedir(lb, relative_path='input/input-2-dir', create_activity_record=True)
        FileOperations.makedir(lb, relative_path='output/output-2-dir', create_activity_record=True)

        # make sure there are 5
        res = astore.asearch.search("*","*")
        assert(len(res)==5)

        # delete the index
        astore.asearch.delete()

        # Checkout original branch -- this should update index
        lb.checkout_branch("master")

        # make sure there are 3.  This is what's visible in this branch.
        res = astore.asearch.search("*","*")
        assert(len(res)==3)

        # Checkout a different branch
        lb.checkout_branch("other-branch")

        # make sure there are 5. This is a partial index merge of other branch.
        res = astore.asearch.search("*","*")
        assert(len(res)==5)

