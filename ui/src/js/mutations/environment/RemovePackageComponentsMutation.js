// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import RelayRuntime from 'relay-runtime';
import uuidv4 from 'uuid/v4';
// environment
import environment from 'JS/createRelayEnvironment';
// redux store
import { setErrorMessage } from 'JS/redux/actions/footer';

const mutation = graphql`
  mutation RemovePackageComponentsMutation($input: RemovePackageComponentsInput!){
    removePackageComponents(input: $input){
      success
      clientMutationId
    }
  }
`;

function sharedUpdater(store, parentID, deletedIdArr, connectionKey) {
  const environmentProxy = store.get(parentID);
  if (environmentProxy) {
    deletedIdArr.forEach((deleteId) => {
      const conn = RelayRuntime.ConnectionHandler.getConnection(
        environmentProxy,
        connectionKey,
      );

      if (conn) {
        RelayRuntime.ConnectionHandler.deleteNode(
          conn,
          deleteId,
        );
        store.delete(deleteId);
      }
    });
  }
}

export default function RemovePackageComponentsMutation(
  labbookName,
  owner,
  environmentId,
  manager,
  packages,
  packageIDArr,
  callback,
) {
  const config = packageIDArr.map(id => ({
    type: 'NODE_DELETE',
    deletedIDFieldName: id,
  }));


  const variables = {
    input: {
      labbookName,
      owner,
      manager,
      packages,
      clientMutationId: uuidv4(),
    },
  };
  commitMutation(
    environment,
    {
      mutation,
      variables,
      config,
      onCompleted: (response, error) => {
        if (error) {
          setErrorMessage(owner, labbookName, 'ERROR: Packages failed to delete', error);
        }
        callback(response, error);
      },
      onError: err => console.error(err),
      updater: (store) => {
        sharedUpdater(store, environmentId, packageIDArr, 'Packages_packageDependencies');
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, environmentId, packageIDArr, 'Packages_packageDependencies');
      },
    },
  );
}
