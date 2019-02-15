from elasticsearch import Elasticsearch
from datetime import datetime
from git import Commit
from typing import Dict, Union, List, Any, Optional

from gtmcore.labbook import LabBook
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

    # mapping for labnotes
    # add level as a tag 
    activity_mapping = {
        "mappings": {
            "activity_record": { 
                "properties": { 
                    "commit":           { "type": "text" },
                    "linkedcommit":     { "type": "text" },
                    "name":             { "type": "text" },
                    "email":            { "type": "text" },
                    "commit_message":   { "type": "text" },
                    "linked_commit_message":   { "type": "text" },
                    "record_type":      { "type": "keyword" }, 
                    "tags":             { "type": "keyword" }, 
                    "timestamp":        { "type": "date", "format": "strict_date_optional_time||epoch_millis" }
                }
            }
        }
    }

    detail_mapping = { 
        "mappings": {
            "activity_detail": { 
                "properties": { 
                    "key":              { "type": "keyword" },
                    "commit":           { "type": "text" },
                    "linkedcommit":     { "type": "text" },
                    "record_type":      { "type": "text" },
                    "tags":             { "type": "keyword" },
                    "mime_types":       { "type": "keyword" },
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
                self._create() 
            else:
                raise(ValueError(f"Indices already exists for server {self.servers} index name {self.index_name}"))

        else:
            # verify that index exists and is accessible
            if not self.exists():
                raise ValueError(f"No existing indices found for {self.index_name}")

    def _create(self) -> None:
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

    def add(self, record: ActivityRecord, labbook: LabBook) -> None:
        """
            Add an ActivityRecord to the search index.
            Configure index writers and calls the low-level method _add_record

            Args:
                record(ActivityRecord)

            Returns:
                None
        """
        es = Elasticsearch(self.servers)

        # populate the record with metadata from git log
        # if there's no linked commit, get metadata from current commit.
        if record.linked_commit == 'no-linked-commit':
    
            commit_record = labbook.git.log_entry(record.commit)
            ar_dict = { "commit": record.commit, 
                        "linkedcommit": record.linked_commit,
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
                        "linkedcommit": record.linked_commit,
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
            for i, obj in enumerate(detail_objs):
                import pdb; pdb.set_trace()
                assert(0)
                self._add_detail(es, record.commit, record.linked_commit, linked_commit_record['committed_on'], ob[3])


    def _add_detail(self, es: Elasticsearch, commit: Optional[str], linked_commit: Optional[str], timestamp: datetime, record: ActivityDetailRecord) -> None:
        """
            Add a detail record to the index.

            Args:
                es -- an open Elasticsearch service
                commit: connect detail to original activity
                linked_commit: connect detail to activity record
                time_stamp: so we can search by time
                recordid(str): commit_hash of activity entry
                record(dict): with some subset of the fields
                    "properties": { 
                        "type":         { "type": "keyword" },
                        "tags":         { "type": "keyword" }, 
                        "mimetypes":    { "type": "keyword" }, 
                        "freetext":     { "type": "text" }
                    }
            
            Returns:
                None
        """
        return

#  do nothing yet
        mimetypes = list()
        freetext = str()

        # extract mimetypes and freetext
        for mime_type, dataobj in record.data.items():
          mimetypes.append(mime_type)
          if mime_type in INDEXABLE_MIME_TYPES:
            # flatten freetext into uni-str
            freetext = freetext + dataobj + "\n"

#        dwriter.add_document( key=record.key, \
#                      commit=commit, \
#                      linked_commit=linked_commit, \
#                      record_type=record.type.name, \
#                      tags=record.tags, \
#                      mimetypes=mimetypes, \
#                      freetext=freetext, \
#                      timestamp=timestamp)

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
    
