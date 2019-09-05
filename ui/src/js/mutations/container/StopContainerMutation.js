// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidv4 from 'uuid/v4';
// environment
import environment from 'JS/createRelayEnvironment';
// redux
import { updateTransitionState } from 'JS/redux/actions/labbook/labbook';


const mutation = graphql`
  mutation StopContainerMutation($input: StopContainerInput!){
    stopContainer(input: $input){
      clientMutationId
    }
  }
`;

export default function StopContainerMutation(
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
        }
        callback(response, error);
      },
      onError: err => console.error(err),
    },
  );
}
