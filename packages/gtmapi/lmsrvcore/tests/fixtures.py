import pytest
import tempfile
import os
import uuid
import shutil
from flask import Flask
from mock import patch
from pkg_resources import resource_filename

from gtmcore.configuration.configuration import Configuration, deep_update
from gtmcore.auth.identity import get_identity_manager
from gtmcore.fixtures.fixtures import _create_temp_work_dir


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
    app.config["LABMGR_ID_MGR"] = get_identity_manager(config)

    with app.app_context():
        # within this block, current_app points to app.
        yield config_instance, temp_dir  # name of the config file, working directory (for the current server)

    # Remove the temp_dir
    shutil.rmtree(temp_dir)
