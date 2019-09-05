// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidv4 from 'uuid/v4';
// environment
import environment from 'JS/createRelayEnvironment';

const mutation = graphql`
  mutation DeleteSecretsFileMutation($input: DeleteSecretsFileInput!){
    deleteSecretsFile(input: $input){
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

export default function DeleteSecretsFileMutation(
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
    },
  );
}
