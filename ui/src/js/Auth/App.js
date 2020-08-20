// vendor
import { graphql } from 'react-relay';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const appQuery = graphql`
  query AppQuery{
    currentServer {
      authConfig {
        audience
        id
        issuer
        loginType
        loginUrl
        publicKeyUrl
        serverId
        signingAlgorithm
        typeSpecificFields {
          id
          parameter
          serverId
          value
        }
      }
      baseUrl
      gitServerType
      gitUrl
      hubApiUrl
      id
      lfsEnabled
      name
      objectServiceUrl
      serverId
      userSearchUrl
    }
  }
`;

const AppQuery = {
  getAppData: (overrideHeaders = {}) => new Promise((resolve, reject) => {
    const fetchData = () => {
      fetchQuery(
        appQuery,
        {},
        { force: true },
        null,
        overrideHeaders,
      ).then((response, error) => {
        if (response) {
          resolve(response);
        } else {
          reject(response);
        }
      }).catch((error) => {
        reject(error);
      });
    };

    fetchData();
  }),
};

export default AppQuery;
