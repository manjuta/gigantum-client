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
  mutation MakeLabbookDirectoryMutation($input: MakeLabbookDirectoryInput!){
    makeLabbookDirectory(input: $input){
      newLabbookFileEdge{
        node{
          id
          isDir
          modifiedAt
          key
          size
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
        'newLabbookFileEdge',
      );

      RelayRuntime.ConnectionHandler.insertEdgeAfter(
        conn,
        newEdge,
      );
    }
  }
}

export default function MakeLabbookDirectoryMutation(
  connectionKey,
  owner,
  labbookName,
  labbookId,
  directory,
  section,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      directory,
      section,
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
        edgeName: 'newLabbookFileEdge',
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
        node.setValue(directory, 'key');
        node.setValue(0, 'modifiedAt');
        node.setValue(100, 'size');

        sharedUpdater(store, labbookId, connectionKey, node);
      },
    },
  );
}
