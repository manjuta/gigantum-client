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

function sharedDeleteUpdater(store, labbookID, deletedID, connectionKey) {
  console.log(deletedID, 'IN DELETEUPDATER')
  const labbookProxy = store.get(labbookID);
  if (labbookProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      connectionKey,
    );

    if (conn) {
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deletedID,
      );
    }
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
  commitMutation(
    environment,
    {
      mutation,
      variables,
      configs: [{
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
      }],
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
          setErrorMessage(`ERROR: Could not Move labbook file ${srcPath}`, error);
        }
        callback(response, error);
      },
      onError: err => console.error(err),
      optimisticUpdater: (store, response) => {
        // sharedDeleteUpdater(store, labbookId, edge.node.id, connectionKey);
        // sharedDeleteUpdater(store, labbookId, edge.node.id, recentConnectionKey);
        // if (response && response.moveLabbookFile.updatedEdges.edges) {
        //   response.moveLabbookFile.updatedEdges.edges.forEach((edge) => {
        //     const labbookProxy = store.get(labbookId);
        //     if (labbookProxy) {
        //       const conn = RelayRuntime.ConnectionHandler.getConnection(
        //         labbookProxy,
        //         connectionKey,
        //       );
        //       const nodeExists = store.get(edge.node.id);
        //       store.delete(edge.node.id);
        //       console.log(nodeExists)
        //       if (!nodeExists) {
        //         const node = store.create(edge.node.id, 'MoveFile');
        //         node.setValue(edge.node.id, 'id');
        //         node.setValue(edge.node.isDir, 'isDir');
        //         node.setValue(edge.node.key, 'key');
        //         node.setValue(edge.node.modifiedAt, 'modifiedAt');
        //         node.setValue(edge.node.size, 'size');
        //         console.log(node)
        //         const newEdge = RelayRuntime.ConnectionHandler.createEdge(
        //           store,
        //           conn,
        //           node,
        //           'newLabbookFileEdge',
        //         );
        //         RelayRuntime.ConnectionHandler.insertEdgeAfter(
        //           conn,
        //           newEdge,
        //         );
        //       }
        //     }
        //   });
        // }
      },
      updater: (store, response) => {
        sharedDeleteUpdater(store, labbookId, edge.node.id, connectionKey);
        sharedDeleteUpdater(store, labbookId, edge.node.id, recentConnectionKey);
        if (response && response.moveLabbookFile.updatedEdges.edges) {
          response.moveLabbookFile.updatedEdges.edges.forEach((edge) => {
            const labbookProxy = store.get(labbookId);
            if (labbookProxy) {
              const conn = RelayRuntime.ConnectionHandler.getConnection(
                labbookProxy,
                connectionKey,
              );
              const nodeExists = store.get(edge.node.id);
              store.delete(edge.node.id)
              sharedDeleteUpdater(store, labbookId, edge.node.id, connectionKey);
              sharedDeleteUpdater(store, labbookId, edge.node.id, recentConnectionKey);
              const node = store.create(edge.node.id, 'MoveFile');
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
