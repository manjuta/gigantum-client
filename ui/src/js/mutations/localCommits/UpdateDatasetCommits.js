// vendor
import reactRelay from 'react-relay';
import environment from 'JS/createRelayEnvironment';
// utilities
// import StoreUpdaterFunctions from './StoreUpdaterFunctions';

/**
 @param {Object} edge
 @param {Object} mutationData
 @param {Object} component
 gets access to the store using commitLocalUpdate
 sets node values and writes to the relay store
 @calls {StoreUpdaterFunctions.insertEdgeAfter}
*/
const updateDatasetCommits = (response) => {
  reactRelay.commitLocalUpdate(environment, (store) => {
    const { dataset } = response.data;
    const node = store.get(dataset.id);
    node.setValue(dataset.commitsAhead, 'commitsAhead');
    node.setValue(dataset.commitsBehind, 'commitsBehind');
  });
};

export default {
  updateDatasetCommits,
};
