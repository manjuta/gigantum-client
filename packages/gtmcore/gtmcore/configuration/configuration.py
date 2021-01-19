from typing import (Any, Dict, Optional, Mapping, Union, MutableMapping, List, Tuple, NamedTuple)
import os
import yaml
import json
import time

from pkg_resources import resource_filename
import glob

import redis
import requests
from urllib.parse import urljoin

from gtmcore.configuration.server import ServerConfigData, dict_to_server_config
from gtmcore.configuration.authentication import OAuth2AuthConfiguration, dict_to_auth_config

from gtmcore.logging import LMLogger
logger = LMLogger.get_logger()


ServerInfo = NamedTuple('ServerInfo', [('id', str),
                                       ('name', str),
                                       ('login_url', str),
                                       ('token_url', str),
                                       ('logout_url', str),
                                       ('git_url', str)
                                       ])


def deep_update(destination: MutableMapping[str, Any], source: Mapping[str, Any]) -> None:
    """An updated version of dict.update that will recursively merge sub-dictionaries
    instead of replacing sub-dictionaries.

    Args:
        destination (MutableMapping[str, object]): Dictionary to update
        source (Mapping[str, object]): Dictionary to update from
    """
    for k, v in source.items():
        if type(v) == dict:
            if k in destination:
                deep_update(destination[k], v)
            else:
                destination[k] = v
        else:
            destination[k] = v


class Configuration:
    """Class to interact with Client configuration files
    """
    INSTALLED_LOCATION = "/etc/gigantum/labmanager.yaml"

    # Redis cache settings
    REDIS_DB = 0
    CLIENT_CONFIG_CACHE_KEY = "$CLIENT_CONFIG$"
    SERVER_CONFIG_CACHE_KEY = "$SERVER_CONFIG$"
    AUTH_CONFIG_CACHE_KEY = "$AUTH_CONFIG$"

    def __init__(self, config_file: Optional[str] = None, wait_for_cache: int = 10) -> None:
        """

        Args:
            config_file(str): Absolute path to the configuration file to load
            wait_for_cache: integer indicating the number of seconds to wait for redis to be available
        """
        self.wait_for_cache = wait_for_cache
        self._redis_client: Optional[redis.Redis] = None

        # Check for cached configuration
        self.config = self._load_config(config_file)

    def _get_redis_client(self) -> redis.Redis:
        """Method to get a redis client

        Returns:
            redis.Redis
        """
        if not self._redis_client:
            # Need to get a new client
            retry_cnt = 0
            while True:
                try:
                    self._redis_client = redis.Redis(db=self.REDIS_DB, decode_responses=True)
                    self._redis_client.ping()
                    break
                except redis.exceptions.ConnectionError:
                    # Redis isn't up yet
                    if self.wait_for_cache > 0:
                        if retry_cnt > self.wait_for_cache * 2:
                            logger.error(f"Failed to connect to redis when in Configuration._get_redis_client after"
                                         f" waiting {self.wait_for_cache} seconds.")
                            raise IOError("Application failed to start. Memory cache unavailable. Restart the Client")

                        # Wait and try again
                        time.sleep(.5)
                        retry_cnt += 1
                    else:
                        logger.error("Failed to connect to redis when in Configuration._get_redis_client.")
                        raise IOError("Application failed to start. Memory cache unavailable. Restart the Client")

        return self._redis_client

    def prepare_to_serialize(self) -> None:
        """Method to modify this class so that it is serializable (sometimes it's passed into jobs)

        Returns:
            None
        """
        # Remove the redis client (it will automatically populated when needed on the other side of the serialization)
        self._redis_client = None

    @property
    def app_workdir(self) -> str:
        """Return the Gigantum Client working directory INSIDE the container.

        Note: In a normally built container for actual use (not just testing), this would be `/mnt/gigantum`
        """
        return os.path.expanduser(self.config['git']['working_directory'])

    @property
    def server_config_dir(self) -> str:
        """Method to get the server configuration directory location

        Returns:
            str
        """
        return os.path.join(self.app_workdir, '.labmanager', 'servers')

    @property
    def server_data_dir(self) -> str:
        """Method to get the server data directory location. This is where each server will store user data

        Returns:
            str
        """
        return os.path.join(self.app_workdir, 'servers')

    @property
    def upload_dir(self) -> str:
        """Return the location to write temporary data for uploads. It should be within the workdir so copies
        across filesystems can be avoided.

        """
        return os.path.join(self.app_workdir, '.labmanager', 'upload')

    @property
    def download_cpu_limit(self) -> int:
        """Return the max number of CPUs to use (i.e. concurrent jobs) when downloading dataset files

        Will limit to a maximum of 8 workers if auto returns more than 8. This will avoid most bandwidth issues.
        If a user has a ton of bandwidth, they can adjust this setting manually in the config file to blast.

        Returns:
            int
        """
        config_val = self.config['datasets']['download_cpu_limit']
        if config_val == 'auto':
            num_cpus = os.cpu_count()
            if not num_cpus:
                num_cpus = 1
            if num_cpus > 8:
                num_cpus = 8
            return num_cpus
        else:
            return int(config_val)

    @property
    def is_hub_client(self) -> bool:
        """Return true if configured as a client to run in the hub

        Returns:
            bool
        """
        context = self.config['container']['context']
        if context == "hub":
            return True
        else:
            return False

    @property
    def upload_cpu_limit(self) -> int:
        """Return the max number of CPUs to use (i.e. concurrent jobs) when uploading dataset files

        Will limit to a maximum of 8 workers if auto returns more than 8. This will avoid most bandwidth issues.
        If a user has a ton of bandwidth, they can adjust this setting manually in the config file to blast.

        Returns:
            int
        """
        config_val = self.config['datasets']['upload_cpu_limit']
        if config_val == 'auto':
            num_cpus = os.cpu_count()
            if not num_cpus:
                num_cpus = 1
            if num_cpus > 8:
                num_cpus = 8
            return num_cpus
        else:
            return int(config_val)

    def get_user_storage_dir(self, server_config: Optional[ServerConfigData] = None) -> str:
        """Return the storage location for user data (i.e. Projects and Datasets), that is based on the activated server

        Args:
            server_config: optionally provided server configuration data that will be used instead of looked up

        Returns:
            absolute path to dir
        """
        if not server_config:
            server_config = self.get_server_configuration()

        return os.path.join(self.server_data_dir, server_config.id)

    def _load_config(self, config_file: Optional[str] = None) -> Dict:
        """Load the configuration via file or cache"""
        data = self.load_from_cache()

        # If not cached, load from file and process possible user overrides
        if not data:
            if not config_file:
                # File not specified, so find a default file
                config_file = self.find_default_config()

            data = self.load_from_file(config_file)

            # Set the configuration in the cache
            self.save_to_cache(data)

        return data

    @staticmethod
    def find_default_config() -> str:
        """Method to find the default client configuration file

        Returns:
            (str): Absolute path to the file to load
        """
        # Check if file exists in the installed location
        if os.path.isfile(Configuration.INSTALLED_LOCATION):
            return Configuration.INSTALLED_LOCATION
        else:
            # Load default file out of python package
            return os.path.join(resource_filename("gtmcore", "configuration/config"), "labmanager.yaml.default")

    @staticmethod
    def _read_config_file(config_file: str) -> Dict[str, Any]:
        """Method to read a config file into a dictionary

        Args:
            config_file(str): Absolute path to a configuration file

        Returns:
            (dict)
        """
        with open(config_file, "rt") as cf:
            # If the config file is empty or only comments, we create an empty dict to allow `deep_update()` to work
            data = yaml.safe_load(cf) or {}

        return data

    def load_from_file(self, config_file) -> Dict[str, Any]:
        """Method to load the config file and user-defined overrides from disk

        Args:
            config_file(str): Absolute path to a configuration file

        Returns:
            (dict)
        """
        logger.info(f"Loading configuration data from file: {config_file}")
        data = self._read_config_file(config_file)

        # If a user-defined override file is present, merge its contents with the loaded configuration file
        user_defined_location = os.path.join(data['git']['working_directory'], '.labmanager', 'config.yaml')
        if os.path.exists(user_defined_location):
            logger.info(f"Loading user-defined configuration data from: {user_defined_location}")
            user_conf_data = self._read_config_file(user_defined_location)
            deep_update(data, user_conf_data)

        return data

    def load_from_cache(self) -> Optional[Dict[str, Any]]:
        """Method to load the current configuration data from the cache

        Returns:
            None
        """
        client = self._get_redis_client()
        config_bytes = client.get(self.CLIENT_CONFIG_CACHE_KEY)

        config_data = None
        if config_bytes:
            config_data = json.loads(config_bytes)

        return config_data

    def save_to_cache(self, data: dict) -> None:
        """Method to save the current configuration data to the cache. If a configuration is already set, this will
        essentially be a noop. You must call `clear_cached_configuration()` if you want to re-set the cached config

        Returns:
            None
        """
        # Save the configuration, only if it doesn't already exist, to deal with possibility of multiple start up
        # processes all loading the configuration for the first time.
        did_set = self._get_redis_client().setnx(self.CLIENT_CONFIG_CACHE_KEY, json.dumps(data))

        if did_set:
            logger.info("Saved Client configuration to cache.")
        else:
            logger.info("Skipping saving Client configuration to cache due to configuration that is already set.")

    def clear_cached_configuration(self) -> None:
        """Method to remove the all configurations from the cache

        Returns:
            None
        """
        logger.info("Clearing all configuration data from cache.")
        self._get_redis_client().delete(self.CLIENT_CONFIG_CACHE_KEY,
                                        self.AUTH_CONFIG_CACHE_KEY,
                                        self.SERVER_CONFIG_CACHE_KEY)

    def get_server_config_file(self, server_id: str) -> str:
        """Helper to get the path to a server config file based on the server id

        Args:
            server_id: server id ('id' field in the discovery service response)

        Returns:
            absolute path to the config file for the server
        """
        return os.path.join(self.server_config_dir, f"{server_id}.json")

    def list_available_servers(self) -> List[ServerInfo]:
        """Method to list the servers currently configured in this client in id, name pairs

        Tuple Contents: server ID, server name, login url, token url, logout url

        Returns:
            a list of tuples
        """
        configured_servers = list()
        for server_file in glob.glob(os.path.join(self.server_config_dir, "*.json")):
            with open(server_file, 'rt') as f:
                data = json.load(f)
                configured_servers.append(ServerInfo(data['server']['id'],
                                                     data['server']['name'],
                                                     data['auth']['login_url'],
                                                     data['auth']['token_url'],
                                                     data['auth']['logout_url'],
                                                     data['server']['git_url']
                                                     ))

        return configured_servers

    def _cache_server_config(self, data: dict) -> None:
        """Method to set the provided server configuration in the cache

        Args:
            data: a dictionary containing the server data, loaded from file typically

        Returns:
            None
        """
        # Delete keys if they exist
        client = self._get_redis_client()
        client.delete(self.SERVER_CONFIG_CACHE_KEY)

        # Set data in cache. Any conversions here need to be reversed in the get_server_configuration()
        data['lfs_enabled'] = 'true' if data['lfs_enabled'] is True else 'false'
        client.hmset(self.SERVER_CONFIG_CACHE_KEY, data)

    def _cache_auth_config(self, data: dict) -> None:
        """Method to set the provided auth configuration in the cache

        Args:
            data: a dictionary containing the auth data, loaded from file typically

        Returns:
            None
        """
        # Delete keys if they exist
        client = self._get_redis_client()
        client.delete(self.AUTH_CONFIG_CACHE_KEY)

        # Set data in cache
        client.hmset(self.AUTH_CONFIG_CACHE_KEY, data)

    def set_current_server(self, server_id: str) -> None:
        """Method to set the current server (writes file and loads data into the cache)

        Args:
            server_id: string identifier for the server

        Returns:
            None
        """
        if not os.path.exists(self.get_server_config_file(server_id)):
            raise ValueError(f"Server ID `{server_id}` not configured.")

        # Write "CURRENT" file to persist selected server to disk
        with open(os.path.join(self.server_config_dir, 'CURRENT'), 'wt') as f:
            f.write(server_id)

        with open(self.get_server_config_file(server_id), 'rt') as f:
            data = json.load(f)

        # Set data in cache
        self._cache_server_config(data['server'])
        self._cache_auth_config(data['auth'])

        logger.info(f"Selected server: {server_id}")

    def add_server(self, url: str) -> str:
        """Method to discover a server's configuration and add it to the local configured servers

        Args:
            url: full URL to the server's root

        Returns:
            str: id for the server
        """
        # Create server data dir if it doesn't exist
        if os.path.isdir(self.server_config_dir) is False:
            os.makedirs(self.server_config_dir, exist_ok=True)
            logger.info(f'Created `servers` dir for server configurations: {self.server_config_dir}')

        # Run primary discovery
        discovery_service = urljoin(url, '.well-known/discover.json')
        response = requests.get(discovery_service)

        if response.status_code != 200:
            raise ValueError(f"Failed to discover configuration for server located at {url}: {response.status_code}")

        data = response.json()
        server_config = dict_to_server_config(data)

        # Ensure core URLS have trailing slashes to standardize within codebase
        server_config.git_url = server_config.git_url if server_config.git_url[-1] == '/' \
            else server_config.git_url + '/'
        server_config.hub_api_url = server_config.hub_api_url if server_config.hub_api_url[-1] == '/' \
            else server_config.hub_api_url + '/'
        server_config.object_service_url = server_config.object_service_url if server_config.object_service_url[-1] == '/' \
            else server_config.object_service_url + '/'

        # Fetch Auth configuration
        response = requests.get(data['auth_config_url'])

        if response.status_code != 200:
            raise ValueError(f"Failed to load auth configuration for server located at {url}: {response.status_code}")

        data = response.json()
        auth_config = dict_to_auth_config(data)

        # Verify Server is not already configured
        server_data_file = self.get_server_config_file(server_config.id)
        if os.path.exists(server_data_file):
            raise ValueError(f"The server `{server_config.name}` located at {url} is already configured.")

        # Save configuration data
        save_data = {"server": server_config.to_dict(),
                     "auth": auth_config.to_dict()}
        with open(server_data_file, 'wt') as f:
            json.dump(save_data, f, indent=2)

        # Create directory for server's projects/datasets
        os.makedirs(self.get_user_storage_dir(server_config), exist_ok=True)

        logger.info(f"Successfully added server located at {url} with server id {server_config.id}")

        return server_config.id

    def get_current_server_id(self) -> Optional[str]:
        """Method to load the current server ID

        Returns:
            the server id, or None if no server is configured
        """
        current_file = os.path.join(self.server_config_dir, 'CURRENT')
        server_id: Optional[str] = None
        if os.path.isfile(current_file):
            # Load server config from file
            with open(current_file, 'rt') as f:
                server_id = f.read().strip()

        return server_id

    def _load_current_configuration(self) -> dict:
        """Method to look up the current selected server and load its data file

        Returns:
            dict
        """
        server_id = self.get_current_server_id()
        if server_id:
            with open(self.get_server_config_file(server_id), 'rt') as f:
                return json.load(f)
        else:
            raise FileNotFoundError("No server is currently configured and selected.")

    def get_server_configuration(self) -> ServerConfigData:
        """Method to load the configuration for a remote server.

        Returns:
            ServerConfigData
        """
        # Try first to fetch from the cache
        data = self._get_redis_client().hgetall(self.SERVER_CONFIG_CACHE_KEY)

        if not data:
            # Load configuration from file and set in the cache
            file_data = self._load_current_configuration()
            self._cache_server_config(file_data['server'])
            data = file_data['server']

        # Need to convert bools back
        data['lfs_enabled'] = True if data['lfs_enabled'] == 'true' else False

        # Make sure
        return dict_to_server_config(data)

    def get_auth_configuration(self) -> OAuth2AuthConfiguration:
        """Method to load the auth configuration for a server

        Returns:
            Auth0AuthConfiguration
        """
        # Try first to fetch from the cache
        data = self._get_redis_client().hgetall(self.AUTH_CONFIG_CACHE_KEY)

        if not data:
            # Load configuration from file and set in the cache
            file_data = self._load_current_configuration()
            self._cache_auth_config(file_data['auth'])
            data = file_data['auth']

        return dict_to_auth_config(data)
