from snapshottest import snapshot
from lmsrvlabbook.tests.fixtures import fixture_working_dir


class TestServerQueries:
    def test_current_server_config(self, fixture_working_dir, snapshot):
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
