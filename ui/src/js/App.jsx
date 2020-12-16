// @flow
// vendor
import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import queryString from 'querystring';
import { fetchAuthServerState } from 'JS/Auth/AuthHandler';
import { graphql, QueryRenderer } from 'react-relay';
// environment
import environment from 'JS/createRelayEnvironment';
// history
import history from 'JS/history';
// auth
import Auth from 'JS/Auth/Auth';
import stateMachine from 'JS/Auth/AuthStateMachine';
import {
  LOADING,
  ERROR,
  LOGGED_IN,
  LOGGED_OUT,
} from 'JS/Auth/AuthMachineConstants';
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
    availableServers: [],
    errors: [],
    isLoggedIn: null,
    machine: stateMachine.initialState,
  }

  auth = new Auth();

  componentDidMount() {
    const hash = queryString.parse(document.location.hash.slice(1));
    const promise = new Promise((resolve, reject) => fetchAuthServerState(
      resolve,
      reject,
      hash,
      this.auth,
    ));
    promise.then((data) => {
      if (data.isLoggedIn) {
        this.transition(LOGGED_IN, {
          availableServers: data.availableServers,
          isLoggedIn: data.isLoggedIn,
        });
      } else {
        this.transition(LOGGED_OUT, {
          availableServers: data.availableServers,
          isLoggedIn: data.isLoggedIn,
        });
      }
    }).catch((data) => {
      if (data && data.availableServers && (data.availableServers.length > 0)) {
        this.transition(LOGGED_OUT, {
          isLoggedIn: false,
          availableServers: data.availableServers,
          errors: data && data.errors ? data.errors : [],
        });
      } else if (data && data.errors) {
        const errors = (typeof data.errors === 'string')
          ? [{ message: data.errors }]
          : data.errors;
        this.transition(ERROR, {
          errors,
        });
      } else {
        this.transition(ERROR, {
          errors: [{ message: 'There was a problem fetching your data.' }],
        });
      }
    });
  }


  /**
    @param {object} state
    runs actions for the state machine on transition
  */
  runActions = state => {
    if (state.actions.length > 0) {
      state.actions.forEach(f => this[f]());
    }
  };

  /**
    @param {string} eventType
    @param {object} nextState
    sets transition of the state machine
  */
  transition = (eventType, nextState) => {
    const { state } = this;
    const { availableServers, machine } = this.state;

    const newState = stateMachine.transition(machine.value, eventType, {
      state,
    });

    this.runActions(newState);
    // TODO use category / installNeeded

    this.setState({
      machine: newState,
      availableServers: nextState && nextState.availableServers ? nextState.availableServers : availableServers,
      errors: nextState && nextState.errors ? nextState.errors : [],
    });
  };


  render() {
    const {
      availableServers,
      errors,
      isLoggedIn,
      machine,
    } = this.state;


    const renderMap = {
      [LOADING]: (
        <Interstitial
          message="Please wait. Loading server options..."
          messageType="loader"
        />
      ),
      [ERROR]: (
        <Interstitial
          message="There was problem loading app data. Refresh to try again, if the problem persists you may need to restart GigantumClient"
          messageType="error"
        />
      ),
      [LOGGED_IN]: (
        <QueryRenderer
          environment={environment}
          variables={{}}
          query={AppQuery}
          render={({ props, error }) => {
            if (props) {
              return (
                <Routes
                  {...props}
                  auth={this.auth}
                  currentServer={props}
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
      ),
      [LOGGED_OUT]: (
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
              errors={errors}
            />
          </div>
        </Router>
      ),
    };

    return (renderMap[machine.value]);
  }
}

export default App;
