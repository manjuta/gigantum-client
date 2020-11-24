import pytest
import graphene
from graphene.test import Client
from werkzeug.datastructures import EnvironHeaders
import os
import shutil
from flask import Flask
from pkg_resources import resource_filename
from unittest.mock import patch

from gtmcore.configuration.configuration import Configuration
from gtmcore.auth.identity import get_identity_manager_class
from gtmcore.fixtures.fixtures import _create_temp_work_dir
from gtmcore.auth.local import LocalIdentityManager

from lmsrvcore.middleware import AuthorizationMiddleware
from lmsrvlabbook.api.query import LabbookQuery
from lmsrvlabbook.api.mutation import LabbookMutations


class ContextMock(object):
    """A simple class to mock the Flask request context so you have a labbook_loader attribute"""
    def __init__(self):
        self.headers = EnvironHeaders({'HTTP_AUTHORIZATION': "Bearer afaketoken",
                        'HTTP_IDENTITY': "afakeidtoken",
                        'HTTP_GTM-SERVER-ID': "my-server"})


def insert_cached_identity(working_dir):
    source = os.path.join(resource_filename('lmsrvcore', 'tests'), 'id_token')
    user_dir = os.path.join(working_dir, '.labmanager', 'identity')
    os.makedirs(user_dir)
    destination = os.path.join(user_dir, 'cached_id_jwt')
    shutil.copyfile(source, destination)
    

@pytest.fixture
def fixture_working_dir_with_cached_user():
    """A pytest fixture that creates a temporary working directory, config file, schema, and local user identity
    """
    # Create temp dir
    config_instance, temp_dir = _create_temp_work_dir()
    insert_cached_identity(config_instance.app_workdir)

    app = Flask("lmsrvlabbook")

    # Load configuration class into the flask application
    app.config["LABMGR_CONFIG"] = config = Configuration()
    app.config["ID_MGR_CLS"] = get_identity_manager_class(config)

    with app.app_context():
        # within this block, current_app points to app.
        yield config_instance, temp_dir  # name of the config file, working directory (for the current server)

    # Remove the temp_dir
    shutil.rmtree(config_instance.app_workdir)


@pytest.fixture
def fixture_working_dir_with_auth_middleware():
    """A pytest fixture for testing the auth middleware
    """
    def fake_is_authenticated(access_token=None, id_token=None):
        if access_token == "good_fake_token" and id_token == "good_fake_id_token":
            return True
        else:
            return False

    # Create temp dir
    config_instance, temp_dir = _create_temp_work_dir()

    # Create test client
    schema = graphene.Schema(query=LabbookQuery, mutation=LabbookMutations)

    with patch.object(LocalIdentityManager, 'is_authenticated') as mock_method:
        mock_method.side_effect = fake_is_authenticated
        # Load User identity into app context
        app = Flask("lmsrvlabbook")
        app.config["LABMGR_CONFIG"] = config = Configuration()
        app.config["ID_MGR_CLS"] = get_identity_manager_class(config)

        with app.app_context():
            # Create a test client
            client = Client(schema, middleware=[AuthorizationMiddleware()])

            # name of the config file, temporary working directory (for the current server), the schema
            yield config_instance, temp_dir, client

        # Make sure `is_authenticated` is only called once
        assert mock_method.call_count == 1

        # Remove the temp_dir
        config_instance.clear_cached_configuration()
        shutil.rmtree(config_instance.app_workdir)
