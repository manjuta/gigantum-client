import pytest

from gtmcore.configuration import Configuration
from gtmcore.fixtures.auth import mock_config_file_with_auth_anon_review, mock_config_file_with_auth_multi_anon_review
from gtmcore.auth.identity import get_identity_manager_class, AuthenticationError
from gtmcore.auth.anon_review import AnonymousReviewIdentityManager
from gtmcore.auth import User


class TestIdentityAnonReview(object):
    def test_is_session_valid(self, mock_config_file_with_auth_anon_review):
        """test check for valid session"""
        config = Configuration()
        # We grab the string that was used to configure the AnonymousReviewIdentityManager
        anon_review_secret = config.config['anon_review_secret']

        mgr = get_identity_manager_class(config)(config)
        assert type(mgr) == AnonymousReviewIdentityManager

        # Invalid with no token
        assert mgr.is_token_valid() is False
        assert mgr.is_token_valid(None) is False

        # Junk base64 encoded data should be False too
        assert mgr.is_token_valid("YXNkZmFzZGZhc2Rm") is False

        # A proper "anonymous" bearer token will be considered valid
        assert mgr.is_token_valid(anon_review_secret) is True

    def test_is_authenticated_token(self, mock_config_file_with_auth_anon_review):
        """test checking if we have the right token"""
        config = Configuration()
        # We grab the string that was used to configure the AnonymousReviewIdentityManager
        anon_review_secret = config.config['anon_review_secret']

        mgr = get_identity_manager_class(config)(config)
        assert type(mgr) == AnonymousReviewIdentityManager

        # Invalid with no token
        assert mgr.is_authenticated() is False
        assert mgr.is_authenticated(None) is False
        assert mgr.is_authenticated(anon_review_secret) is True

    def test_get_anon_user_profile(self, mock_config_file_with_auth_anon_review):
        """test getting a user profile when anonymous"""
        config = Configuration()
        # We grab the string that was used to configure the AnonymousReviewIdentityManager
        anon_review_secret = config.config['anon_review_secret']

        mgr = get_identity_manager_class(config)(config)
        assert type(mgr) == AnonymousReviewIdentityManager

        # Load User
        with pytest.raises(AuthenticationError):
            # Should fail without a token
            mgr.get_user_profile()

        # Load User
        u = mgr.get_user_profile(anon_review_secret)

        assert type(u) == User
        assert u.username == "anonymous1"
        assert u.email == "anonymous@gigantum.com"
        assert u.given_name == "Anonymous"
        assert u.family_name == "Reviewer-1"

    def test_get_multi_anon_user_profile(self, mock_config_file_with_auth_multi_anon_review):
        """test getting a user profile when anonymous"""
        config = Configuration(mock_config_file_with_auth_multi_anon_review)
        # We grab the string that was used to configure the AnonymousReviewIdentityManager
        anon_review_secrets = config.config['anon_review_secret']

        mgr = get_identity_manager_class(config)(config)
        assert type(mgr) == AnonymousReviewIdentityManager

        # Load User
        with pytest.raises(AuthenticationError):
            # Should fail without a token
            mgr.get_user_profile()

        # Load Users
        for i, secret in enumerate(anon_review_secrets):
            u = mgr.get_user_profile(secret)

            assert type(u) == User
            assert u.username == f"anonymous{i+1}"
            assert u.email == "anonymous@gigantum.com"
            assert u.given_name == "Anonymous"
            assert u.family_name == f"Reviewer-{i+1}"
