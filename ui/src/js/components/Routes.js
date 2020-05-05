// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import Loadable from 'react-loadable';
import queryString from 'querystring';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom'; // keep browser router, reloads page with Router in labbook view
// history
import history from 'JS/history';
// components
import SideBar from 'Components/common/SideBar';
import Footer from 'Components/common/footer/Footer';
import Prompt from 'Components/common/Prompt';
import DiskHeader from 'Components/common/DiskHeader';
import Helper from 'Components/common/Helper';
// auth
import UserIdentity from 'JS/Auth/UserIdentity';
import Auth from 'JS/Auth/Auth';
// utils
import getApiURL from 'JS/utils/apiUrl';
// assets
import './Routes.scss';

const Loading = () => <div />;
const auth = new Auth();

/* eslint-disable */
const globalObject = window || self;
/* eslint-enable */

// Loadables
const Home = Loadable({
  loader: () => import('Components/home/Home'),
  loading: Loading,
});

const LabbookQueryContainer = Loadable({
  loader: () => import('Components/labbook/LabbookQueryContainer'),
  loading: Loading,
});

const DatasetQueryContainer = Loadable({
  loader: () => import('Components/dataset/DatasetQueryContainer'),
  loading: Loading,
});

// getter functions
const getBasename = () => {
  const { pathname } = globalObject.location;
  const pathList = pathname.split('/');
  const uniqueClientString = (pathList.length > 2)
    ? pathList[2]
    : '';
  const basename = process.env.BUILD_TYPE === 'cloud'
    ? `/run/${uniqueClientString}/`
    : '/';
  return basename;
};

class Routes extends Component {
  state = {
    hasError: false,
    forceLoginScreen: null,
    loadingRenew: true,
    userIdentityReturned: false,
    diskLow: false,
    available: 0,
  };

  basename = getBasename();

  /**
    @param {}
    calls flip header text function
  */
  componentDidMount() {
    const values = queryString.parse(history.location.hash.slice(1));
    const newPath = values.path;

    if (newPath) {
      delete values.path;
      values.redirect = false;
      let stringifiedValues = queryString.stringify(values);
      history.replace(`${this.basename}${newPath}#${stringifiedValues}`);
      delete values.redirect;
      stringifiedValues = queryString.stringify(values);
      window.location.hash = stringifiedValues;
    }

    this._checkSysinfo();

    UserIdentity.getUserIdentity().then((response) => {
      const expiresAt = JSON.stringify((new Date().getTime() * 1000) + new Date().getTime());
      let forceLoginScreen = true;

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
          forceLoginScreen = false;
        } else if (
          (response.data.userIdentity)
          && localStorage.getItem('access_token')
        ) {
          const freshLoginText = localStorage.getItem('fresh_login') ? '&freshLogin=true' : '';
          const baseURL = 'gigantum.com';
          const loginURL = `https://${baseURL}/client/login#route=${window.location.href}${freshLoginText}`;
          window.open(loginURL, '_self');
          forceLoginScreen = null;
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
          forceLoginScreen = true;
        }
      }

      this.setState({
        forceLoginScreen,
        loadingRenew: false,
        userIdentityReturned: true,
      });
    });
  }

  /**
    @param{}
    logs user out in using auth0
  */
  login = () => {
    auth.login();
  }

  /**
    @param{}
    logs user out using auth0
  */
  logout = () => {
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
    const { props, state } = this;
    const showDiskLow = state.diskLow && !window.sessionStorage.getItem('hideDiskWarning');

    if (!state.hasError) {
      // declare css
      const headerCSS = classNames({
        HeaderBar: true,
        'HeaderBar--disk-low': showDiskLow,
      });
      const routesCSS = classNames({
        Routes__main: true,
      });

      if (state.forceLoginScreen === null) {
        return <div className="Routes__temp" />;
      }

      return (

        <Router basename={this.basename}>

          <Switch>

            <Route
              path=""
              render={() => (

                <div className="Routes">

                  {
                    showDiskLow
                    && (
                      <DiskHeader
                        available={state.available}
                        hideDiskWarning={this._hideDiskWarning}
                      />
                    )
                  }

                  <div className={headerCSS} />

                  <SideBar
                    auth={auth}
                    diskLow={showDiskLow}
                  />

                  <div className={routesCSS}>

                    <Route
                      exact
                      path="/"
                      render={parentProps => (
                        <Home
                          loadingRenew={state.loadingRenew}
                          userIdentityReturned={state.userIdentityReturned}
                          auth={auth}
                          diskLow={showDiskLow}
                          {...parentProps}
                        />
                      )
                    }
                    />

                    <Route
                      exact
                      path="/login"
                      render={parentProps => (
                        <Home
                          userIdentityReturned={state.userIdentityReturned}
                          loadingRenew={state.loadingRenew}
                          auth={auth}
                          diskLow={showDiskLow}
                          {...parentProps}
                        />
                      )
                      }
                    />

                    <Route
                      exact
                      path="/:id"
                      render={() => <Redirect to="/projects/local" />}
                    />

                    <Route
                      exact
                      path="/labbooks/:section"
                      render={() => <Redirect to="/projects/local" />}
                    />

                    <Route
                      exact
                      path="/datasets/:labbookSection"
                      render={parentProps => (
                        <Home
                          userIdentityReturned={state.userIdentityReturned}
                          loadingRenew={state.loadingRenew}
                          auth={auth}
                          diskLow={showDiskLow}
                          {...parentProps}
                        />
                      )
                      }
                    />

                    <Route
                      exact
                      path="/projects/:labbookSection"
                      render={parentProps => (
                        <Home
                          userIdentityReturned={state.userIdentityReturned}
                          loadingRenew={state.loadingRenew}
                          auth={auth}
                          diskLow={showDiskLow}
                          {...parentProps}
                        />
                      )}
                    />

                    <Route
                      path="/datasets/:owner/:datasetName"
                      auth={auth}
                      render={(parentProps) => {
                        if (state.forceLoginScreen) {
                          return <Redirect to="/login" />;
                        }

                        return (
                          <DatasetQueryContainer
                            datasetName={parentProps.match.params.datasetName}
                            owner={parentProps.match.params.owner}
                            auth={auth}
                            diskLow={showDiskLow}
                            {...props}
                            {...parentProps}
                          />
                        );
                      }}
                    />

                    <Route
                      path="/projects/:owner/:labbookName"
                      auth={auth}
                      render={(parentProps) => {
                        if (state.forceLoginScreen) {
                          return <Redirect to="/login" />;
                        }

                        return (
                          <LabbookQueryContainer
                            labbookName={parentProps.match.params.labbookName}
                            owner={parentProps.match.params.owner}
                            auth={auth}
                            diskLow={showDiskLow}
                            {...props}
                            {...parentProps}
                          />
                        );
                      }

                      }
                    />

                    <Helper auth={auth} />

                    <Prompt />

                    <Footer />

                  </div>
                </div>
              )}
            />
          </Switch>
        </Router>
      );
    }
    return (
      <div className="Routes__error">

        <p>An error has occured. Please try refreshing the page.</p>
      </div>
    );
  }
}


export default Routes;
