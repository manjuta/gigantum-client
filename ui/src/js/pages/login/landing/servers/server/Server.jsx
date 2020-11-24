// @flow
// vendor
import React, { Component } from 'react';
// css
import './Server.scss';

type Props = {
  auth: {
    login: Function,
    logout: Function,
  },
  loggingInServerId: string,
  server: {
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
  logout() {
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
      <div className="grid-5 flex flex--column justify--center">
        <button
          className="Btn Server__button"
          disabled={loggingInServerId !== null}
          onClick={() => this.login()}
          type="button"
        >
          {buttonText}
        </button>
      </div>
    );
  }
}

export default Server;
