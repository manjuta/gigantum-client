import history from 'JS/history';
import RemoveUserIdentityMutation from 'Mutations/user/RemoveUserIdentityMutation';
// queries
import SessionCheck from 'JS/Auth/sessionCheck';
// store
import { setLogout } from 'JS/redux/actions/login';

const basename = '';

export default class Auth {
  /**
   * Reroutes to login screen
  */
  renewToken = (server, hash) => {
    const loginUrl = server.authConfig;
    const url = hash ? `${loginUrl}${hash}` : loginUrl;
    window.open(url, '_self');
  }

  login = (server, hash) => {
    setLogout(false);
    const loginUrl = server.login_url;
    const url = hash ? `${loginUrl}${hash}` : loginUrl;
    window.open(url, '_self');
  }

  setSession = (authResult, silent, forceHistory) => {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('family_name', authResult.idTokenPayload.family_name);
    localStorage.setItem('given_name', authResult.idTokenPayload.given_name);
    localStorage.setItem('email', authResult.idTokenPayload.email);
    localStorage.setItem('username', authResult.idTokenPayload.nickname);
    // redirect to labbooks when user logs in
    let route = window.sessionStorage.getItem('CALLBACK_ROUTE')
      ? window.sessionStorage.getItem('CALLBACK_ROUTE')
      : '/projects';

    route = route === ''
      ? '/projects'
      : route;

    if (!silent || forceHistory) {
      history.replace(`${basename}${route}`);
    }
  }

  logout = () => {
    setLogout(true);
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

      history.replace(`${basename}/`);
      window.location.reload();
    });
  }

  // Check whether the current time is past the
  // access token's expiry time
  isAuthenticated = () => SessionCheck.getUserIdentity().then(
    response => response && response.data
      && response.data.userIdentity
      && response.data.userIdentity.isSessionValid,
  );
}
