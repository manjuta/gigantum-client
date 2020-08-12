import pytest
import os
from snapshottest import snapshot
from lmsrvlabbook.tests.fixtures import fixture_working_dir

import graphene
from flask import current_app
import flask


class TestUserIdentityQueries(object):

    def test_logged_in_user(self, fixture_working_dir, snapshot):
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

        snapshot.assert_match(fixture_working_dir[2].execute(query))

    def test_logged_in_user_invalid_token(self, fixture_working_dir, snapshot):
        query = """
                {
                    userIdentity{
                                  isSessionValid
                                }
                }
                """

        snapshot.assert_match(fixture_working_dir[2].execute(query))

    def test_no_logged_in_user(self, fixture_working_dir, snapshot):
        query = """
                {
                    userIdentity{
                                  id
                                  username
                                  email
                                  givenName
                                  familyName
                                  isSessionValid
                                }
                }
                """

        # Delete the stored user context
        flask.g.user_obj = None
        flask.g.access_token = None
        flask.g.id_token = None
        user_dir = os.path.join(fixture_working_dir[1], '.labmanager', 'identity')
        os.remove(os.path.join(user_dir, 'cached_id_jwt'))

        # Run query
        snapshot.assert_match(fixture_working_dir[2].execute(query))

    def test_invalid_token(self, fixture_working_dir, snapshot):
        query = """
                {
                    userIdentity{
                                  id
                                  username
                                  email
                                  givenName
                                  familyName
                                  isSessionValid
                                }
                }
                """

        # Delete the stored user context
        flask.g.user_obj = None
        flask.g.access_token = "adsfasdfasdfasdfasdf"
        flask.g.id_token = "gfdhfghjghfjhgfghj"
        user_dir = os.path.join(fixture_working_dir[1], '.labmanager', 'identity')
        os.remove(os.path.join(user_dir, 'cached_id_jwt'))

        # Run query
        snapshot.assert_match(fixture_working_dir[2].execute(query))
