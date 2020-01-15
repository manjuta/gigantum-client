// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidv4 from 'uuid/v4';
// environment
import environment from 'JS/createRelayEnvironment';
// redux store
import { setErrorMessage } from 'JS/redux/actions/footer';

const mutation = graphql`
  mutation CancelBuildMutation($input: CancelBuildInput!){
    cancelBuild(input: $input){
      buildStopped
      message
    }
  }
`;

export default function CancelBuildMutation(
  owner,
  labbookName,
  callback,
) {
  const variables = {
    input: {
      labbookName,
      owner,
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
          setErrorMessage(owner, labbookName, 'ERROR: Failed to cancel build:', error);
        }

        callback(response, error);
      },
      onError: err => console.error(err),
    },
  );
}
