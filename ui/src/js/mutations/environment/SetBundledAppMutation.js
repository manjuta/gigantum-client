import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';

const mutation = graphql`
  mutation SetBundledAppMutation($input: SetBundledAppInput!){
    setBundledApp(input: $input){
      environment {
        bundledApps {
          id
          owner
          name
          command,
          appName
          description
          port
        }
      }
    }
  }
`;

let tempID = 0;

export default function SetBundledAppMutation(
  owner,
  labbookName,
  port,
  appName,
  description,
  command,
  callback,
) {
  tempID++;
  const variables = {
    input: {
      owner,
      labbookName,
      port,
      appName,
      description,
      clientMutationId: `${tempID}`,
    },
  };
  if (command) {
    variables.input.command = command;
  }
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
