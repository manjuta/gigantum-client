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
  errors: Array,
  history: {
    location: {
      pathname: string,
    },
    push: Function,
  }
}

class Login extends Component<Props> {
  componentDidMount() {
    const { errors, history } = this.props;
    if (errors && (errors.length > 0)) {
      history.push('/login/error');
    } else {
      history.push('/login');
    }
  }

  render() {
    const { errors } = this.props;
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
                errors={errors}
              />
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default Login;
