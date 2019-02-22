from elasticsearch import Elasticsearch
from datetime import datetime
from git import Commit
from typing import Dict, Union, List, Any, Optional

from gtmcore.labbook import LabBook
from gtmcore.activity import ActivityStore
from gtmcore.activity.records import ActivityRecord, ActivityDetailRecord
from gtmcore.logging import LMLogger

logger = LMLogger.get_logger()

# Right now, we'll only index text and markdown.  We may want to index JSON going forward.
INDEXABLE_MIME_TYPES = ['text/plain','text/markdown']

class ESActivityIndex:
# ElasticSearch class for indexing and searchin on activity records.
#
#  This is a first version for public labbooks. 
#    It will be able to search by user, but not provide any privacy protections.
#    All users can access all records.

# RB Comment.  We choose to use two indices one for activity and one for details so that the large
#  detail records won't reduce search performance on the much smaller activity records.
#  This is not clearly the right decision, but it does protect/insulate the activity index
#  from lots of large text objects in the details.
#
#   see Elastic search - one index vs multiple indexes? in Stack Overflow
#
#   The benefit of keeping as one index would be that we could query details and activity in one go.....
#    and maybe make batch indexing easier.

    # mapping for activity records
    activity_mapping = {
        "mappings": {
            "activity_record": { 
                "properties": { 
                    "commit":           { "type": "keyword" },
                    "linked_commit":    { "type": "keyword" },
                    "project":          { "type": "keyword" },   # nee labbook
                    "name":             { "type": "text" },
                    "email":            { "type": "keyword" },
                    "commit_message":   { "type": "text" },
                    "linked_commit_message":   { "type": "text" },
                    "record_type":      { "type": "keyword" }, 
                    "tags":             { "type": "keyword" }, 
                    "timestamp":        { "type": "date", "format": "strict_date_optional_time||epoch_millis" }
                }
            }
        }
    }

    # mapping for detail records
    detail_mapping = { 
        "mappings": {
            "detail_record": { 
                "properties": { 
                    "key":              { "type": "keyword" },
                    "commit":           { "type": "keyword" },
                    "project":          { "type": "keyword" },   # nee labbook
                    "linked_commit":    { "type": "keyword" },
                    "record_type":      { "type": "keyword" },
                    "record_action":    { "type": "keyword" },
                    "tags":             { "type": "keyword" },
                    "mime_types":       { "type": "keyword" },
                    "importance":       { "type": "keyword" },
                    "free_text":        { "type": "text" }, 
                    "timestamp":        { "type": "date", "format": "strict_date_optional_time||epoch_millis" }
                }
            }
        }
    }

    def __init__(self, index_name: str, server: str, create=False) -> None:
        """Initialize class."""

        self.index_name = index_name
        # assume that we are on a single server endpoint.
        self.servers = [ server ]

        if create:
            if (not self.exists()):
                # create if requested
                self.create() 
            else:
                raise(ValueError(f"Indices already exists for server {self.servers} index name {self.index_name}"))

    def create(self) -> None:
        """Define index and instantiate on ES server.  Including mappings.
            Call through the consructor.
        """

        es = Elasticsearch(self.servers)

        # create two indexes one for activity records and one for detail records
        es.indices.create(index=f"{self.index_name}_activity", body=self.activity_mapping)
        es.indices.create(index=f"{self.index_name}_detail", body=self.detail_mapping)

    def destroy(self) -> None:
        """Destroy an index (used for testing).  Don't do this.
            But do it right if you do.  It should remove detail
            even if activity doesn't exist."""
        es = Elasticsearch(self.servers)
        try:    
            es.indices.delete(index=f"{self.index_name}_activity")
        except:
            es.indices.delete(index=f"{self.index_name}_detail")
            raise
        es.indices.delete(index=f"{self.index_name}_detail")

    def exists(self) -> bool:
        """Check if index exists"""
        es = Elasticsearch(self.servers)
        aexists = es.indices.exists(index=f"{self.index_name}_activity")
        dexists = es.indices.exists(index=f"{self.index_name}_detail")

        if aexists and dexists:
            return True
        elif not aexists and not dexists:
            return False
        else:
            raise(ValueError(f"Inconsistent state for index {self.index_name}. Activity index exists == {aexists} and Detail index exists == {dexists}"))

    def flush(self) -> None:
        """
            Attempt to flush and sync elasticsearch.    
            Hopefully this will make data consistent.

            Args:
                labbook(LabBook) -- used to identify indices.

            Returns:
                None
        """
        es = Elasticsearch(self.servers)
        es.indices.flush(index=f"{self.index_name}_activity")
        es.indices.flush(index=f"{self.index_name}_detail")

    def add(self, record: ActivityRecord, project: str, labbook: LabBook) -> None:
        """
            Add an ActivityRecord to the search index.
            Configure index writers and calls the low-level method _add_record

            Args:
                record(ActivityRecord) -- record to be added
                project(str) -- unique name to refer to gigantum project
                labbook(LabBook) -- needed to lookup commits

            Returns:
                None
        """
        es = Elasticsearch(self.servers)

        # populate the record with metadata from git log
        # if there's no linked commit, get metadata from current commit.
        if record.linked_commit == 'no-linked-commit':
    
            commit_record = labbook.git.log_entry(record.commit)
            ar_dict = { "commit": record.commit, 
                        "linked_commit": record.linked_commit,
                        "project": project,
                        "name": commit_record['author']['name'],
                        "email": commit_record['author']['email'],
                        "commit_message": record.message,
                        "linked_commit_message": "",
                        "record_type": record.type.name,
                        "tags": record.tags,
                        "timestamp": commit_record['committed_on'] }

        # otherwise used linked-commit and add linked-commit message also
        else:
            linked_commit_record = labbook.git.log_entry(record.linked_commit)
            ar_dict = { "commit": record.commit, 
                        "linked_commit": record.linked_commit,
                        "project": project,
                        "name": linked_commit_record['author']['name'],
                        "email": linked_commit_record['author']['email'],
                        "commit_message": record.message,
                        "linked_commit_message": linked_commit_record['message'],
                        "record_type": record.type.name,
                        "tags": record.tags,
                        "timestamp": linked_commit_record['committed_on'] }

        es.index(index=f"{self.index_name}_activity", doc_type="activity_record", body=ar_dict)

        # add details with linked_commit
        with record.inspect_detail_objects() as detail_objs:
            ars = ActivityStore(labbook)
            for i, obj in enumerate(detail_objs):
                obj_loaded = ars.get_detail_record(obj.key) 
                self._add_detail(es, obj_loaded, project, record.commit, record.linked_commit, ar_dict["timestamp"])

    def _add_detail(self, es: Elasticsearch, record: ActivityDetailRecord, project: str, commit: Optional[str], linked_commit: Optional[str], timestamp: datetime) -> None:
        """
            Add a detail record to the index.

            Args:
                es -- an open Elasticsearch service
                record(dict): ActivityDetailRecord
                project(str) -- unique name to refer to gigantum project
                commit: connect detail to original activity
                linked_commit: connect detail to activity record
                time_stamp: so we can search by time
            
            Returns:
                None
        """

        mimetypes = list()
        freetext = str()

        # extract mimetypes and freetext
        for mime_type, dataobj in record.data.items():
          mimetypes.append(mime_type)
          if mime_type in INDEXABLE_MIME_TYPES:
            # flatten freetext into uni-str
            freetext = freetext + dataobj + "\n"

        ad_dict = { "commit": commit, 
                    "linked_commit": linked_commit,
                    "project": project,
                    "record_type": record.type.name,
                    "record_action": record.action.name,
                    "mimetypes": mimetypes,
                    "freetext": freetext, 
                    "importance": record.importance,
                    "tags": record.tags,
                    "timestamp": timestamp }

        es.index(index=f"{self.index_name}_detail", doc_type="detail_record", body=ad_dict)

    def search_activity(self, field: str, terms: str) -> List:
        """Simple search for terms in a field.
            If the field is not given (None), look in all fields.

            Args:
                field(str): field in which to search
                terms(str): terms to identify in the field
            
            Returns:
                iterable(dict)
        """
        es = Elasticsearch(self.servers)

        query = {"query": {"match": {field : terms}}}
        res = es.search(index=f"{self.index_name}_activity", body=query)

        return res['hits']['hits']
    
    def search_detail(self, field: str, terms: str) -> List:
        """Simple search for terms in a field.
            If the field is not given (None), look in all fields.

            Args:
                field(str): field in which to search
                terms(str): terms to identify in the field
            
            Returns:
                iterable(dict)
        """
        es = Elasticsearch(self.servers)

        query = {"query": {"match": {field : terms}}}
        res = es.search(index=f"{self.index_name}_detail", body=query)

        return res['hits']['hits']

    def add_if_doesnt_exist(self, record: ActivityRecord, project: str, labbook: LabBook) -> None:
        """
            This adds a record if it's not already stored.  Given that records
            are write once and immutable, there is no udpate to the index. 
            When we switch branches, we have no idea what's indexed and what's not.

            Args:
                record(ActivityRecord) -- record to be added
                project(str) -- unique name to refer to gigantum project
                labbook(LabBook) -- needed to lookup commits

            Returns:
                None
        """
        es = Elasticsearch(self.servers)

        # see if record.commit is in the database.
        # if not, add record
        if not self.search_activity("commit",record.commit):
            self.add(record, project, labbook)
