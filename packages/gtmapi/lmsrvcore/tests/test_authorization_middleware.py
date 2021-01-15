from snapshottest import snapshot
from werkzeug.datastructures import EnvironHeaders
import responses
from lmsrvcore.tests.fixtures import fixture_working_dir_with_auth_middleware


class ContextMock(object):
    """A simple class to mock the Flask request context"""
    def __init__(self, headers: dict):
        self.headers = EnvironHeaders(headers)


class TestAuthorizationMiddleware(object):
    def test_not_authorized(self, fixture_working_dir_with_auth_middleware, snapshot):
        """Test making a request with invalid tokens and ALL fields are null"""
        config, working_dir, client = fixture_working_dir_with_auth_middleware

        current_query = """
               {
                 cudaAvailable
                 currentLabbookSchemaVersion
                 currentServer{
                   id
                   serverId
                   name
                 }
                 
               }
        """
        r = client.execute(current_query, context=ContextMock({'HTTP_AUTHORIZATION': "Bearer afaketoken",
                                                               'HTTP_IDENTITY': "afakeidtoken"}))
        assert 'errors' in r
        snapshot.assert_match(r)

    @responses.activate
    def test_authorized(self, fixture_working_dir_with_auth_middleware, snapshot):
        """Test making a request with valid tokens"""
        responses.add(responses.GET, 'https://test.repo.gigantum.com/backup', status=404)

        config, working_dir, client = fixture_working_dir_with_auth_middleware

        current_query = """
               {
                 cudaAvailable
                 currentLabbookSchemaVersion
                 currentServer{
                   id
                   serverId
                   name
                 }
                 
               }
        """
        r = client.execute(current_query, context=ContextMock({'HTTP_AUTHORIZATION': "Bearer good_fake_token",
                                                               'HTTP_IDENTITY': "good_fake_id_token"}))
        assert 'errors' not in r
        snapshot.assert_match(r)

    @responses.activate
    def test_authorized_switch_servers(self, fixture_working_dir_with_auth_middleware, snapshot):
        """Test making a request with valid tokens"""
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
                      json={"audience": "test2.api.gigantum.io",
                            "issuer": "https://test2-auth.gigantum.com",
                            "signing_algorithm": "RS256",
                            "public_key_url": "https://test2-auth.gigantum.com/.well-known/jwks.json",
                            "login_url": "https://test2.gigantum.com/auth/login",
                            "logout_url": "https://test2.gigantum.com/auth/logout",
                            "token_url": "https://test2.gigantum.com/auth/exchange",
                            "login_type": "auth0",
                            "client_id": "0000000000000000"},
                      status=200)
        responses.add(responses.GET, 'https://test2.repo.gigantum.com/backup', status=404)

        config, working_dir, client = fixture_working_dir_with_auth_middleware

        config.add_server('https://test2.gigantum.com/')

        current_query = """
               {
                 cudaAvailable
                 currentLabbookSchemaVersion
                 currentServer{
                   id
                   serverId
                   name
                 }
                 
               }
        """
        r = client.execute(current_query, context=ContextMock({'HTTP_AUTHORIZATION': "Bearer good_fake_token",
                                                               'HTTP_IDENTITY': "good_fake_id_token",
                                                               'HTTP_GTM_SERVER_ID': "another-server"}))
        assert 'errors' not in r
        snapshot.assert_match(r)
