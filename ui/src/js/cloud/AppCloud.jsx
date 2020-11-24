// @flow
// vendor
import React, { Component } from 'react';
import queryString from 'querystring';
import { graphql, QueryRenderer } from 'react-relay';
// environment
import environment from 'JS/createRelayEnvironment';
// fetch
import fetchQuery from 'JS/fetch';
// auth
import Auth from 'JS/Auth/Auth';
import { getIsLoggedIn } from 'JS/Auth/AuthHandler';
import stateMachine from 'JS/Auth/AuthStateMachine';
import {
  LOADING,
  ERROR,
  LOGGED_IN,
} from 'JS/Auth/AuthMachineConstants';
// components
import Routes from 'Pages/Routes';
import Interstitial from 'Components/interstitial/Interstitial';
// utilities
import apiURL from 'JS/utils/apiUrl';
// css
import '../App.scss';

const AppCloudQuery = graphql`
  query AppCloudQuery {
    ...Routes_currentServer
  }
`;

class App extends Component {
  state = {
    availableServers: [],
    isLoggedIn: null,
    machine: stateMachine.initialState,
  }

  auth = new Auth();

  componentDidMount() {
    const serverUrl = apiURL('server');
    fetchQuery(
      serverUrl,
    ).then(serverResponse => {
      const currentServer = serverResponse.current_server;

      if (currentServer) {
        getIsLoggedIn(
          currentServer,
          '',
          this.auth,
        ).then((data) => {
          if (data.response) {
            this.transition(LOGGED_IN);
          } else {
            this.transition(ERROR);
          }
        }).catch((error) => {
          this.transition(ERROR);
        });
      } else {
        this.transition(ERROR);
      }
    })
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
    const { machine } = this.state;

    const newState = stateMachine.transition(machine.value, eventType, {
      state,
    });

    this.runActions(newState);
    // TODO use category / installNeeded

    this.setState({
      machine: newState,
    });
  };


  render() {
    const {
      isLoggedIn,
      machine,
    } = this.state;


    const renderMap = {
      [LOADING]: (
        <Interstitial
          message="Please wait. Gigantum Client is starting…"
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
          query={AppCloudQuery}
          render={({ props, error }) => {
            if (props) {
              const { pathname } = document.location;
              const pathList = pathname ? pathname.split('/') : '';
              return (
                <Routes
                  {...props}
                  auth={this.auth}
                  currentServer={props}
                  isLoggedIn={isLoggedIn}
                  pathname={pathname}
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
    };

    return (renderMap[machine.value]);
  }
}

export default App;
