// @flow
// vendor
import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import queryString from 'querystring';
import fetchQuery from 'JS/fetch';
// history
import history from 'JS/history';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// auth
import Auth from 'JS/Auth/Auth';
// assets
import gigantumLogo from 'Images/logos/gigantum-client.svg';
// components
import Loader from 'Components/loader/Loader';
import Login from './pages/login/Login';
import Routes from './pages/Routes';
// css
import './App.scss';


class App extends Component {
  state = {
    isLoggedIn: null,
    availableServers: [],
  }

  auth = new Auth();

  componentDidMount() {
    const overrideHeaders = {};
    const values = queryString.parse(history.location.hash.slice(1));
    const serverId = values.server_id;
    if (serverId) {
      overrideHeaders['GTM-SERVER-ID'] = serverId;
    }
    const apiHost = process.env.NODE_ENV === 'development'
      ? 'localhost:10000'
      : window.location.host;
    fetchQuery(`${window.location.protocol}//${apiHost}${process.env.SERVER_API}`)
      .then(serverResponse => {
        const currentServer = serverResponse.current_server;
        const availableServers = serverResponse.available_servers;
        this.setState({ availableServers });
        const authURL = availableServers.filter((server) => {
          return server.server_id === currentServer;
        })[0].login_url;
        UserIdentity.getUserIdentity(overrideHeaders).then((response) => {
          const expiresAt = JSON.stringify((new Date().getTime() * 1000) + new Date().getTime());
          let isLoggedIn = null;
          if (response.data) {
            if (
              response.data.userIdentity
                && ((response.data.userIdentity.isSessionValid && navigator.onLine)
                || !navigator.onLine)
            ) {
              localStorage.setItem('family_name', response.data.userIdentity.familyName);
              localStorage.setItem('given_name', response.data.userIdentity.givenName);
              localStorage.setItem('email', response.data.userIdentity.email);
              localStorage.setItem('username', response.data.userIdentity.username);
              localStorage.setItem('expires_at', expiresAt);
              isLoggedIn = true;
            } else if (
              (response.data.userIdentity)
              && localStorage.getItem('access_token')
            ) {
              const freshLoginText = localStorage.getItem('fresh_login') ? '&freshLogin=true' : '';
              const loginURL = `${authURL}#route=${window.location.href}${freshLoginText}`;
              window.open(loginURL, '_self');
              isLoggedIn = false;
            } else if (
              !response.data.userIdentity
              && !localStorage.getItem('access_token')
            ) {
              localStorage.removeItem('family_name');
              localStorage.removeItem('given_name');
              localStorage.removeItem('email');
              localStorage.removeItem('username');
              localStorage.removeItem('expires_at');
              localStorage.removeItem('access_token');
              localStorage.removeItem('id_token');
              isLoggedIn = false;
            } else {
              isLoggedIn = false;
            }
          } else {
            isLoggedIn = false;
          }

          this.setState({
            isLoggedIn,
          });
        });
      });
  }


  render() {
    const { availableServers, isLoggedIn } = this.state;

    if (isLoggedIn === false) {
      return (
        <Router history={history} basename={this.basename}>
          <div className="App">
            <header className="App__header">
              <img
                alt="Gigantum"
                width="600"
                src={gigantumLogo}
              />
            </header>
            <Login
              auth={this.auth}
              history={history}
              availableServers={availableServers}
            />
          </div>
        </Router>
      );
    }

    if (isLoggedIn) {
      return (
        <Routes
          auth={this.auth}
          history={history}
          isLoggedIn={isLoggedIn}
        />
      );
    }

    return (
      <div className="App flex flex--column align-items--center">
        <header className="App__header">
          <img
            alt="Gigantum"
            width="600"
            src={gigantumLogo}
          />
        </header>
        <main className="App__loader relative">
          <p>Please wait. Gigantum Client is starting…</p>
        </main>
      </div>
    );
  }
}

export default App;
