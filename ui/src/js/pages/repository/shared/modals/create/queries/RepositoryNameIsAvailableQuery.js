// vendor
import { graphql } from 'react-relay';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const query = graphql`query RepositoryNameIsAvailableQuery($name: String!){
  repositoryNameIsAvailable(name: $name)
}`;

const RepositoryNameIsAvailable = {
  checkRespositoryName: (name) => {
    return new Promise((resolve, reject) => {
      const variables = { name };
      fetchQuery(
        query,
        variables,
        { force: true },
      ).then((response) => {
        resolve(response);
      }).catch((error) => {
        reject(error);
      });
    });
  },
};

export default RepositoryNameIsAvailable;
