// vendor
import { graphql } from 'react-relay';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const ContainerLookupQuery = graphql`
  query ContainerLookupQuery($ids: [String]!){
    labbookList{
      localById(ids: $ids){
        environment{
          id
          imageStatus
          containerStatus
        }
      }
    }
  }
`;

const ContainerLookup = {
  query: (ids) => {
    const variables = {
      ids,
    };

    return new Promise((resolve, reject) => {
      const fetchData = () => {
        fetchQuery(
          ContainerLookupQuery,
          variables,
          { force: true },
        ).then((response) => {
          resolve(response);
        }).catch((error) => {
          console.log(error);
          reject(error);
        });
      };

      fetchData();
    });
  },
};

export default ContainerLookup;
