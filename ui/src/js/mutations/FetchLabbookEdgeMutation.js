import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';


const mutation = graphql`
mutation FetchLabbookEdgeMutation($input: FetchLabbookEdgeInput!, $first: Int!, $cursor: String,){
    fetchLabbookEdge(input: $input){
        newLabbookEdge{
            node{
                owner
                name
                branches {
                  id
                  owner
                  name
                  branchName
                  isActive
                  isLocal
                  isRemote
                }
                collaborators {
                  id
                  owner
                  name
                  collaboratorUsername
                  permission
                }
                canManageCollaborators,
                visibility,
                defaultRemote
                ...Code_labbook
                ...Input_labbook
                ...Output_labbook
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
    first: 10,
    cursor: null,
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
