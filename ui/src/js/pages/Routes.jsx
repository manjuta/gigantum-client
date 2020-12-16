// @flow
// vendor
import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Loadable from 'react-loadable';
import { connect } from 'react-redux';
import queryString from 'querystring';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'; // keep browser router, reloads page with Router in labbook view
// components
import Dashboard from 'Pages/dashboard/Dashboard';
import Layout from 'JS/layout/Layout';
// history
import history from 'JS/history';
// utils
import getApiURL from 'JS/utils/apiUrl';
// context
import ServerContext from './ServerContext';
// assets
import './Routes.scss';

const Loading = () => <div />;

/* eslint-disable */
const globalObject = window || self;
/* eslint-enable */

const LabbookQueryContainer = Loadable({
  loader: () => import('Pages/repository/labbook/LabbookQueryContainer'),
  loading: Loading,
});

const DatasetQueryContainer = Loadable({
  loader: () => import('Pages/repository/dataset/DatasetQueryContainer'),
  loading: Loading,
});

// getter functions
const getBasename = () => {
  const { pathname } = document.location;
  const pathList = pathname.split('/');
  const uniqueClientString = (pathList.length > 2)
    ? pathList[2]
    : '';
  const basename = (process.env.BUILD_TYPE === 'cloud')
    ? `/run/${uniqueClientString}/`
    : '/';
  return basename;
};


type Props = {
  auth: {
    login: Function,
    logout: Function,
  },
  currentServer: {
    baseUrl: string,
  },
}

class Routes extends Component<Props> {
  state = {
    hasError: false,
    forceLoginScreen: null,
    diskLow: false,
    serverName: '',
  };

  basename = getBasename();

  componentWillMount() {
    const hash = queryString.parse(window.location.hash.slice(1));
    const newPath = hash.path;

    if (newPath) {
      delete hash.path;
      hash.redirect = false;
      let stringifiedValues = queryString.stringify(hash);

      delete hash.redirect;
      stringifiedValues = queryString.stringify(hash);
      const path = decodeURI(newPath)
      history.replace(`/${path}#${stringifiedValues}`);
      document.location.hash = stringifiedValues;
    }

    this._checkSysinfo();
  }


  /**
    Mehtod logs user in using session instance of auth
    @param {} -
  */
  login = () => {
    const { auth } = this.props;
    auth.login();
  }

  /**
    Mehtod logs user out using session instance of auth
    @param {} -
  */
  logout = () => {
    const { auth } = this.props;
    auth.logout();
  }

  /**
    @param {boolean} forceLoginScreen
    sets state of forceloginscreen
  */
  _setForceLoginScreen = (forceLoginScreen) => {
    const { state } = this;
    if (forceLoginScreen !== state.forceLoginScreen) {
      this.setState({ forceLoginScreen });
    }
  }

  /**
    hides disk warning
  */
  _hideDiskWarning = () => {
    window.sessionStorage.setItem('hideDiskWarning', true);
    this.forceUpdate();
  }

  /**
    shows sysinfo header if available size is too small
  */
  _checkSysinfo = () => {
    // TODO move to utils file
    const self = this;
    const apiURL = getApiURL('sysinfo');
    setTimeout(self._checkSysinfo.bind(this), 60 * 1000);
    return fetch(apiURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }).then((response) => {
      if (response.status === 200 && (response.headers.get('content-type') === 'application/json')) {
        response.json().then((res) => {
          const { available, lowDiskWarning } = res.diskGb;
          self.setState({ diskLow: lowDiskWarning, available });
        });
      }
    }).catch(() => false);
  }

  /**
    @param {Error, Object} error, info
    shows error message when runtime error occurs
  */
  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    const {
      auth,
      currentServer,
    } = this.props;
    const { diskLow, hasError, serverName } = this.state;
    const showDiskLow = diskLow && !window.sessionStorage.getItem('hideDiskWarning');
    if (!hasError) {
      return (
        <ServerContext.Provider value={currentServer}>
          <Router
            basename={this.basename}
          >
            <Layout
              {...this.props}
              auth={auth}
              diskLow={showDiskLow}
            >

              <Switch>

                <Route
                  exact
                  path={[
                    '/',
                    '/datasets/:labbookSection',
                    '/projects/:labbookSection',
                  ]}
                  render={parentProps => (
                    <Dashboard
                      {...this.props}
                      {...parentProps}
                      auth={auth}
                      diskLow={showDiskLow}
                      serverName={serverName}
                    />
                  )}
                />

                <Route
                  exact
                  path={[
                    '/labbooks/:section',
                    '/:id',
                  ]}
                  render={() => <Redirect to="/projects/local" />}
                />

                <Route
                  path="/datasets/:owner/:datasetName"
                  auth={auth}
                  render={(parentProps) => (
                    <DatasetQueryContainer
                      {...this.props}
                      {...parentProps}
                      auth={auth}
                      datasetName={parentProps.match.params.datasetName}
                      diskLow={showDiskLow}
                      owner={parentProps.match.params.owner}
                      serverName={serverName}
                    />
                  )}
                />

                <Route
                  path="/projects/:owner/:labbookName"
                  auth={auth}
                  render={(parentProps) => (
                    <LabbookQueryContainer
                      {...this.props}
                      {...parentProps}
                      auth={auth}
                      diskLow={showDiskLow}
                      labbookName={parentProps.match.params.labbookName}
                      owner={parentProps.match.params.owner}
                      serverName={serverName}
                    />
                  )}
                />
              </Switch>
            </Layout>
          </Router>
        </ServerContext.Provider>
      );
    }

    return (
      <div className="Routes__error">
        <p>An error has occured. Please try refreshing the page.</p>
      </div>
    );
  }
}

const RoutesFragement = createFragmentContainer(
  Routes,
  {
    currentServer: graphql`
      fragment Routes_currentServer on LabbookQuery {
        currentServer {
          authConfig {
            audience
            id
            issuer
            loginType
            loginUrl
            logoutUrl
            publicKeyUrl
            serverId
            signingAlgorithm
            typeSpecificFields {
              id
              parameter
              serverId
              value
            }
          }
          baseUrl
          gitServerType
          gitUrl
          hubApiUrl
          id
          lfsEnabled
          name
          objectServiceUrl
          serverId
          userSearchUrl
        }
      }
    `,
  },
);

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.routes,
    ...ownProps,
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(RoutesFragement);
