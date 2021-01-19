// environment
import environment from 'JS/createRelayEnvironment';
// mutations
import { updateCurrentServer } from 'Mutations/localCommits/CurrentServer';
// utils
import { pollForServerAvalability } from './currentServerStatus';

/**
  Mehtod logs user in using session instance of auth
  @param {} -
*/
const checkBackupMode = () => {
  const callback = (currentServer, error) => {
    const { backupInProgress, id } = currentServer;
    console.log(currentServer);
    updateCurrentServer(id, backupInProgress, environment);
  };

  pollForServerAvalability(callback);
};

export {
  checkBackupMode,
};

export default {
  checkBackupMode,
};
