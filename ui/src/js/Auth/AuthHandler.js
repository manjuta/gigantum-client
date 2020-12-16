// queries
import UserIdentity from 'JS/Auth/UserIdentity';
import fetchQuery from 'JS/fetch';
/**
* Method gets returns a promise that resolves if a user is logged in or not
* @param {string} serverId
* @param {string} loginUrl
* @param {object} auth
*
* @return {Promise}
*/
const getIsLoggedIn = (serverId, loginUrl, auth) => {
  const overrideHeaders = {
    ...((typeof serverId === 'string') ? { 'GTM-SERVER-ID': serverId } : undefined),
  };
  const promise = new Promise((resolve) => {
    UserIdentity.getUserIdentity(overrideHeaders).then((response) => {
      const accessToken = localStorage.getItem('access_token');
      if (response.data) {
        const { userIdentity } = response.data;
        if (
          userIdentity
          && ((userIdentity.isSessionValid && navigator.onLine) || !navigator.onLine)
        ) {
          // user has a valid session and session will be set
          auth.setSession(userIdentity);

          resolve({ isLoggedIn: true, response });
        } else if (userIdentity && accessToken) {
          // if user has invalid session but has an identify and has a access token try auto login
          const freshLoginText = localStorage.getItem('fresh_login') ? '&freshLogin=true' : '';
          const loginURL = `${loginUrl}#route=${window.location.href}${freshLoginText}&serverId=${serverId}`;

          window.open(loginURL, '_self');

          resolve({ isLoggedIn: false, response });
        } else if (!userIdentity && !accessToken) {
          // user does not have a valid identify or token, log user out and clear storage
          auth.resetSession();

          resolve({ isLoggedIn: false, response });
        } else {
          // invalid identity
          resolve({ isLoggedIn: false, response });
        }
      } else {
        // no data returned from userIdentity query
        resolve({ isLoggedIn: false, response });
      }
    });
  });

  return promise;
};

/**
* Method Initiates token exchange if a hash state is present
* if a error is present then the cycle is rejected and the error is displayed
* if none of the above then a login cycle is attempted.
* @param {Function} resolve
* @param {Function} reject
* @param {Object} hash
* @param {string} apiHost
* @param {Object} auth
* @param {Array} availableServers
* @param {string} currentServer
*/
const getTokens = (
  resolve,
  reject,
  hash,
  apiHost,
  auth,
  availableServers,
  currentServer,
) => {
  const currentServerConfig = availableServers.filter((server) => (
    server.server_id === currentServer
  ))[0];
  const loginUrl = currentServerConfig.login_url;

  if (hash.state) {
    const apiUrl = `${window.location.protocol}//${apiHost}/api/server`;
    const tokenUrl = `${apiUrl}/${hash.serverId}/exchange/${hash.state}`;

    // fetch tokens and write to local storage
    fetchQuery(tokenUrl).then(tokenResponse => {
      localStorage.setItem('access_token', tokenResponse.AccessToken);
      localStorage.setItem('id_token', tokenResponse.IDToken);

      // check if user is logged in, calls user idenity query and initiates backend
      getIsLoggedIn(
        hash.serverId,
        loginUrl,
        auth,
      ).then((data) => {
        if (data.response && data.response.errors && (data.response.errors.length > 0)) {
          reject({ isLoggedIn: data.isLoggedIn, availableServers, errors: data.response.errors });
        } else {
          resolve({ isLoggedIn: data.isLoggedIn, availableServers });
        }
      });
    });
  } else if (hash.error) {
    reject({
      isLoggedIn: false,
      availableServers,
      errors: [{
        message: decodeURI(hash.error),
        admin: decodeURI(hash.admin),
      }],
    });
  } else {
    // check if user is logged in, calls user idenity query and initiates backend
    getIsLoggedIn(
      currentServer,
      loginUrl,
      auth,
    ).then((data) => {
      resolve({ isLoggedIn: data.isLoggedIn, availableServers });
    });
  }
};


/**
* Method gets returns a promise that resolves if a user is logged in or not
* @param {function} resolve
* @param {function} reject
* @param {object} hash
* @param {object} auth
*
* @return {Promise}
*/
const fetchAuthServerState = (
  resolve,
  reject,
  hash,
  auth,
) => {
  const apiHost = process.env.NODE_ENV === 'development'
    ? 'localhost:10000'
    : window.location.host;
  // fetch current server and available servers
  fetchQuery(
    `${window.location.protocol}//${apiHost}${process.env.SERVER_API}`,
  ).then(serverResponse => {
    const currentServer = serverResponse.current_server;
    const availableServers = serverResponse.available_servers;

    if (availableServers === undefined) {
      reject();
    } else {
      getTokens(
        resolve,
        reject,
        hash,
        apiHost,
        auth,
        availableServers,
        currentServer,
      );
    }
  });
};


export {
  getIsLoggedIn,
  fetchAuthServerState,
};


export default fetchAuthServerState;
