import yaml
import json
import pkg_resources
from framework.factory.models_enums.user_credentials import UserCredentials
from framework.factory.models_enums.constants_enums import LoginUser


class ConfigurationManager:
    """Handles the configuration of the application.

    The configuration details for application settings, page URL
    and user credentials are managed here.
    """

    __instance = None
    __general_settings = None
    __user_credentials = None
    __url_settings = None

    @staticmethod
    def getInstance():
        """ Static access method. """
        if ConfigurationManager.__instance is None:
            ConfigurationManager()
        return ConfigurationManager.__instance

    def __init__(self) -> None:
        """ Virtually private constructor. """
        if ConfigurationManager.__instance is not None:
            raise Exception("Unable to create the instance.")
        else:
            ConfigurationManager.__instance = self

        if ConfigurationManager.__general_settings is None:
            ConfigurationManager.__general_settings = self.__load_app_settings()

        if ConfigurationManager.__user_credentials is None:
            ConfigurationManager.__user_credentials = self.__load_user_credentials()

        if ConfigurationManager.__url_settings is None:
            ConfigurationManager.__url_settings = self.__load_url_settings()

    def __load_app_settings(self) -> dict:
        """ Load app settings from config file.

        Returns: dictionary
        """
        with open(pkg_resources.resource_filename('configuration', 'configuration.yaml'), 'r') as file:
            documents = yaml.safe_load(file)
        return documents

    def __load_user_credentials(self) -> dict:
        """ Load user credentials from config file.

        Returns: dictionary
        """
        with open(pkg_resources.resource_filename('configuration', 'credentials.json'), 'r') as file:
            dictionary = json.load(file)
        return dictionary

    def __load_url_settings(self) -> dict:
        """ Load page URLs from config file.

        Returns: dictionary
        """
        platform = self.get_app_setting("test_environment")
        with open(pkg_resources.resource_filename('configuration', f"url_{platform}.yaml"), 'r') as file:
            documents = yaml.safe_load(file)
        return documents

    def get_app_setting(self, key: str) -> str:
        """Provides application settings.
        Args:
            key: app setting key
        Returns:
            Setting data from app settings file based on the given key
        """
        if key in self.__general_settings["configuration"]:
            return self.__general_settings["configuration"][key]
        else:
            return None

    def get_page_url(self, key: str) -> str:
        """Provides page url.
        Args:
            platform: URl are classified based on the platform such as development, staging, and production
            key: URL key, always be a name of a page class
        Returns:
            Page URL from page URL settings file based on the given key and platform
        """
        if key in self.__url_settings["page_url"]:
            return self.__url_settings["page_url"][key]
        else:
            return None

    def get_user_credentials(self, user: LoginUser) -> UserCredentials:
        """Provides user credential.
        Args:
            user: given user type
        Returns:
            User and password of given user type
        """
        user_data = self.__user_credentials[user.value]
        user_credentials = UserCredentials(user_data['user_name'], user_data['password'])
        return user_credentials
