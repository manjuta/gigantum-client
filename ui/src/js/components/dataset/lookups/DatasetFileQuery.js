// vendor
import { graphql } from 'react-relay';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const DatasetFileQuery = graphql`
  query DatasetFileQuery($ids: [String]!){
    nodes(ids: $ids) {
        ... on DatasetFile {
          id
          isLocal
        }
      }
  }
`;

const DatasetFile = {
  query: (ids) => {
    const variables = {
      ids,
    };

    return new Promise((resolve, reject) => {
      const fetchData = () => {
        fetchQuery(
          DatasetFileQuery,
          variables,
          { fetch: true },
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

export default DatasetFile;
