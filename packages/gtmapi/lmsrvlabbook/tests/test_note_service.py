import pytest
import os
from snapshottest import snapshot
from lmsrvlabbook.tests.fixtures import fixture_working_dir

from graphene.test import Client
import graphene
from mock import patch

from gtmcore.configuration import Configuration

from gtmcore.inventory.inventory import InventoryManager


class TestNoteService(object):
    def test_create_user_note_no_body(self, fixture_working_dir, snapshot):
        """Test creating and getting a user note"""
        # Create labbook
        im = InventoryManager()
        lb = im.create_labbook("default", "default", "user-note-test",
                               description="testing user notes")

        # Create a user note
        query = """
        mutation makeUserNote {
          createUserNote(input: {
            owner: "default",
            labbookName: "user-note-test",
            title: "I think this is a thing"
          })
          {
            newActivityRecordEdge {
              node{
                message
                detailObjects{                
                  data
                  type
                  show
                  importance
                  tags
                }
                type
                show
                importance
                tags
              }
            }
          }
        }
        """
        snapshot.assert_match(fixture_working_dir[2].execute(query))

    def test_create_user_note_full(self, fixture_working_dir, snapshot):
        """Test creating a full user note"""

        # Create labbook
        lb = InventoryManager().create_labbook("default", "default",
                                                                     "user-note-test",
                                                                     description="testing user notes")

        # Create a user note
        query = """
        mutation makeUserNote {
          createUserNote(input: {
            owner: "default",
            labbookName: "user-note-test",
            title: "I think this is a thing",
            body: "##AND THIS IS A BODY\\n- asdggf\\n-asdf",
            tags: ["this", "and", "that"]
          })
          {
            newActivityRecordEdge {
                node{
                  message
                  detailObjects{                
                    data
                    type
                    show
                    importance
                    tags
                  }
                  type
                  show
                  importance
                  tags
              }
            }
          }
        }
        """
        snapshot.assert_match(fixture_working_dir[2].execute(query))

    def test_create_user_note_check_vals(self, fixture_working_dir, snapshot):
        """Test to make sure keys and IDs are getting set OK"""
        # Create labbook
        im = InventoryManager()
        lb = im.create_labbook("default", "default", "user-note-test",
                               description="testing user notes")

        # Create a user note
        query = """
        mutation makeUserNote {
          createUserNote(input: {
            owner: "default",
            labbookName: "user-note-test",
            title: "I think this is a thing",
            body: "##AND THIS IS A BODY\\n- asdggf\\n-asdf",
            tags: ["this", "and", "that"]
          })
          {
            newActivityRecordEdge {
                node{
                  message
                  detailObjects{    
                    id
                    key            
                    data
                    type
                    show
                    importance
                    tags
                  }
                  id
                  commit
                  linkedCommit
                  type
                  show
                  importance
                  tags
              }
              cursor
            }
          }
        }
        """
        result = fixture_working_dir[2].execute(query)

        assert len(result['data']['createUserNote']['newActivityRecordEdge']['node']['id']) > 10
        assert type(result['data']['createUserNote']['newActivityRecordEdge']['node']['id']) == str
        assert len(result['data']['createUserNote']['newActivityRecordEdge']['node']['commit']) == 40
        assert type(result['data']['createUserNote']['newActivityRecordEdge']['node']['commit']) == str
        assert result['data']['createUserNote']['newActivityRecordEdge']['node']['linkedCommit'] == "no-linked-commit"
        assert result['data']['createUserNote']['newActivityRecordEdge']['node']['message'] == "I think this is a thing"

        assert len(result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['id']) > 10
        assert type(result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['id']) == str
        assert len(result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['key']) > 10
        assert type(result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['key']) == str
        assert "AND THIS IS A BODY" in result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['data'][0][1]

    def test_create_user_note_check_vals_dataset(self, fixture_working_dir, snapshot):
        """Test to make sure keys and IDs are getting set OK"""
        # Create labbook
        im = InventoryManager()
        ds = im.create_dataset("default", "default", "user-note-test", storage_type='gigantum_object_v1',
                               description="testing user notes")

        # Create a user note
        query = """
        mutation makeUserNote {
          createUserNote(input: {
            owner: "default",
            datasetName: "user-note-test",
            title: "I think this is a thing",
            body: "##AND THIS IS A BODY\\n- asdggf\\n-asdf",
            tags: ["this", "and", "that"]
          })
          {
            newActivityRecordEdge {
                node{
                  message
                  detailObjects{    
                    id
                    key            
                    data
                    type
                    show
                    importance
                    tags
                  }
                  id
                  commit
                  linkedCommit
                  type
                  show
                  importance
                  tags
              }
              cursor
            }
          }
        }
        """
        result = fixture_working_dir[2].execute(query)

        assert len(result['data']['createUserNote']['newActivityRecordEdge']['node']['id']) > 10
        assert type(result['data']['createUserNote']['newActivityRecordEdge']['node']['id']) == str
        assert len(result['data']['createUserNote']['newActivityRecordEdge']['node']['commit']) == 40
        assert type(result['data']['createUserNote']['newActivityRecordEdge']['node']['commit']) == str
        assert result['data']['createUserNote']['newActivityRecordEdge']['node']['linkedCommit'] == "no-linked-commit"
        assert result['data']['createUserNote']['newActivityRecordEdge']['node']['message'] == "I think this is a thing"

        assert len(result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['id']) > 10
        assert type(result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['id']) == str
        assert len(result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['key']) > 10
        assert type(result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['key']) == str
        assert "AND THIS IS A BODY" in result['data']['createUserNote']['newActivityRecordEdge']['node']['detailObjects'][0]['data'][0][1]





