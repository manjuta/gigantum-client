from typing import Optional

from gtmcore.configuration import Configuration
from gtmcore.logging import LMLogger
from gtmcore.auth.identity import User, AuthenticationError
from gtmcore.auth.anonymous import AnonymousIdentityManager

logger = LMLogger.get_logger()


class AnonymousReviewIdentityManager(AnonymousIdentityManager):
    """Class that only allows anonymous use, with access_token checked against a secret

    The access_token can be populated with a hash-arg like https://...#access_token=1234. It is
    not currently encoded into a psuedo-JWT, in order to simplify reading directly from the deploy
    script or the config file itself.

    The secret tokens are generally set in the config file with top level key `anon_review_secret` -
    being top-level makes it easier to simply append the secret to an existing config.
    The value can be a single string or a list of strings. A distinct user will be created for each individual token.
    """

    def __init__(self, config_obj: Configuration):
        super().__init__(config_obj)

        try:
            secrets = self.config.config["anon_review_secret"]
        except KeyError:
            raise ValueError("'auth > identity_manager' set to 'anon_review' but no 'anon_review_secret' is specified")

        if type(secrets) is not list:
            self.secrets = [str(secrets)]
        else:
            self.secrets = [str(s) for s in secrets]


    @property
    def allow_server_access(self) -> bool:
        """Anonymous review does not provide access to the Hub

        Returns:
            bool
        """
        return False

    def is_authenticated(self, access_token: Optional[str] = None, id_token: Optional[str] = None) -> bool:
        """Once we get past the hash-arg check, we are always authenticated

        Args:
            access_token: checked via self.is_anonymous()
            id_token: ignored

        Returns:
            bool
        """
        if not access_token:
            # If no access token, no anonymous access
            return False

        return self.is_anonymous(access_token)

    def is_anonymous(self, access_token: str) -> bool:
        """In anonymous review, we are always / only anonymous

        Args:
            access_token: checked against the anon_review_secret, which is a list of str
              (note that an individual str is converted to a list of str in __init__())

        Returns:
            True
        """
        return access_token in self.secrets

    def is_token_valid(self, access_token: Optional[str] = None) -> bool:
        """Method to check if the user's access token session is still valid

        access_token: checked via self.is_anonymous()

        Returns:
            bool
        """
        if not access_token:
            return False

        return self.is_anonymous(access_token)

    def get_user_profile(self, access_token: Optional[str] = None, id_token: Optional[str] = None) -> Optional[User]:
        """Return the anonymous user if the access_token matches

        Args:
            access_token: checked against self.is_anonymous()
            id_token: ignored

        Returns:
            User
        """
        if not access_token:
            err_dict = {"code": "missing_token",
                        "description": "access_token must be provided for anonymous access"}
            raise AuthenticationError(err_dict, 401)

        try:
            index = self.secrets.index(access_token) + 1
            # Create user identity instance
            return User(email="anonymous@gigantum.com",
                        username=f"anonymous{index}",
                        given_name="Anonymous",
                        family_name=f"Reviewer-{index}")
        except ValueError:
            err_dict = {"code": "wrong_token",
                        "description": "access_token must match client configuration for anonymous access"}
            raise AuthenticationError(err_dict, 401)
