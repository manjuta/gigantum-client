// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import RelayRuntime from 'relay-runtime';
import uuidv4 from 'uuid/v4';
// redux store
import { setErrorMessage } from 'JS/redux/actions/footer';

let tempID = 0;
const mutation = graphql`
  mutation AddPackageComponentsMutation($input: AddPackageComponentsInput!){
    addPackageComponents(input: $input){
      newPackageComponentEdges{
        node{
          id
          schema
          manager
          package
          version
          fromBase
        }
      }
      clientMutationId
    }
  }
`;

/**
  @param {object, string, object} store,id,newEdge
  gets a connection to the store and insets an edge if connection is Successful
*/
function sharedUpdater(store, id, newEdge) {
  const labbookProxy = store.get(id);
  if (labbookProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      'Packages_packageDependencies',
      [],
    );

    if (conn) {
      RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge);
    }
  }
}

function sharedDeleteUpdater(store, parentID, deletedId) {
  const labbookProxy = store.get(parentID);
  if (labbookProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      'Packages_packageDependencies',
    );

    if (conn) {
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deletedId,
      );
    }
  }
}

function sharedDeleter(store, parentID, duplicates, connectionKey) {
  const environmentProxy = store.get(parentID);
  if (environmentProxy) {
    duplicates.forEach((duplicatePackage) => {
      const conn = RelayRuntime.ConnectionHandler.getConnection(
        environmentProxy,
        connectionKey,
      );
      if (conn) {
        RelayRuntime.ConnectionHandler.deleteNode(
          conn,
          duplicatePackage.id,
        );
        store.delete(duplicatePackage.id);
      }
    });
  }
}

let clientMutationId = tempID;
export default function AddPackageComponentsMutation(
  labbookName,
  owner,
  environmentId,
  packages,
  addPackageObject,
  duplicates,
  callback,
) {
  const variables = {
    input: {
      labbookName,
      owner,
      packages,
      clientMutationId: clientMutationId += 1,
    },
  };

  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
          setErrorMessage(owner, labbookName, 'ERROR: Packages failed to delete', error);
        }
        callback(response, error);
      },
      onError: err => console.error(err),
      updater: (store, response) => {
        if (response.addPackageComponents && response.addPackageComponents.newPackageComponentEdges
          && response.addPackageComponents.newPackageComponentEdges.length && clientMutationId) {
          const deletedId = `client:newPackageManager:${tempID}`;
          const newEdges = response.addPackageComponents.newPackageComponentEdges;

          sharedDeleteUpdater(store, environmentId, deletedId);

          newEdges.forEach((edge) => {
            const {
              fromBase, id, manager, schema, version,
            } = edge.node;
            const pkg = edge.node.package;
            store.delete(id);
            const node = store.get(id) ? store.get(id) : store.create(id, 'package');
            if (node) {
              const { description, latestVersion } = addPackageObject[manager][pkg];
              node.setValue(manager, 'manager');
              node.setValue(pkg, 'package');
              node.setValue(version, 'version');
              node.setValue(schema, 'schema');
              node.setValue(fromBase, 'fromBase');
              node.setValue(latestVersion, 'latestVersion');
              node.setValue(description, 'description');
              node.setValue(id, 'id');
              tempID += 1;
              const newEdge = store.create(
                `client:newEdge:${tempID}`,
                'PackageComponentEdge',
              );

              newEdge.setLinkedRecord(node, 'node');

              sharedDeleter(store, environmentId, duplicates, 'Packages_packageDependencies');
              sharedUpdater(store, environmentId, newEdge);
            }
          });
        }
      },
      optimisticUpdater: (store) => {
        if (clientMutationId) {
          tempID += 1;
          const id = `client:newPackageManager:${tempID}`;
          const node = store.create(id, 'PackageManager');
          packages.forEach((item) => {
            const { manager, version } = item;
            const pkg = item.package;
            const { description, latestVersion } = addPackageObject[manager][pkg];
            const tempId = uuidv4();

            node.setValue(manager, 'manager');
            node.setValue(pkg, 'package');
            node.setValue(tempId, 'id');
            node.setValue(version, 'version');
            node.setValue(labbookName, 'labbookName');
            node.setValue(owner, 'owner');
            node.setValue(latestVersion, 'latestVersion');
            node.setValue(description, 'description');
          });


          const newEdge = store.create(
            `client:newEdge:${tempID}`,
            'PackageComponentEdge',
          );
          if (newEdge) {
            newEdge.setLinkedRecord(node, 'node');
          }
          sharedDeleter(store, environmentId, duplicates, 'Packages_packageDependencies');
          sharedUpdater(store, environmentId, newEdge);

          const labbookProxy = store.get(environmentId);
          if (labbookProxy) {
            labbookProxy.setValue(
              labbookProxy.getValue('first') + 1,
              'first',
            );
          }
        }
      },
    },
  );
}
