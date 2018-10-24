// vendor
import { graphql } from 'react-relay';
// mutations
import RemoveUserIdentityMutation from 'Mutations/RemoveUserIdentityMutation';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const sessionCheckQuery = graphql`
  query sessionCheckQuery{
    userIdentity{
      isSessionValid
    }
  }
`;

const UserIdentity = {
  /*
    fetches session information from useridentity field in api
  */
  getUserIdentity: () => new Promise((resolve, reject) => {
    const fetchData = function () {
      fetchQuery(sessionCheckQuery(), {}).then((response, error) => {
        if (response) {
          resolve(response);
        } else {
          reject(response);
        }
      }).catch((error) => {
        reject(error);
      });
    };

    fetchData();
  }),
};

export default UserIdentity;
