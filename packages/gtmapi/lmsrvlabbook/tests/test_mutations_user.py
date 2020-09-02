import os
import pytest

from lmsrvlabbook.tests.fixtures import fixture_working_dir
from gtmcore.configuration import Configuration

from graphene.test import Client
import graphene
from mock import patch


class TestUserIdentityMutations(object):
    def test_remove_user_identity(self, fixture_working_dir):
        config_instance, _, client, _ = fixture_working_dir
        query = """
                {
                    userIdentity{
                                  id
                                  username
                                  email
                                  givenName
                                  familyName
                                }
                }
                """

        correct_response = {'data': {
            'userIdentity': {
                'email': 'jane@doe.com',
                'familyName': 'Doe',
                'givenName': 'Jane',
                'id': 'VXNlcklkZW50aXR5OmRlZmF1bHQ=',
                'username': 'default'
            }
        }}

        r = client.execute(query)
        assert r == correct_response

        identity_file = os.path.join(config_instance.app_workdir, '.labmanager', 'identity', 'cached_id_jwt')
        assert os.path.exists(identity_file) is True

        query = """
                mutation myRemoveMutation {
                    removeUserIdentity(input:{}){
                    userIdentityEdge{
                      username
                    }
                  } 
                }
                """

        r = fixture_working_dir[2].execute(query)
        assert 'errors' in r
        assert r['data']['removeUserIdentity']['userIdentityEdge']['username'] is None

        assert os.path.exists(identity_file) is False
