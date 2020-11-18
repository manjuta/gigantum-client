// mutations
import RemoveUserIdentityMutation from 'Mutations/user/RemoveUserIdentityMutation';
// queries
import SessionCheck from 'JS/Auth/sessionCheck';
// store
import { setLogout } from 'JS/redux/actions/login';

class Auth {
  /**
   * Method reroutes to login screen
   * @param {object} server
   * @param {string} hash
  */
  renewToken = (server, hash) => {
    const loginUrl = server.authConfig;
    const url = hash ? `${loginUrl}${hash}` : loginUrl;
    window.open(url, '_self');
  }

  /**
   * Method logs user in and reroutes
   * @param {object} server
   * @param {string} hash
  */
  login = (server, hash) => {
    const loginUrl = server.login_url;
    const url = hash ? `${loginUrl}${hash}` : loginUrl;
    setLogout(false);

    RemoveUserIdentityMutation(() => {
      // redirect to root when user logs out
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('family_name');
      localStorage.removeItem('given_name');
      localStorage.removeItem('email');
      localStorage.removeItem('username');
      window.sessionStorage.removeItem('CALLBACK_ROUTE');
      window.open(url, '_self');
    });
  }

  /**
   * Method sets user session in local storage
   * @param {object} userIdentity
  */
  setSession = (userIdentity) => {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((new Date().getTime() * 1000) + new Date().getTime());
    localStorage.setItem('family_name', userIdentity.familyName);
    localStorage.setItem('given_name', userIdentity.givenName);
    localStorage.setItem('email', userIdentity.email);
    localStorage.setItem('username', userIdentity.username);
    localStorage.setItem('expires_at', expiresAt);
  }

  /**
   * Method sets resets session in local storage by remove session variables
   * @param {object} userIdentity
  */
  resetSession = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('family_name');
    localStorage.removeItem('given_name');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
  }

  /**
   * Method sets revokes indentity
   * Then removes all session variables
   * Then reloads the application
  */
  logout = (currentServer) => {
    setLogout(true);
    RemoveUserIdentityMutation(() => {
      const { origin } = window.location;
      const hash = `#route=${origin}`;
      const { logoutUrl } = currentServer.authConfig;
      const url = `${logoutUrl}${hash}`;
      // redirect to root when user logs out
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('family_name');
      localStorage.removeItem('given_name');
      localStorage.removeItem('email');
      localStorage.removeItem('username');
      window.sessionStorage.removeItem('CALLBACK_ROUTE');
      window.open(url, '_self');
    });
  }

  /**
   * Method checks whether the current time is past the
   * access token's expiry time
  */
  isAuthenticated = () => SessionCheck.getUserIdentity().then(
    response => response && response.data
      && response.data.userIdentity
      && response.data.userIdentity.isSessionValid,
  );
}

export default Auth;
