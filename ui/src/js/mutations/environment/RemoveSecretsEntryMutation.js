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
  mutation RemoveSecretsEntryMutation($input: RemoveSecretsEntryInput!){
    removeSecretsEntry(input: $input){
      environment {
        secretsFileMapping {
          edges {
            node {
              id
              owner
              name
              filename
              mountPath
              isPresent
            }
          }
        }
      }
    }
  }
`;

function sharedUpdater(store, parentID, deleteId) {
  const environmentProxy = store.get(parentID);
  if (environmentProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      environmentProxy,
      'Secrets_secretsFileMapping',
      [],
    );

    if (conn) {
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deleteId,
      );

      store.delete(deleteId);
    }
  }
}

export default function RemoveSecretsEntryMutation(
  owner,
  labbookName,
  environmentId,
  id,
  filename,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      filename,
      clientMutationId: uuidv4(),
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
        }
        callback(response, error);
      },
      onError: err => console.error(err),

      updater: (store) => {
        sharedUpdater(store, environmentId, id);
      },
    },
  );
}
