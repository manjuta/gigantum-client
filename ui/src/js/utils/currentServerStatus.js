// vendor
import { graphql } from 'react-relay';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const currentServerStatusQuery = graphql`
  query currentServerStatusQuery {
    currentServer {
      id
      serverId
      name
      baseUrl
      backupInProgress
    }
  }
`;

/**
* Method returns a promise that resolves or rejects the currentServerStatusQuery
* @param {None}
* @return {Promise}
*/
const getCurrentServerStatus = () => (
  new Promise((resolve, reject) => {
    const fetchData = () => {
      fetchQuery(
        currentServerStatusQuery,
        {}, // empty variables
        { force: true },
      ).then((response) => {
        resolve(response);
      }).catch((error) => {
        console.log(error);
        reject(error);
      });
    };

    fetchData();
  })
);

/**
* Method polls for backupInProgress status every 5 seconds.
* callback returns backupInProgress status when value is true
* @param {Function} callback
*
*/
const pollForServerAvalability = (callback, count = 1) => {
  const promise = getCurrentServerStatus();

  promise.then((response) => {
    if ((count % 5) === 0) {
      callback(response.data.currentServer, null);
    } else {
      callback(response.data.currentServer, null);
    }

    count++;
    if (
      response.data && response.data.currentServer
      && !response.data.currentServer.backupInProgress
    ) {
      callback(response.data.currentServer, null);
    } else {
      setTimeout(() => {
        pollForServerAvalability(callback, count);
      }, 5000);
    }
  }).catch(error => {
    callback(false, error);
  });
};


const currentServerUtils = {
  getCurrentServerStatus,
  pollForServerAvalability,
};

export {
  getCurrentServerStatus,
  pollForServerAvalability,
};

export default currentServerUtils;
