import os
from typing import Optional
import pathlib
import base64

from gtmcore.configuration import Configuration
from gtmcore.logging import LMLogger
from gtmcore.auth.identity import IdentityManager, User, AuthenticationError
from gtmcore.workflows.gitlab import check_and_add_user

logger = LMLogger.get_logger()


class AnonymousIdentityManager(IdentityManager):
    """Class for authenticating a user and accessing user identity in a no-cache mode suitable for web hosting.
    Additionally, supports anonymous use"""

    # Create anonymous user identity instance
    anon_user = User(email="anonymous@gigantum.com",
                     username="anonymous",
                     given_name="Anonymous",
                     family_name="User")

    @property
    def allow_server_access(self) -> bool:
        """Property indicating if an identity manager is configured in a way that will allow access to a gigantum
         hub server.

        Returns:
            bool
        """
        return False

    def _check_first_login(self, username: Optional[str], access_token: Optional[str],
                           id_token: Optional[str]) -> None:
        """Method to check if this is the first time a user has logged in to create their working dir. If the user is
        not anonymous, check to make sure they exist in the git backend.

        Returns:
            None
        """
        working_directory = self.config.config['git']['working_directory']

        if not username:
            raise ValueError("Cannot check first login without a username set")

        if not access_token:
            raise ValueError("Cannot check first login without a valid access_token")

        # Check if the user has already logged into this instance
        if not os.path.exists(os.path.join(working_directory, username)):
            # Create user dir
            pathlib.Path(working_directory, username, username, 'labbooks').mkdir(parents=True,
                                                                                  exist_ok=True)

            # Add user to backend if needed, if a real user.
            if not self.is_anonymous(access_token):
                if not id_token:
                    raise ValueError("Cannot check first login without a valid id_token")

                server_config = self.config.get_server_configuration()
                check_and_add_user(hub_api=server_config.hub_api_url, access_token=access_token, id_token=id_token)

    def is_authenticated(self, access_token: Optional[str] = None, id_token: Optional[str] = None) -> bool:
        """Method to check if the user is currently authenticated in the context of this identity manager

        Args:
            access_token: API access JSON web token from Auth0
            id_token: ID JSON web token from Auth0 (not needed for this middleware)

        Returns:
            Is there a valid access token?
        """
        if not access_token:
            # If no access token, you aren't authenticated and can't be checked to be anonymous
            return False

        return self.is_token_valid(access_token)

    def is_anonymous(self, access_token: str) -> bool:
        """Method to determine if the user is running anonymously

        Anonymous access_token are indicated via a specially crafted string that mirrors the JWT structure, but is in
        no way a valid JWT. The header and signature are GIGANTUM-ANONYMOUS-USER base64 encoded. The payload is a UUID
        for the anonymous user base64 encoded. E.g:

            R0lHQU5UVU0tQU5PTllNT1VTLVVTRVI=.VVVJRDEyMzQ1Njc4OTA=.R0lHQU5UVU0tQU5PTllNT1VTLVVTRVI=

        Args:
            access_token(str): The current access_token

        Returns:
            bool
        """
        is_anonymous = False
        if access_token:
            parts = access_token.split('.')
            if len(parts) == 3:
                header = base64.urlsafe_b64decode(f"{parts[0]}{'=' * (len(parts[0]) % 4)}").decode()
                if "GIGANTUM-ANONYMOUS-USER" == header:
                    is_anonymous = True

        return is_anonymous

    def is_token_valid(self, access_token: Optional[str] = None) -> bool:
        """Method to check if the user's access token session is still valid

        Returns:
            bool
        """
        is_token_valid = False
        if access_token:
            if self.is_anonymous(access_token):
                # The session is always valid because you don't have a real token.
                is_token_valid = True
            else:
                try:
                    auth_config = self.config.get_auth_configuration()
                    _ = self.validate_jwt_token(access_token, auth_config.audience)
                    # If you get here you are valid
                    is_token_valid = True
                except AuthenticationError:
                    # Token is not valid
                    is_token_valid = False

        return is_token_valid

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
                        "description": "JWT must be provided to authenticate user if no local "
                                       "stored identity is available"}
            raise AuthenticationError(err_dict, 401)

        if self.is_anonymous(access_token):
            # Create user identity instance
            self.user = self.anon_user
        else:
            # Validate JWT token
            auth_config = self.config.get_auth_configuration()
            token_payload = self.validate_jwt_token(id_token, auth_config.client_id,
                                                    access_token=access_token)

            # Create user identity instance
            self.user = User()
            self.user.email = self._get_profile_attribute(token_payload, "email", required=True)
            self.user.username = self._get_profile_attribute(token_payload, "nickname", required=True)
            self.user.given_name = self._get_profile_attribute(token_payload, "given_name", required=False)
            self.user.family_name = self._get_profile_attribute(token_payload, "family_name", required=False)

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
