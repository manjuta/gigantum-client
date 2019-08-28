// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidv4 from 'uuid/v4';
// environment
import environment from 'JS/createRelayEnvironment';


const mutation = graphql`
  mutation StartContainerMutation($input: StartContainerInput!){
    startContainer(input: $input){
      clientMutationId
    }
  }
`;

export default function StartContainerMutation(
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
