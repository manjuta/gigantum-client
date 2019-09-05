// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidv4 from 'uuid/v4';
// environment
import environment from 'JS/createRelayEnvironment';

const mutation = graphql`
  mutation StartDevToolMutation($input: StartDevToolInput!){
    startDevTool(input: $input){
      path
      clientMutationId
    }
  }
`;

export default function AddEnvironmentPackageMutation(
  owner,
  labbookName,
  devTool,
  callback,
) {
  const variables = {
    input: {
      labbookName,
      owner,
      devTool,
      containerOverrideId: null,
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
