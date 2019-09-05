// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import RelayRuntime from 'relay-runtime';
import uuidv4 from 'uuid/v4';
// environment
import environment from 'JS/createRelayEnvironment';

const mutation = graphql`
  mutation MakeDatasetDirectoryMutation($input: MakeDatasetDirectoryInput!){
    makeDatasetDirectory(input: $input){
      newDatasetFileEdge{
        node{
          id
          isDir
          modifiedAt
          key
          size
          isLocal
        }
        cursor
      }
      clientMutationId
    }
  }
`;


function sharedUpdater(store, labbookId, connectionKey, node) {
  const labbookProxy = store.get(labbookId);


  if (labbookProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      connectionKey,
    );


    if (conn) {
      const newEdge = RelayRuntime.ConnectionHandler.createEdge(
        store,
        conn,
        node,
        'newDatasetFileEdge',
      );

      RelayRuntime.ConnectionHandler.insertEdgeAfter(
        conn,
        newEdge,
      );
    }
  }
}


export default function MakeDatasetDirectoryMutation(
  connectionKey,
  datasetOwner,
  datasetName,
  labbookId,
  key,
  callback,
) {
  const variables = {
    input: {
      datasetOwner,
      datasetName,
      key,
      clientMutationId: uuidv4(),
    },
  };

  const optimisticId = uuidv4();
  commitMutation(
    environment,
    {
      mutation,
      variables,
      configs: [{ // commented out until nodes are returned
        type: 'RANGE_ADD',
        parentID: labbookId,
        connectionInfo: [{
          key: connectionKey,
          rangeBehavior: 'prepend',
        }],
        edgeName: 'newDatasetFileEdge',
      }],
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
        }
        callback(response, error);
      },
      onError: err => callback({}, err),
      optimisticUpdater: (store) => {
        const node = store.create(optimisticId, 'CodeFile');

        node.setValue(optimisticId, 'id');
        node.setValue(true, 'isDir');
        node.setValue(key, 'key');
        node.setValue(0, 'modifiedAt');
        node.setValue(100, 'size');
        node.setValue(true, 'isLocal');

        sharedUpdater(store, labbookId, connectionKey, node);
      },
    },
  );
}
