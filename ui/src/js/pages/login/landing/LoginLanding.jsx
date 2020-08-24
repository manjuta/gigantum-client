// vendor
import React, { Component } from 'react';
import store from 'JS/redux/store';
// components
import LoginError from './error/LoginError';
import LoginText from './text/LoginText';
import AvailableServers from './servers/AvailableServers';
// assets
import './LoginLanding.scss';

type Props = {
  auth: {
    login: Function,
    logout: Function,
  },
  availableServers: Array,
}

class Login extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = store.getState().login;
  }

  render() {
    const { auth, availableServers } = this.props;
    const errorType = window.sessionStorage.getItem('LOGIN_ERROR_TYPE');
    const errorDescription = window.sessionStorage.getItem('LOGIN_ERROR_DESCRIPTION');
    return (
      <main className="LoginLanding flex flex-column flex--space-between">
        <LoginError
          errorDescription={errorDescription}
          errorType={errorType}
        />
        <div className="LoginLanding__container justify--center flex align-items--start">
          <LoginText />
          <div className="LoginLanding__spacer" />
          <AvailableServers
            auth={auth}
            availableServers={availableServers}
          />
        </div>
      </main>
    );
  }
}

export default Login;
