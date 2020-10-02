// vendor
import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
// components
import LoginLanding from './landing/LoginLanding';
import LoginError from './landing/error/LoginError';
// css
import './Login.scss';


type Props = {
  auth: {
    login: Function,
    logout: Function,
  },
  history: {
    location: {
      pathname: string,
    },
    push: Function,
  }
}

class Login extends Component<Props> {
  componentDidMount() {
    const { history } = this.props;
    if (!history.location.pathname.includes('/login')) {
      history.push('/login');
    }
  }

  render() {
    const errorType = window.sessionStorage.getItem('LOGIN_ERROR_TYPE');
    const errorDescription = window.sessionStorage.getItem('LOGIN_ERROR_DESCRIPTION');
    return (
      <div className="Login flex flex--column">
        <Switch>
          <Route
            exact
            path="/login"
            render={() => <LoginLanding {...this.props} />}
          />
          <Route
            exact
            path="/login/error"
            render={() => (
              <LoginError
                {...this.props}
                errorDescription={errorDescription}
                errorType={errorType}
              />
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default Login;
