// vendor
import { graphql } from 'react-relay';
// localCommits
import UpdateDatasetCommits from 'Mutations/localCommits/UpdateDatasetCommits';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const UpdateDatasetCommitsQuery = graphql`
  query UpdateDatasetCommitsQuery($owner: String!, $name: String!){
    dataset(owner: $owner, name: $name){
        id
        commitsAhead
        commitsBehind
    }
  }
`;

const DatasetCommits = {
  getDatasetCommits: (variables) => {
    const fetchData = () => {
      fetchQuery(
        UpdateDatasetCommitsQuery,
        variables,
        { force: true },
      ).then((response, error) => {
        UpdateDatasetCommits.updateDatasetCommits(response);
      }).catch((error) => {
        console.log(error);
      });
    };
    fetchData();
  },
};

export default DatasetCommits;
