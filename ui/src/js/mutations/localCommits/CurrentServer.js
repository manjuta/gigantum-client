// vendor
import reactRelay from 'react-relay';

/**
 @param {Object} edge
 @param {Object} mutationData
 @param {Object} component
 gets access to the store using commitLocalUpdate
 sets node values and writes to the relay store
 @calls {StoreUpdaterFunctions.insertEdgeAfter}
*/
const updateCurrentServer = (
  id,
  backupInProgress,
  environment,
) => {
  reactRelay.commitLocalUpdate(
    environment,
    (store) => {
      const node = store.get(id);
      if (node) {
        node.setValue(backupInProgress, 'backupInProgress');
      }
    },
  );
};

export { updateCurrentServer };

export default {
  updateCurrentServer,
};
