import pytest
import tempfile
import os
import uuid
import shutil
from flask import Flask
from mock import patch
from pkg_resources import resource_filename

from gtmcore.configuration import Configuration
from gtmcore.auth.identity import get_identity_manager


def _create_temp_work_dir():
    """Helper method to create a temporary working directory and associated config file"""
    # Create a temporary working directory
    temp_dir = os.path.join(tempfile.gettempdir(), uuid.uuid4().hex)
    os.makedirs(temp_dir)

    config = Configuration()
    config.config["git"]["working_directory"] = temp_dir
    config.config["auth"]["audience"] = "io.gigantum.api.dev"
    config.config["auth"]["client_id"] = "Z6Wl854wqCjNY0D4uJx8SyPyySyfKmAy"
    config_file = os.path.join(temp_dir, "temp_config.yaml")
    config.save(config_file)

    return config_file, temp_dir


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
    config_file, temp_dir = _create_temp_work_dir()
    insert_cached_identity(temp_dir)

    with patch.object(Configuration, 'find_default_config', lambda self: config_file):
        app = Flask("lmsrvlabbook")

        # Load configuration class into the flask application
        app.config["LABMGR_CONFIG"] = config = Configuration()
        app.config["LABMGR_ID_MGR"] = get_identity_manager(config)

        with app.app_context():
            # within this block, current_app points to app.
            yield config_file, temp_dir  # name of the config file, temporary working directory

    # Remove the temp_dir
    shutil.rmtree(temp_dir)
