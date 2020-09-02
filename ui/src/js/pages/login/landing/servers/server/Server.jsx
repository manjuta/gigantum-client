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
  server: {
    name: string,
    login_url: string,
    server_id: string,
  }
}

class Server extends Component<Props> {
  /**
    @param {}
    login through Auth0
  */
  login = () => {
    const { auth, server } = this.props;
    const serverId = server.server_id;
    const freshLoginText = localStorage.getItem('fresh_login') ? '&freshLogin=true' : '';
    const hash = `#route=${window.location.origin}${freshLoginText}&serverId=${serverId}`;
    auth.login(server, hash);
  }

  /**
    @param {}
    logout through Auth0
  */
  logout() {
    const { auth } = this.props;
    auth.logout();
  }

  render() {
    const {
      loadingRenew,
      loginURL,
      server,
    } = this.props;
    const {
      name,
    } = server
    return (
      <div className="grid-5 flex flex--column justify--center">
        { loadingRenew
          ? (
            <button
              type="button"
              disabled
              className="Server__button--loading"
            >
              Logging In
              <div className="Code__loading" />
            </button>
          )
          : (
            <a
              href={loginURL}
              className="Btn Server__button"
              onClick={() => this.login()}
            >
              {name}
            </a>
          )
        }
      </div>
    );
  }
}

export default Server;
