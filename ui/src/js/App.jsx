// @flow
// vendor
import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import queryString from 'querystring';
import fetchQuery from 'JS/fetch';
import { graphql, QueryRenderer } from 'react-relay';
// environment
import environment from 'JS/createRelayEnvironment';
// history
import history from 'JS/history';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// auth
import Auth from 'JS/Auth/Auth';
// assets
import gigantumLogo from 'Images/logos/gigantum-client.svg';
// components
import Login from 'Pages/login/Login';
import Routes from 'Pages/Routes';
import Interstitial from 'Components/interstitial/Interstitial';
// css
import './App.scss';


const AppQuery = graphql`
  query AppQuery {
    ...Routes_currentServer
  }
`;


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
                width="515"
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
        <QueryRenderer
          environment={environment}
          variables={{}}
          query={AppQuery}
          render={({ props, error }) => {
            if (props) {
              return (
                <Routes
                  {...props}
                  currentServer={props}
                  auth={this.auth}
                  history={history}
                  isLoggedIn={isLoggedIn}
                />
              );
            }

            if (error) {
              return (
                <Interstitial
                  message="There was problem loading app data. Refresh to try again, if the problem persists you may need to restart GigantumClient"
                  messageType="error"
                />
              );
            }


            return (
              <Interstitial
                message="Please wait. Gigantum Client is starting…"
                messageType="loader"
              />
            );
          }}
        />
      );
    }

    return (
      <Interstitial />
    );
  }
}

export default App;
