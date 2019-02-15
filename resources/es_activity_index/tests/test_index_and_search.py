import pytest
import os
import random
from datetime import datetime, timedelta, timezone

from gtmcore.labbook import LabBook
from gtmcore.activity import ActivityStore
from gtmcore.activity.records import ActivityType, ActivityRecord, ActivityDetailRecord, ActivityDetailType
from gtmcore.fixtures import mock_config_with_activitystore

from resources.es_activity_index import ESActivityIndex
from elasticsearch import Elasticsearch

es_ip = "172.17.0.3"


def helper_create_labbook_change(labbook, cnt=0):
    """Helper method to create a change to the labbook"""
    # Make a new file
    new_filename = os.path.join(labbook.root_dir, ''.join(random.choice('0123456789abcdef') for i in range(15)))
    with open(new_filename, 'wt') as f:
        f.write(''.join(random.choice('0123456789abcdef ') for i in range(50)))

    # Add and commit file
    labbook.git.add_all()
    return labbook.git.commit("test commit {}".format(cnt))


class TestElasticSearch:    

    def test_create_destroy(self, mock_config_with_activitystore):

        # should be no index
        with pytest.raises(ValueError):
            aidx = ESActivityIndex(mock_config_with_activitystore[1].name, es_ip)
        
        # create on same name
        aidx = ESActivityIndex(mock_config_with_activitystore[1].name, es_ip, create=True)
        assert(aidx.exists()==True)

        # delete one of the indexes and make sure exists raises an error
        es = Elasticsearch([es_ip])
        es.indices.delete(index=f"{mock_config_with_activitystore[1].name}_detail")
        with pytest.raises(ValueError):
            aidx.exists()

        # destroy the indices. should produce and error
        with pytest.raises(Exception):
            aidx.destroy()

        # but should have destroyed them
        assert(aidx.exists()==False)

    def test_add_and_search(self, mock_config_with_activitystore):
        """Read all records in a labbook and write to an elasticsearch index"""

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
        b.message = 'whoa whoa whoa whoa whoa and this bird'

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

        # Create an index
        aidx = ESActivityIndex(mock_config_with_activitystore[1].name, es_ip, create=True)

        # Iterate over activity records and store them.
        for rec in mock_config_with_activitystore[0].get_activity_records():
            aidx.add(rec, mock_config_with_activitystore[1])

        # 2 records with foo
        res = aidx.search_activity("tags","foo")
        #assert(len(res)==2)

        # 2 record that are NOTES
        res = aidx.search_activity("record_type","NOTE")
        #assert(len(res)==2)

        # 1 records that's a MILESTEONE
        res = aidx.search_activity("record_type","MILESTONE")
        #assert(len(res)==1)

        # 3 records with bird in the message
        res = aidx.search_activity("commit_message","bird")
        #assert(len(res)==3)

        # 3 records with commit in the message
        res = aidx.search_activity("linked_commit_message","commit")
        #assert(len(res)==4)

        aidx.destroy()

    def test_destroy(self, mock_config_with_activitystore):
        """Make sure no indexes are hanging around"""

        # Create an index
        aidx = ESActivityIndex(mock_config_with_activitystore[1].name, es_ip)

        # Iterate over activity records and store them.
        for rec in mock_config_with_activitystore[0].get_activity_records():
            aidx.add(rec)

        aidx.destroy()


    def test_destroy(self, mock_config_with_activitystore):
        """Destory any hanging on indexes in case.  Not a test."""
        try:
            aidx = ESActivityIndex(mock_config_with_activitystore[1].name, es_ip)
            aidx.destroy()
        except:
            pass
