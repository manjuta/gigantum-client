// vendor
import { graphql } from 'react-relay';
// mutations
import RemoveUserIdentityMutation from 'Mutations/user/RemoveUserIdentityMutation';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const userIdentityQuery = graphql`
  query UserIdentityQuery{
    userIdentity{
      id
      username
      email
      givenName
      familyName
      isSessionValid
    }
  }
`;

const UserIdentity = {
  getUserIdentity: (overrideHeaders = {}) => new Promise((resolve, reject) => {
    const fetchData = () => {
      fetchQuery(
        userIdentityQuery,
        {},
        { force: true },
        null,
        overrideHeaders,
      ).then((response, error) => {
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
  removeUserIdentity: () => {
    RemoveUserIdentityMutation(() => {});
  },

};

export default UserIdentity;
