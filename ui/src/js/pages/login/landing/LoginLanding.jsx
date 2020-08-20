// vendor
import React, { Component } from 'react';
import store from 'JS/redux/store';
import fetchQuery from 'JS/fetch';
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

  componentDidMount() {
  }

  render() {
    const { auth, availableServers } = this.props;
    const errorType = window.sessionStorage.getItem('LOGIN_ERROR_TYPE');
    const errorDescription = window.sessionStorage.getItem('LOGIN_ERROR_DESCRIPTION');
    return (
      <main className="LoginLanding">
        <LoginError
          errorDescription={errorDescription}
          errorType={errorType}
        />
        <div className="grid justify--space-around flex align-items--start">
          <LoginText />
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
