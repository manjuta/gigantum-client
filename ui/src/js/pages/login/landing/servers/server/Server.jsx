// @flow
// vendor
import React, { Component } from 'react';
// components
import ReactTooltip from 'react-tooltip';
// css
import './Server.scss';

type Props = {
  auth: {
    login: Function,
    logout: Function,
  },
  loggingInServerId: string,
  server: {
    backup_in_progress: string,
    name: string,
    login_url: string,
    server_id: string,
  },
  setLoggingInServerId: string,
}

class Server extends Component<Props> {
  /**
    Mehtod logs user in using session instance of auth
    @param {} -
  */
  login = () => {
    const { auth, server, setLoggingInServerId } = this.props;
    const serverId = server.server_id;
    const freshLoginText = localStorage.getItem('fresh_login') ? '&freshLogin=true' : '';
    const hash = `#route=${window.location.origin}${freshLoginText}&serverId=${serverId}`;
    setLoggingInServerId(serverId);
    auth.login(server, hash);
  }

  /**
    Mehtod logs user out using session instance of auth
    @param {} -
  */
  logout = () => {
    const { auth } = this.props;
    auth.logout();
  }

  render() {
    const {
      loggingInServerId,
      server,
    } = this.props;
    const {
      name,
    } = server;
    const serverId = server.server_id;
    const buttonText = serverId === loggingInServerId
      ? 'Please wait'
      : name;
    return (
      <div className="Server grid-5 flex flex--column justify--center">
        <button
          className="Btn Server__button flex justify--center"
          disabled={(loggingInServerId !== null) || server.backup_in_progress}
          onClick={() => this.login()}
          type="button"
        >
          {buttonText}
          { server.backup_in_progress && (
            <>
              <button
                className="Server__button-icon"
                data-tip="Backup is in progess, and the remote server is unavailable untill the backup has been complete. Backing up your data is neccesary to avoid loss of data. This process can take between 15 mins to an hour, but can take longer."
                data-for="tooltip-server"
              />
              <ReactTooltip
                delayShow={100}
                id="tooltip-server"
                place="bottom"
              />
            </>
          )}
        </button>
      </div>
    );
  }
}

export default Server;
