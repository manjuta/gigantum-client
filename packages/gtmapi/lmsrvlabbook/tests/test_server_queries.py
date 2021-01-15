from snapshottest import snapshot
from lmsrvlabbook.tests.fixtures import fixture_working_dir
import responses


class TestServerQueries:
    @responses.activate
    def test_current_server_config(self, fixture_working_dir, snapshot):

        responses.add(responses.GET, 'https://test.repo.gigantum.com/backup', status=404)

        config_instance, data_dir, client, _ = fixture_working_dir

        query = """
       {
  currentServer{
    id
    serverId
    name
    baseUrl
    gitUrl
    gitServerType
    hubApiUrl
    objectServiceUrl
    userSearchUrl
    lfsEnabled
    authConfig{
      id
      audience
      loginUrl
      tokenUrl
      logoutUrl
      loginType
      signingAlgorithm
      publicKeyUrl
      issuer
      clientId
      typeSpecificFields{
        id
        parameter
        value
      }
    }
  }
}
        """
        r = client.execute(query)
        assert 'errors' not in r
        snapshot.assert_match(r)
