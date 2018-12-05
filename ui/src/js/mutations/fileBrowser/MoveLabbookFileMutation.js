import {
  commitMutation,
  graphql,
} from 'react-relay';
import RelayRuntime from 'relay-runtime';
import environment from 'JS/createRelayEnvironment';

import { setErrorMessage } from 'JS/redux/reducers/footer';

const mutation = graphql`
  mutation MoveLabbookFileMutation($input: MoveLabbookFileInput!){
    moveLabbookFile(input: $input){
      updatedEdges(first: 1){
        edges{
          node{
              id
              isDir
              modifiedAt
              key
              size
            }
            cursor
        }
      }
      clientMutationId
    }
  }
`;

let tempID = 0;

function sharedDeleteUpdater(store, labbookID, removeIds, connectionKey) {
  const labbookProxy = store.get(labbookID);
  if (labbookProxy) {
    removeIds.forEach((deletedID) => {
      const conn = RelayRuntime.ConnectionHandler.getConnection(
        labbookProxy,
        connectionKey,
      );

      if (conn) {
        RelayRuntime.ConnectionHandler.deleteNode(
          conn,
          deletedID,
        );
        store.delete(deletedID);
      }
    })
  }
}


export default function MoveLabbookFileMutation(
  connectionKey,
  owner,
  labbookName,
  labbookId,
  edge,
  srcPath,
  dstPath,
  section,
  removeIds,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      srcPath,
      dstPath,
      section,
      clientMutationId: `${tempID++}`,
    },
  };
  const recentConnectionKey = section === 'code' ? 'MostRecentCode_allFiles' :
    section === 'input' ? 'MostRecentInput_allFiles' :
      'MostRecentOutput_allFiles';

  const configs = [{
    type: 'RANGE_ADD',
    parentID: labbookId,
    connectionInfo: [{
      key: connectionKey,
      rangeBehavior: 'append',
    }],
    edgeName: 'newLabbookFileEdge',
  }, {
    type: 'RANGE_ADD',
    parentID: labbookId,
    connectionInfo: [{
      key: recentConnectionKey,
      rangeBehavior: 'append',
    }],
    edgeName: 'newLabbookFileEdge',
  }];

  if (removeIds.length) {
    removeIds.forEach((id) => {
      configs.unshift({
        type: 'NODE_DELETE',
        deletedIDFieldName: id,
      });
    });
  }


  commitMutation(
    environment,
    {
      mutation,
      variables,
      // configs,
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
          setErrorMessage(`ERROR: Could not Move labbook file ${srcPath}`, error);
        }
        callback(response, error);
      },
      onError: err => console.error(err),
      optimisticUpdater: (store) => {
        // sharedDeleteUpdater(store, labbookId, removeIds, connectionKey);
        // sharedDeleteUpdater(store, labbookId, removeIds, recentConnectionKey);
        // removeIds.forEach((id) => {
        //   store.delete(id)
        // })

        //
        //   const labbookProxy = store.get(labbookId);
        //   if (labbookProxy) {
        //     const conn = RelayRuntime.ConnectionHandler.getConnection(
        //       labbookProxy,
        //       connectionKey,
        //     );
        //     store.delete(edge.node.id)
        //     const node = store.create(edge.node.id, 'MoveFile');
        //     node.setValue(edge.node.id, 'id');
        //     node.setValue(edge.node.isDir, 'isDir');
        //     node.setValue(edge.node.key, 'key');
        //     node.setValue(edge.node.modifiedAt, 'modifiedAt');
        //     node.setValue(edge.node.size, 'size');
        //     const newEdge = RelayRuntime.ConnectionHandler.createEdge(
        //       store,
        //       conn,
        //       node,
        //       'newLabbookFileEdge',
        //     );
        //     RelayRuntime.ConnectionHandler.insertEdgeAfter(
        //       conn,
        //       newEdge,
        //       edge.cursor,
        //     );
        //   }
        // });
      },
      updater: (store, response) => {
        sharedDeleteUpdater(store, labbookId, removeIds, connectionKey);
        sharedDeleteUpdater(store, labbookId, removeIds, recentConnectionKey);
        if (response && response.moveLabbookFile && response.moveLabbookFile.updatedEdges && response.moveLabbookFile.updatedEdges.edges) {
          response.moveLabbookFile.updatedEdges.edges.forEach((edge) => {
            const labbookProxy = store.get(labbookId);

            if (labbookProxy && (edge.node !== null)) {
              const conn = RelayRuntime.ConnectionHandler.getConnection(
                labbookProxy,
                connectionKey,
              );

              const node = store.get(edge.node.id) ? store.get(edge.node.id) : store.create(edge.node.id, 'LabbookFile');

              node.setValue(edge.node.id, 'id');
              node.setValue(edge.node.isDir, 'isDir');
              node.setValue(edge.node.key, 'key');
              node.setValue(edge.node.modifiedAt, 'modifiedAt');
              node.setValue(edge.node.size, 'size');
              const newEdge = RelayRuntime.ConnectionHandler.createEdge(
                store,
                conn,
                node,
                'newLabbookFileEdge',
              );
              RelayRuntime.ConnectionHandler.insertEdgeAfter(
                conn,
                newEdge,
                edge.cursor,
              );
            }
          });
        }
      },

    },
  );
}
