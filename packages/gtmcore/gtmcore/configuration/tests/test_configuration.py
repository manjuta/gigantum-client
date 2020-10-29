import pytest
import os
import tempfile
from unittest.mock import PropertyMock, patch
from pathlib import Path

import responses
from gtmcore.configuration import (Configuration)
from gtmcore.fixtures import mock_config_file


@pytest.fixture(scope="module")
def mock_config_file_no_delete():
    with tempfile.NamedTemporaryFile(mode="wt", delete=False) as fp:
        # Write a temporary config file
        fp.write("""core:
  team_mode: true 
git:
  working_directory: '~/gigantum'""")
        fp.close()

        yield fp.name  # provide the fixture value

    del fp.name


@pytest.fixture()
def mock_user_defined_config_file():
    config = Configuration()
    filename = os.path.join(config.app_workdir, '.labmanager', 'config.yaml')
    with open(filename, 'wt') as fp:
        # Write a temporary config file
        fp.write("""core:
  team_mode: true 
  added_thing: 1
git:
  working_directory: '~/gigantum'""")
        fp.close()

        yield filename

    os.remove(filename)


@pytest.fixture()
def reset_server_configuration_fixture():
    """A fixture to reset the server configuration for testing"""
    config_instance = Configuration()
    Path(config_instance.server_config_dir, 'test-gigantum-com.json').unlink()
    Path(config_instance.server_config_dir, 'CURRENT').unlink()
    config_instance._get_redis_client().delete(config_instance.SERVER_CONFIG_CACHE_KEY,
                                               config_instance.AUTH_CONFIG_CACHE_KEY)
    Path(config_instance.server_data_dir, 'test-gigantum-com').rmdir()


class TestConfiguration(object):
    def test_load_from_cache(self, mock_config_file):
        """Test loading a config from cache"""
        config_instance, working_dir = mock_config_file
        configuration = Configuration()

        assert configuration.config['core']['import_demo_on_first_login'] is False
        assert configuration.config['environment']['repo_url'] == \
               ["https://github.com/gigantum/base-images-testing.git"]
        assert configuration.config['git']['working_directory'] == configuration.app_workdir

    def test_init_load_from_install(self, mock_config_file, mock_config_file_no_delete):
        """Test loading the default file from the installed location"""
        config_instance, working_dir = mock_config_file
        config_instance.clear_cached_configuration()

        with patch('gtmcore.configuration.Configuration.INSTALLED_LOCATION', new_callable=PropertyMock,
                   return_value=mock_config_file_no_delete):
            # Load a config instance with no config in the cache and the "installed location" set to
            # the simple mocked config file
            configuration = Configuration()

            assert 'core' in configuration.config
            assert 'team_mode' in configuration.config["core"]
            assert configuration.config["core"]["team_mode"] is True
            assert 'git' in configuration.config
            assert configuration.config['git']['working_directory'] == '~/gigantum'

    def test_load_with_user_defined_overrides(self, mock_config_file, mock_user_defined_config_file):
        """Test loading the the user defined overrides"""
        config_instance, working_dir = mock_config_file
        app_workdir = config_instance.app_workdir
        config_instance.clear_cached_configuration()

        with tempfile.NamedTemporaryFile(mode="wt", delete=False) as fp:
            # Write a temporary config file
            fp.write(f"""core:
  team_mode: true 
git:
  working_directory: '{app_workdir}'""")
            fp.close()

            mock_config_in_temp_dir = fp.name

        with patch('gtmcore.configuration.Configuration.INSTALLED_LOCATION', new_callable=PropertyMock,
                   return_value=mock_config_in_temp_dir):
            # Load a config instance with no config in the cache and the "user location" set to
            # the simple mocked config file
            configuration = Configuration()

        assert 'core' in configuration.config
        assert 'team_mode' in configuration.config["core"]
        assert configuration.config["core"]["team_mode"] is True
        assert configuration.config["core"]["added_thing"] == 1
        assert 'git' in configuration.config
        assert configuration.config['git']['working_directory'] == '~/gigantum'

    def test_get_upload_directory(self, mock_config_file):
        """Test get upload directory"""
        configuration = Configuration()
        assert configuration.upload_dir == os.path.join(configuration.app_workdir, '.labmanager', 'upload')

    def test_download_cpu_limit(self, mock_config_file):
        configuration = Configuration()
        assert configuration.download_cpu_limit > 0

    def test_upload_cpu_limit(self, mock_config_file):
        configuration = Configuration()
        assert configuration.upload_cpu_limit > 0

    def test_is_hub_client(self, mock_config_file):
        """Test get_hub_api_url"""
        configuration = Configuration()
        assert configuration.is_hub_client is False

    def test_get_server_configuration_not_configured(self, mock_config_file, reset_server_configuration_fixture):
        """Test get_server_configuration"""
        configuration = Configuration()
        with pytest.raises(FileNotFoundError):
            configuration.get_server_configuration()

    def test_server_config_dir(self, mock_config_file):
        """Test server_config_dir property"""
        config_instance, working_dir = mock_config_file
        assert config_instance.server_config_dir == os.path.join(config_instance.app_workdir, '.labmanager', 'servers')

    def test_get_server_config_file(self, mock_config_file):
        """Test test_get_server_config_file method"""
        config_instance, working_dir = mock_config_file
        assert config_instance.get_server_config_file('test-id') == \
               os.path.join(config_instance.app_workdir, '.labmanager', 'servers', 'test-id.json')

    @responses.activate
    def test_add_server(self, mock_config_file, reset_server_configuration_fixture):
        """Test adding a new server"""
        responses.add(responses.GET, 'https://test.gigantum.com/.well-known/discover.json',
                      json={"id": 'test-gigantum-com',
                            "name": "Gigantum Hub Test",
                            "base_url": "https://test.gigantum.com/",
                            "git_url": "https://test.repo.gigantum.com/",
                            "git_server_type": "gitlab",
                            "hub_api_url": "https://test.gigantum.com/api/v1/",
                            "object_service_url": "https://test.api.gigantum.com/object-v1/",
                            "user_search_url": "https://user-search.us-east-1.cloudsearch.amazonaws.com",
                            "lfs_enabled": True,
                            "auth_config_url": "https://test.gigantum.com/.well-known/auth.json"},
                      status=200)

        responses.add(responses.GET, 'https://test.gigantum.com/.well-known/auth.json',
                      json={"audience": "api.test.gigantum.com",
                            "issuer": "https://test-auth.gigantum.com",
                            "signing_algorithm": "RS256",
                            "public_key_url": "https://test-auth.gigantum.com/.well-known/jwks.json",
                            "login_url": "https://test.gigantum.com/client/login",
                            "logout_url": "https://test.gigantum.com/client/logout",
                            "token_url": "https://test.gigantum.com/gigantum/auth/token",
                            "client_id": "Z6Wl854wqCjNY0D4uJx8SyPyySyfKmAy",
                            "login_type": "auth0"},
                      status=200)

        config_instance, working_dir = mock_config_file
        server_id = config_instance.add_server("https://test.gigantum.com")
        assert server_id == 'test-gigantum-com'

        # Make sure configuration is persisted
        assert os.path.isfile(os.path.join(config_instance.server_config_dir, 'test-gigantum-com.json')) is True

    @responses.activate
    def test_add_server_trailing_slash_and_select(self, mock_config_file, reset_server_configuration_fixture):
        """Test adding a server with a trailing slash in the provided URL"""
        responses.add(responses.GET, 'https://test.gigantum.com/.well-known/discover.json',
                      json={"id": 'test-gigantum-com',
                            "name": "Gigantum Hub Test",
                            "base_url": "https://test.gigantum.com/",
                            "git_url": "https://test.repo.gigantum.com/",
                            "git_server_type": "gitlab",
                            "hub_api_url": "https://test.gigantum.com/api/v1/",
                            "object_service_url": "https://test.api.gigantum.com/object-v1/",
                            "user_search_url": "https://user-search.us-east-1.cloudsearch.amazonaws.com",
                            "lfs_enabled": True,
                            "auth_config_url": "https://test.gigantum.com/.well-known/auth.json"},
                      status=200)

        responses.add(responses.GET, 'https://test.gigantum.com/.well-known/auth.json',
                      json={"audience": "api.test.gigantum.com",
                            "issuer": "https://test-auth.gigantum.com",
                            "signing_algorithm": "RS256",
                            "public_key_url": "https://test-auth.gigantum.com/.well-known/jwks.json",
                            "login_url": "https://test.gigantum.com/client/login",
                            "logout_url": "https://test.gigantum.com/client/logout",
                            "token_url": "https://test.gigantum.com/gigantum/auth/token",
                            "client_id": "Z6Wl854wqCjNY0D4uJx8SyPyySyfKmAy",
                            "login_type": "auth0"},
                      status=200)

        config_instance, working_dir = mock_config_file
        redis_client = config_instance._get_redis_client()
        assert redis_client.exists(config_instance.SERVER_CONFIG_CACHE_KEY) == 0
        assert redis_client.exists(config_instance.AUTH_CONFIG_CACHE_KEY) == 0

        server_id = config_instance.add_server("https://test.gigantum.com/")
        assert server_id == 'test-gigantum-com'

        # Make sure configuration is persisted
        assert os.path.isfile(os.path.join(config_instance.server_config_dir, 'test-gigantum-com.json')) is True

        # Make sure you can select the server
        config_instance.set_current_server(server_id)
        assert os.path.isfile(os.path.join(config_instance.server_config_dir, 'CURRENT')) is True
        with open(os.path.join(config_instance.server_config_dir, 'CURRENT'), 'rt') as f:
            assert f.read().strip() == server_id

        # Make sure the config is loaded in the cache
        assert redis_client.exists(config_instance.SERVER_CONFIG_CACHE_KEY) == 1
        assert redis_client.exists(config_instance.AUTH_CONFIG_CACHE_KEY) == 1

    def test_set_current_server_not_configured(self, mock_config_file):
        """Test trying to set the current server to a server that isn't configured"""
        config_instance, working_dir = mock_config_file

        with pytest.raises(ValueError):
            config_instance.set_current_server('not-a-server')

    def test_get_server_configuration_from_cache(self, mock_config_file):
        """Test trying to get_server_configuration"""
        config_instance, working_dir = mock_config_file

        server_config = config_instance.get_server_configuration()
        assert server_config.id == 'test-gigantum-com'
        assert server_config.name == "Gigantum Hub Test"
        assert server_config.base_url == "https://test.gigantum.com/"
        assert server_config.git_url == "https://test.repo.gigantum.com/"
        assert server_config.git_server_type == "gitlab"
        assert server_config.hub_api_url == "https://test.gigantum.com/api/v1/"
        assert server_config.object_service_url == "https://test.api.gigantum.com/object-v1/"
        assert server_config.user_search_url == "https://user-search.us-east-1.cloudsearch.amazonaws.com"
        assert server_config.lfs_enabled is True

    def test_get_server_configuration_from_file(self, mock_config_file):
        """Test trying to get_server_configuration from a file"""
        config_instance, working_dir = mock_config_file
        config_instance.clear_cached_configuration()

        server_config = config_instance.get_server_configuration()
        assert server_config.id == 'test-gigantum-com'
        assert server_config.name == "Gigantum Hub Test"
        assert server_config.base_url == "https://test.gigantum.com/"
        assert server_config.git_url == "https://test.repo.gigantum.com/"
        assert server_config.git_server_type == "gitlab"
        assert server_config.hub_api_url == "https://test.gigantum.com/api/v1/"
        assert server_config.object_service_url == "https://test.api.gigantum.com/object-v1/"
        assert server_config.user_search_url == "https://user-search.us-east-1.cloudsearch.amazonaws.com"
        assert server_config.lfs_enabled is True

    def test_get_auth_configuration_from_cache(self, mock_config_file):
        """Test trying to get_auth_configuration"""
        config_instance, working_dir = mock_config_file

        auth_config = config_instance.get_auth_configuration()
        assert auth_config.audience == "api.test.gigantum.com"
        assert auth_config.issuer == "https://auth.gigantum.com/"
        assert auth_config.signing_algorithm == "RS256"
        assert auth_config.public_key_url == "https://auth.gigantum.com/.well-known/jwks.json"
        assert auth_config.login_url == "https://test.gigantum.com/auth/redirect?target=login"
        assert auth_config.logout_url == "https://test.gigantum.com/auth/redirect?target=logout"
        assert auth_config.token_url == "https://test.gigantum.com/auth/token"
        assert auth_config.client_id == "Z6Wl854wqCjNY0D4uJx8SyPyySyfKmAy"
        assert auth_config.login_type == "auth0"

    def test_get_auth_configuration_from_file(self, mock_config_file):
        """Test trying to get_auth_configuration"""
        config_instance, working_dir = mock_config_file
        config_instance.clear_cached_configuration()

        auth_config = config_instance.get_auth_configuration()
        assert auth_config.audience == "api.test.gigantum.com"
        assert auth_config.issuer == "https://auth.gigantum.com/"
        assert auth_config.signing_algorithm == "RS256"
        assert auth_config.public_key_url == "https://auth.gigantum.com/.well-known/jwks.json"
        assert auth_config.login_url == "https://test.gigantum.com/auth/redirect?target=login"
        assert auth_config.logout_url == "https://test.gigantum.com/auth/redirect?target=logout"
        assert auth_config.token_url == "https://test.gigantum.com/auth/token"
        assert auth_config.login_type == "auth0"

    @responses.activate
    def test_list_available_servers(self, mock_config_file):
        """Test listing available configured servers"""
        responses.add(responses.GET, 'https://test2.gigantum.com/.well-known/discover.json',
                      json={"id": 'another-server',
                            "name": "Another server",
                            "base_url": "https://test2.gigantum.com/",
                            "git_url": "https://test2.repo.gigantum.com/",
                            "git_server_type": "gitlab",
                            "hub_api_url": "https://test2.gigantum.com/api/v1/",
                            "object_service_url": "https://test2.api.gigantum.com/object-v1/",
                            "user_search_url": "https://user-search2.us-east-1.cloudsearch.amazonaws.com",
                            "lfs_enabled": True,
                            "auth_config_url": "https://test2.gigantum.com/.well-known/auth.json"},
                      status=200)

        responses.add(responses.GET, 'https://test2.gigantum.com/.well-known/auth.json',
                      json={"audience": "api.test.gigantum.com",
                            "issuer": "https://test2-auth.gigantum.com",
                            "signing_algorithm": "RS256",
                            "public_key_url": "https://test2-auth.gigantum.com/.well-known/jwks.json",
                            "login_url": "https://test2.gigantum.com/auth/login",
                            "token_url": "https://test2.gigantum.com/auth/token",
                            "logout_url": "https://test2.gigantum.com/auth/logout",
                            "client_id": "Z6Wl854wqCjNY0D4uJx8SyPyySyfKmAy",
                            "login_type": "auth0"},
                      status=200)

        config_instance, working_dir = mock_config_file

        servers = config_instance.list_available_servers()
        assert len(servers) == 1
        assert servers[0].id == 'test-gigantum-com'
        assert servers[0].name == "Gigantum Hub Test"
        assert servers[0].login_url == "https://test.gigantum.com/auth/redirect?target=login"
        assert servers[0].token_url == "https://test.gigantum.com/auth/token"
        assert servers[0].logout_url == "https://test.gigantum.com/auth/redirect?target=logout"

        config_instance.add_server('https://test2.gigantum.com/')

        servers = config_instance.list_available_servers()
        assert len(servers) == 2
        for s in servers:
            assert s[0] in ['test-gigantum-com', 'another-server']
            assert s[1] in ["Gigantum Hub Test", "Another server"]
