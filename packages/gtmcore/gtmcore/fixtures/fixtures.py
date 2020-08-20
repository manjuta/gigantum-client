from typing import Tuple, Dict, Iterator

import json
import os
import shutil
import redis
import tempfile
import requests
import responses
import git
from pkg_resources import resource_filename
import pytest
import uuid

from gtmcore.configuration.configuration import Configuration, deep_update
from gtmcore.environment import RepositoryManager
from gtmcore.inventory.inventory  import InventoryManager
from gtmcore.activity.detaildb import ActivityDetailDB
from gtmcore.activity import ActivityStore
from gtmcore.gitlib.git import GitAuthor
from gtmcore.files import FileOperations
from gtmcore.inventory.branching import BranchManager


ENV_UNIT_TEST_REPO = 'gigantum_base-images-testing'
ENV_UNIT_TEST_BASE = 'quickstart-jupyterlab'
ENV_UNIT_TEST_REV = 2


def flush_redis_repo_cache():
    r = redis.Redis(db=7)
    r.flushdb()


def _create_temp_work_dir(override_dict: dict = None, lfs_enabled: bool = True):
    """Helper method to create a temporary working directory and associated config file"""

    # Create a temporary working directory
    unit_test_working_dir = os.path.join(tempfile.gettempdir(), uuid.uuid4().hex)
    os.makedirs(unit_test_working_dir)
    os.makedirs(os.path.join(unit_test_working_dir, '.labmanager', 'upload'), exist_ok=True)
    os.makedirs(os.path.join(unit_test_working_dir, '.labmanager', 'servers'), exist_ok=True)

    default_override_config = {
        'core': {
            'import_demo_on_first_login': False
        },
        'environment': {
            'repo_url': ["https://github.com/gigantum/base-images-testing.git"]
        },
        'flask': {
            'DEBUG': False
        },
        'git': {
            'working_directory': unit_test_working_dir,
            'backend': 'filesystem-shim'
        },
        'lock': {
            'redis': {
                'strict': False,
            }
        }
    }

    # Set HOST_WORK_DIR to the test working dir for project launching
    os.environ['HOST_WORK_DIR'] = unit_test_working_dir

    # Write server config files to mock an already configured client
    with open(os.path.join(unit_test_working_dir, '.labmanager', 'servers', 'test-gigantum-com.json'), 'wt') as f:
        data = {
            "server": {
                "id": "test-gigantum-com",
                "name": "Gigantum Hub Test",
                "base_url": "https://test.gigantum.com/",
                "git_url": "https://test.repo.gigantum.com/",
                "git_server_type": "gitlab",
                "hub_api_url": "https://test.gigantum.com/api/v1/",
                "object_service_url": "https://test.api.gigantum.com/object-v1/",
                "user_search_url": "https://user-search.us-east-1.cloudsearch.amazonaws.com",
                "lfs_enabled": lfs_enabled
            },
            "auth": {
                "login_type": "auth0",
                "login_url": "https://test.gigantum.com/client/login",
                "audience": "io.gigantum.api.dev",
                "issuer": "https://auth.gigantum.com",
                "signing_algorithm": "RS256",
                "public_key_url": "https://auth.gigantum.com/.well-known/jwks.json",
                "auth0_client_id": "Z6Wl854wqCjNY0D4uJx8SyPyySyfKmAy"
            }
        }
        json.dump(data, f)

    with open(os.path.join(unit_test_working_dir, '.labmanager', 'servers', 'CURRENT'), 'wt') as f:
        f.write("test-gigantum-com")

    config = Configuration(wait_for_cache=10)
    deep_update(config.config, default_override_config)
    if override_dict:
        deep_update(config.config, override_dict)

    # Update the cached configuration with the modified configuration
    config.clear_cached_configuration()
    config.save_to_cache(config.config)

    # Return (Configuration instance, ephemeral-working-directory).
    inventory_dir = os.path.join(unit_test_working_dir, 'test-gigantum-com')
    os.makedirs(inventory_dir)
    return config, inventory_dir


def helper_create_remote_repo(repository, username: str, visibility, access_token = None, id_token = None) -> None:
    """ Used to mock out creating a Labbook remote Gitlab repo. This is not a fixture per se,

    Usage:

    ```
        @mock.patch('gtmcore.labbook.LabBook._create_remote_repo', new=_MOCK_create_remote_repo)
        def my_test_(...):
            ...
    ```
    """
    rand = str(uuid.uuid4())[:6]
    working_dir = os.path.join(tempfile.gettempdir(), rand, 'testuser', repository.name)
    os.makedirs(working_dir, exist_ok=True)
    r = git.Repo.init(path=working_dir, bare=True)
    assert r.bare is True
    # The repository URL should end with a '/' because that's how GitLab prefers it
    repository.add_remote(remote_name="origin", url=working_dir + '/')

    # Push branches
    # TODO: @billvb - need to refactor this once new branch model is in effect.
    original_branch = repository.git.repo.head.ref.name
    repository.git.repo.heads['master'].checkout()
    repository.git.repo.git.push("origin", "master")

    # Set the head to master on the remote
    r.git.symbolic_ref('HEAD', 'refs/heads/master')

    # Check back out the original user branch
    repository.git.repo.heads[original_branch].checkout()


@pytest.fixture()
def sample_src_file():
    with tempfile.NamedTemporaryFile(mode="w", delete=False) as sample_f:
        # Fill sample file with some deterministic crap
        sample_f.write("n4%nm4%M435A EF87kn*C" * 40)
        sample_f.seek(0)
    yield sample_f.name
    try:
        os.remove(sample_f.name)
    except:
        pass


@pytest.fixture()
def mock_config_file() -> Iterator[Tuple[Configuration, str]]:
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    config_instance, working_dir = _create_temp_work_dir()

    yield config_instance, working_dir
    config_instance.clear_cached_configuration()
    working_dir, _ = working_dir.rsplit('/', 1)
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_config_file_background_tests() -> Iterator[Tuple[Configuration, str]]:
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test

    For use primarily with background job tests
    """
    overrides = {"datasets": {
        "cache_manager": "host",
        "hash_cpu_limit": 2,
        "download_cpu_limit": 2,
        "upload_cpu_limit": 2,
        "backends": {
            "gigantum_object_v1": {
                "upload_chunk_size": 4096,
                "download_chunk_size": 4194304,
                "num_workers": 10
                }
            }
        }}
    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)
    yield config_instance, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture(scope="class")
def mock_config_with_repo() -> Iterator[Tuple[Configuration, str]]:
    """A pytest fixture that creates a temporary directory and a config file to match. Also populates env repos
    """
    config_instance, working_dir = _create_temp_work_dir()
    erm = RepositoryManager()
    erm.update_repositories()
    erm.index_repositories()

    yield config_instance, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_config_file_for_lock() -> Iterator[Tuple[Configuration, str]]:
    """A pytest fixture that creates a temporary directory and a config file for testing locking"""
    overrides = {
        "lock": {
            "timeout": 5
        }
    }
    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)

    yield config_instance, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)

# TODO: FIX WHEN FIXING AUTH
@pytest.fixture(scope="module")
def mock_config_file_with_auth() -> Iterator[Tuple[Configuration, Dict, str]]:
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    # Load auth config for testing
    test_auth_file = os.path.join(resource_filename('gtmcore',
                                                    'auth{}tests'.format(os.path.sep)), 'auth_config.json')
    if not os.path.exists(test_auth_file):
        test_auth_file = f"{test_auth_file}.example"

    with open(test_auth_file, 'rt') as conf:
        auth_data = json.load(conf)

    overrides = {
        'auth': {
            'provider_domain': 'gigantum.auth0.com',
            'signing_algorithm': 'RS256',
            'client_id': auth_data['client_id'],
            'audience': auth_data['audience'],
            'identity_manager': 'local'
        }
    }

    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)

    # Go get a JWT for the test user from the dev auth client (real users are not in this DB)
    response = requests.post("https://gigantum.auth0.com/oauth/token", json=auth_data)
    token_data = response.json()

    yield config_instance, token_data, working_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


# TODO: FIX WHEN FIXING AUTH
@pytest.fixture()
def mock_config_file_with_auth_first_login():
    """A pytest fixture that will run the first login workflow"""
    # Load auth config for testing
    test_auth_file = os.path.join(resource_filename('gtmcore',
                                                    'auth{}tests'.format(os.path.sep)), 'auth_config.json')
    if not os.path.exists(test_auth_file):
        test_auth_file = f"{test_auth_file}.example"

    with open(test_auth_file, 'rt') as conf:
        auth_data = json.load(conf)

    overrides = {
        'auth': {
            'provider_domain': 'gigantum.auth0.com',
            'signing_algorithm': 'RS256',
            'client_id': auth_data['client_id'],
            'audience': auth_data['audience'],
            'identity_manager': 'local'
        },
        'core': {
            'import_demo_on_first_login': True
        }
    }

    # Go get a JWT for the test user from the dev auth client (real users are not in this DB)
    response = requests.post("https://gigantum.auth0.com/oauth/token", json=auth_data)
    token_data = response.json()

    conf_file, working_dir = _create_temp_work_dir(override_dict=overrides)
    yield conf_file, working_dir, token_data  # provide the fixture value
    shutil.rmtree(working_dir)


# TODO: MOVE UP INTO FIRST LOGIN FIXTURE
@pytest.fixture()
def cleanup_auto_import():
    """A pytest fixture that cleans up after the auto-import of the demo"""
    demo_dir = os.path.join('/mnt', 'gigantum', "johndoe", "johndoe", "labbooks", "my-first-project")
    if os.path.exists(demo_dir) is True:
        shutil.rmtree(demo_dir)


# TODO: FIX WHEN FIXING AUTH
@pytest.fixture(scope="module")
def mock_config_file_with_auth_browser():
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    # Load auth config for testing
    test_auth_file = os.path.join(resource_filename('gtmcore',
                                                    'auth{}tests'.format(os.path.sep)), 'auth_config.json')
    if not os.path.exists(test_auth_file):
        test_auth_file = f"{test_auth_file}.example"

    with open(test_auth_file, 'rt') as conf:
        auth_data = json.load(conf)

    overrides = {
        'auth': {
            'provider_domain': 'gigantum.auth0.com',
            'signing_algorithm': 'RS256',
            'client_id': auth_data['client_id'],
            'audience': auth_data['audience'],
            'identity_manager': 'browser'
        }
    }

    conf_file, working_dir = _create_temp_work_dir(override_dict=overrides)

    # Go get a JWT for the test user from the dev auth client (real users are not in this DB)
    response = requests.post("https://gigantum.auth0.com/oauth/token", json=auth_data)
    token_data = response.json()

    yield conf_file, working_dir, token_data
    shutil.rmtree(working_dir)

# TODO: FIX WHEN FIXING AUTH
@pytest.fixture(scope="module")
def mock_config_file_with_auth_anon_review():
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    overrides = {
        'auth': {
            'identity_manager': 'anon_review'
        },
        'anon_review_secret': '1234'
    }

    conf_file, working_dir = _create_temp_work_dir(override_dict=overrides)

    yield conf_file
    shutil.rmtree(working_dir)

# TODO: FIX WHEN FIXING AUTH
@pytest.fixture(scope="module")
def mock_config_file_with_auth_anonymous():
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    # Load auth config for testing
    test_auth_file = os.path.join(resource_filename('gtmcore',
                                                    'auth{}tests'.format(os.path.sep)), 'auth_config.json')
    if not os.path.exists(test_auth_file):
        test_auth_file = f"{test_auth_file}.example"

    with open(test_auth_file, 'rt') as conf:
        auth_data = json.load(conf)

    overrides = {
        'auth': {
            'provider_domain': 'gigantum.auth0.com',
            'signing_algorithm': 'RS256',
            'client_id': auth_data['client_id'],
            'audience': auth_data['audience'],
            'identity_manager': 'anonymous'
        }
    }

    conf_file, working_dir = _create_temp_work_dir(override_dict=overrides)

    # Go get a JWT for the test user from the dev auth client (real users are not in this DB)
    response = requests.post("https://gigantum.auth0.com/oauth/token", json=auth_data)
    token_data = response.json()

    yield conf_file, working_dir, token_data
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_config_with_activitystore():
    """A pytest fixture that creates a ActivityStore (and labbook) and deletes directory after test"""
    # Create a temporary working directory
    config_instance, working_dir = _create_temp_work_dir()
    im = InventoryManager()
    lb = im.create_labbook('default', 'default', 'labbook1', description="my first labbook",
                           author=GitAuthor("default", "default@test.com"))
    store = ActivityStore(lb)

    yield store, lb
    config_instance.clear_cached_configuration()
    # Remove the temp_dir
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_config_with_detaildb():
    """A pytest fixture that creates a detail db (and labbook) and deletes directory after test"""
    # Create a temporary working directory
    config_instance, working_dir = _create_temp_work_dir()
    im = InventoryManager()
    lb = im.create_labbook('default', 'default', 'labbook1', description="my first labbook")
    db = ActivityDetailDB(lb.root_dir, lb.checkout_id)

    yield db, lb
    config_instance.clear_cached_configuration()
    # Remove the temp_dir
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_labbook():
    """A pytest fixture that creates a temporary directory and a config file to match.
    Deletes directory after test"""
    config_instance, working_dir = _create_temp_work_dir()
    erm = RepositoryManager()
    erm.update_repositories()
    erm.index_repositories()

    im = InventoryManager()
    # description was "my first labbook1"
    lb = im.create_labbook('test', 'test', 'labbook1', description="my test description")
    yield config_instance, lb.root_dir, lb
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_enabled_iframes():
    """A pytest fixture that creates a temporary directory and a config file to match.
    Deletes directory after test"""
    overrides = {"environment": {
        "repo_url": ["https://github.com/gigantum/base-images.git"],
        "iframe": {
           "enabled": True,
           "allowed_origin": "gigantum.com"
        }
        }}

    config_instance, working_dir = _create_temp_work_dir(override_dict=overrides)
    os.makedirs(os.path.join(working_dir, '.labmanager', 'environment_repositories'), exist_ok=True)
    erm = RepositoryManager()
    erm.update_repositories()
    erm.index_repositories()

    im = InventoryManager()
    # description was "my first labbook1"
    lb = im.create_labbook('test', 'test', 'labbook1', description="my test description")
    yield config_instance, lb.root_dir, lb
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture()
def mock_labbook_lfs_disabled():
    """A pytest fixture that creates a temporary directory and a config file to match. Deletes directory after test"""
    config_instance, working_dir = _create_temp_work_dir(lfs_enabled=False)
    im = InventoryManager()
    lb = im.create_labbook_disabled_lfs('test', 'test', 'labbook1', description="my first labbook")
    assert lb.is_repo_clean
    yield config_instance, lb.root_dir, lb
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)


@pytest.fixture()
def remote_labbook_repo():
    # TODO: Remove after integration tests with LFS support are available
    config_instance, working_dir = _create_temp_work_dir(lfs_enabled=False)
    im = InventoryManager()
    lb = im.create_labbook('test', 'test', 'sample-repo-lb', description="my first labbook")
    bm = BranchManager(lb, username='test')
    bm.create_branch('testing-branch')

    #with tempfile.TemporaryDirectory() as tmpdirname:
    with open(os.path.join('/tmp', 'codefile.c'), 'wb') as codef:
        codef.write(b'// Cody McCodeface ...')

    FileOperations.insert_file(lb, "code", "/tmp/codefile.c")

    assert lb.is_repo_clean
    bm.workon_branch('master')

    # Location of the repo to push/pull from
    yield lb.root_dir
    config_instance.clear_cached_configuration()
    shutil.rmtree(working_dir)
    try:
        os.remove('/tmp/codefile.c')
    except:
        pass

