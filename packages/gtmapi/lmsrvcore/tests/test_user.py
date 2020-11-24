import pytest
import flask
import redis

from lmsrvcore.auth.user import get_logged_in_author, get_logged_in_username, get_logged_in_user
from gtmcore.gitlib.git import GitAuthor
from lmsrvcore.tests.fixtures import fixture_working_dir_with_cached_user


class TestUserAuthHelpers(object):
    def test_get_logged_in_user(self, fixture_working_dir_with_cached_user):
        """Test getting identity manager in a flask app"""

        user = get_logged_in_user()
        assert user.username == "default"
        assert user.email == "jane@doe.com"
        assert user.given_name == "Jane"
        assert user.family_name == "Doe"

    def test_get_logged_in_user_cached(self, fixture_working_dir_with_cached_user):
        """Test getting identity after it has been initialized on first query in a a request"""
        flask.g.user_obj = None

        user = get_logged_in_user()
        assert user.username == "default"
        assert user.email == "jane@doe.com"
        assert user.given_name == "Jane"
        assert user.family_name == "Doe"

        assert flask.g.user_obj == user

        user2 = get_logged_in_user()
        assert user == user2

    def test_get_logged_in_username(self, fixture_working_dir_with_cached_user):
        """Test authorization middlewhere when loading a user exists locally"""
        assert get_logged_in_username() == "default"

    def test_get_logged_in_author(self, fixture_working_dir_with_cached_user):
        """Test authorization middlewhere when a token header is malformed"""

        author = get_logged_in_author()
        assert type(author) == GitAuthor
        assert author.name == "default"
        assert author.email == "jane@doe.com"
