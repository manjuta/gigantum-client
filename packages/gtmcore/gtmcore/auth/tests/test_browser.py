import pytest
import responses

from gtmcore.configuration import Configuration
from gtmcore.fixtures import mock_config_file_with_auth_browser
from gtmcore.auth.identity import get_identity_manager, AuthenticationError
from gtmcore.auth.browser import BrowserIdentityManager
from gtmcore.auth import User


class TestIdentityBrowser(object):
    # TODO: Possibly move to integration tests or fully mock since these tests make a call out to Auth0

    def test_is_session_valid(self, mock_config_file_with_auth_browser):
        """test check for valid session"""
        config = Configuration()
        mgr = get_identity_manager(config)
        assert type(mgr) == BrowserIdentityManager

        # Invalid with no token
        assert mgr.is_token_valid() is False
        assert mgr.is_token_valid(None) is False
        assert mgr.is_token_valid("asdfasdfasdf") is False

        assert mgr.is_token_valid(mock_config_file_with_auth_browser[2]['access_token']) is True
        assert mgr.rsa_key is not None

    def test_is_authenticated_token(self, mock_config_file_with_auth_browser):
        """test checking if the user is authenticated via a token"""
        config = Configuration()
        mgr = get_identity_manager(config)
        assert type(mgr) == BrowserIdentityManager

        # Invalid with no token
        assert mgr.is_authenticated() is False
        assert mgr.is_authenticated(None) is False
        assert mgr.is_authenticated("asdfasdfa") is False

        assert mgr.is_authenticated(mock_config_file_with_auth_browser[2]['access_token']) is True

        # Second access should fail since not cached
        mgr2 = get_identity_manager(config)
        assert mgr2.is_authenticated() is False
        assert mgr2.is_authenticated("asdfasdfa") is False  # An "expired" token will essentially do this

    @responses.activate
    def test_get_user_profile(self, mock_config_file_with_auth_browser):
        """test getting a user profile from Auth0"""
        responses.add(responses.POST, 'https://test.gigantum.com/api/v1/',
                      json={'data': {'synchronizeUserAccount': {'gitUserId': "123"}}},
                      status=200)
        responses.add_passthru('https://gigantum.auth0.com/.well-known/jwks.json')

        config = Configuration()
        mgr = get_identity_manager(config)
        assert type(mgr) == BrowserIdentityManager
        # Don't check at_hash claim due to password grant not setting it in the token
        mgr.validate_at_hash_claim = False

        # Load User
        with pytest.raises(AuthenticationError):
            # Should fail without a token
            mgr.get_user_profile()

        # Load User
        u = mgr.get_user_profile(mock_config_file_with_auth_browser[2]['access_token'],
                                 mock_config_file_with_auth_browser[2]['id_token'])
        assert type(u) == User
        assert u.username == "johndoe"
        assert u.email == "john.doe@gmail.com"
        assert u.given_name == "John"
        assert u.family_name == "Doe"

        # Second access should fail since not cached
        mgr2 = get_identity_manager(config)
        with pytest.raises(AuthenticationError):
            # Should fail without a token
            mgr2.get_user_profile()
