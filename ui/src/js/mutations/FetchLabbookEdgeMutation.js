import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';


const mutation = graphql`
mutation FetchLabbookEdgeMutation($input: FetchLabbookEdgeInput!){
    fetchLabbookEdge(input: $input){
        newLabbookEdge{
            node{
                owner
                name
                collaborators,
                canManageCollaborators,
                visibility,
                defaultRemote
            }
        }
        clientMutationId
    }
}
`;

let tempID = 0;


export default function FetchLabbookEdgeMutation(
  owner,
  labbookName,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
    },
  };
  commitMutation(environment, {
    mutation,
    variables,
    onCompleted: (response, error) => {
      if (error) {
        console.log(error);
      }
      callback(error);
    },
    onError: err => console.error(err),
  });
}
