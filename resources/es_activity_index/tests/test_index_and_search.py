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

es_ip = "172.17.0.2"

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

        index_name = "".join(random.choice('0123456789abcdef') for i in range(20))

        # should be no index
        aidx = ESActivityIndex(index_name, es_ip)
        assert(aidx.exists()==False)
        
        # create on same name
        aidx = ESActivityIndex(index_name, es_ip, create=True)
        assert(aidx.exists()==True)

        # delete one of the indexes and make sure exists raises an error
        es = Elasticsearch([es_ip])
        es.indices.delete(index=f"{index_name}_detail")
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
        index_name = "".join(random.choice('0123456789abcdef') for i in range(20))
        aidx = ESActivityIndex(index_name, es_ip, create=True)

        # Iterate over activity records and store them.
        for rec in mock_config_with_activitystore[0].get_activity_records():
            aidx.add(rec, mock_config_with_activitystore[1].name, mock_config_with_activitystore[1])

        aidx.flush()

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

    def test_details(self, mock_config_with_activitystore):

        linked_commit = helper_create_labbook_change(mock_config_with_activitystore[1], 1)

        ar = ActivityRecord(ActivityType.NOTE)
        ar.timestamp = datetime.now()
        ar.linked_commit = linked_commit.hexsha
        ar.tags = ['foo','bar', 'mu', 'wa']
        ar.message = 'hi, my name is'

        ad1 = ActivityDetailRecord(ActivityDetailType.CODE)
        ad1.show = True
        ad1.importance = 100
        ad1.tags = ['foo', 'mu']
        ad1.add_value("text/plain", "slim shady")

        ad2 = ActivityDetailRecord(ActivityDetailType.CODE)
        ad2.show = True
        ad2.importance = 0
        ad2.tags = ['bar', 'wah']
        ad2.add_value("text/plain", "please stand up")
        ad2.add_value("text/markdown", "<code>would the real slim shady</code>")

        ad3 = ActivityDetailRecord(ActivityDetailType.CODE)
        ad3.show = True
        ad3.importance = 0
        ad3.tags = ['wah', 'foo']
        ad3.add_value("text/plain", "I'm the real shady")
        ad3.add_value("text/markdown", "##stand up") 

        ar.add_detail_object(ad1)
        ar.add_detail_object(ad2)
        ar.add_detail_object(ad3)

        # make an activity record
        recorda = mock_config_with_activitystore[0].create_activity_record(ar)

        # Create an index
        index_name = "".join(random.choice('0123456789abcdef') for i in range(20))
        aidx = ESActivityIndex(index_name, es_ip, create=True)

        # Iterate over activity records and store them.
        for rec in mock_config_with_activitystore[0].get_activity_records():
            aidx.add(rec, index_name, mock_config_with_activitystore[1])

        aidx.flush()

        #RBTODO -- index populated, but queries not processing right......
        # check for tags
        res = aidx.search_detail("tags","foo")
        assert(len(res)==2)

        res = aidx.search_detail("tags","bar")
        assert(len(res)==1)

        # freetext searches
        res = aidx.search_detail("freetext","stand")
        assert(len(res)==2)

        res = aidx.search_detail("freetext","shady")
        assert(len(res)==3)

        # and search for mimetypes
        res = aidx.search_detail("mimetypes","plain")
        assert(len(res)==3)

        # and search for mimetypes
        res = aidx.search_detail("mimetypes","markdown")
        assert(len(res)==2)

        # importance
        res = aidx.search_detail("importance","100")
        assert(len(res)==1)

    def test_destroy(self, mock_config_with_activitystore):
        """Destory any hanging on indexes in case.  Not a test."""
        try:
            aidx = ESActivityIndex(mock_config_with_activitystore[1].name, es_ip)
            aidx.destroy()
        except:
            pass
