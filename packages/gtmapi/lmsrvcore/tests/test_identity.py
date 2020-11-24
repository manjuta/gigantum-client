import pytest
import flask

from lmsrvcore.auth.identity import get_identity_manager_instance, AuthenticationError
from lmsrvcore.middleware import AuthorizationMiddleware, error_middleware, time_all_resolvers_middleware, \
    DataloaderMiddleware
from lmsrvcore.tests.fixtures import fixture_working_dir_with_cached_user
from gtmcore.configuration import Configuration

from gtmcore.auth.local import LocalIdentityManager


class MockFlaskContext(object):
    """Mock class to test middleware"""
    def __init__(self):
        self.headers = {"Authorization": "Bearer adkajshfgklujasdhfiuashfiusahf"}
        self.labbook_loader = None


class MockGrapheneInfo(object):
    """Mock class to test middleware"""
    def __init__(self):
        self.context = MockFlaskContext()


class TestAuthIdentity(object):
    def test_get_identity_manager_instance(self, fixture_working_dir_with_cached_user):
        """Test getting identity manager in a flask app"""

        # Not id manager should exist in the request context to start
        assert flask.g.get('ID_MGR', None) is None

        # Test normal
        mgr = get_identity_manager_instance()
        assert type(mgr) == LocalIdentityManager

        # ID manager should now be cached within the request context
        mgr = flask.g.get('ID_MGR', None)
        assert mgr is not None
        assert type(mgr) == LocalIdentityManager

    def test_authorization_middleware_user_local(self, fixture_working_dir_with_cached_user):
        """Test authorization middlewhere when loading a user exists locally"""

        def next_fnc(root, info, **args):
            """Dummy method to test next chain in middleware"""
            assert root == "something"
            assert type(info) == MockGrapheneInfo
            assert args['foo'] == "a"
            assert args['bar'] == "b"

        # Create a mocked info obj and remove the auth header since you are testing the logged in user pull from cache
        fake_info = MockGrapheneInfo()
        del fake_info.context.headers["Authorization"]

        mw = AuthorizationMiddleware()

        mw.resolve(next_fnc, "something", fake_info, foo="a", bar="b")

    def test_authorization_middleware_bad_header(self, fixture_working_dir_with_cached_user):
        """Test authorization middlewhere when a token header is malformed"""

        def next_fnc(root, info, **args):
            """Dummy method to test next chain in middleware"""
            assert "Should not get here"

        fake_info = MockGrapheneInfo()
        fake_info.context.headers["Authorization"] = "Token asdfasdfhasdf"

        mw = AuthorizationMiddleware()
        with pytest.raises(AuthenticationError):
            mw.resolve(next_fnc, "something", fake_info, foo="a", bar="b")


    # TODO: Add test when easier to mock a token
    # def test_authorization_middleware_token(self):
    #     """Test authorization middlewhere when a token is provided"""
    #     pass


