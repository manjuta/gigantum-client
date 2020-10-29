import os
from typing import Optional

from gtmcore.logging import LMLogger
from gtmcore.auth.identity import IdentityManager, User, AuthenticationError
from gtmcore.configuration import Configuration

logger = LMLogger.get_logger()


class BrowserIdentityManager(IdentityManager):
    """Class for authenticating a user and accessing user identity in a no-cache mode suitable for web hosting. """

    def __init__(self, config_obj: Configuration) -> None:
        """Constructor"""
        # Call super constructor
        IdentityManager.__init__(self, config_obj=config_obj)
        self.auth_dir = os.path.join(self.config.app_workdir, '.labmanager', 'identity')

    def is_authenticated(self, access_token: Optional[str] = None, id_token: Optional[str] = None) -> bool:
        """Method to check if the user is currently authenticated in the context of this identity manager

        Args:
            access_token(str): API access JSON web token from Auth0
            id_token(str): ID JSON web token from Auth0 (not needed for this middleware)

        Returns:
            bool
        """
        return self.is_token_valid(access_token)

    def is_token_valid(self, access_token: Optional[str] = None) -> bool:
        """Method to check if the user's access token session is still valid

        Returns:
            bool
        """
        if not access_token:
            return False
        else:
            try:
                auth_config = self.config.get_auth_configuration()
                _ = self.validate_jwt_token(access_token, auth_config.audience)
            except AuthenticationError:
                return False

            return True

    def get_user_profile(self, access_token: Optional[str] = None, id_token: Optional[str] = None) -> Optional[User]:
        """Method to get the current logged in user profile info

        Args:
            access_token(str): API JSON web token from Auth0
            id_token(str): ID JSON web token from Auth0

        Returns:
            User
        """
        if access_token is None or id_token is None:
            err_dict = {"code": "missing_token",
                        "description": "JWT must be provided to authenticate user in browser-based auth"}
            raise AuthenticationError(err_dict, 401)

        # Validate JWT token
        auth_config = self.config.get_auth_configuration()
        token_payload = self.validate_jwt_token(id_token, auth_config.client_id,
                                                access_token=access_token)

        # Create user identity instance
        self.user = User(username=self._get_profile_attribute(token_payload, "nickname", required=True),
                         email=self._get_profile_attribute(token_payload, "email", required=True),
                         given_name=self._get_profile_attribute(token_payload, "given_name", required=False),
                         family_name=self._get_profile_attribute(token_payload, "family_name", required=False))

        # Check if it's the first time this user has logged into this instance
        self._check_first_login(self.user.username, access_token, id_token)

        return self.user

    def logout(self) -> None:
        """Method to logout a user if applicable

        Returns:
            None
        """
        self.user = None
        self.rsa_key = None
        logger.info("Logout complete.")
