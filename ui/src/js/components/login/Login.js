// vendor
import React, { Component } from 'react';
import store from 'JS/redux/store';
import Loader from 'Components/common/Loader';
// config
import config from 'JS/config';
// assets
import './Login.scss';

// import CreatePage from './components/CreatePage';
export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = store.getState().login;
  }

  /**
    @param {}
    login through Auth0
  */
  login() {
    const { props } = this;
    props.auth.login();
  }

  /**
    @param {}
    logout through Auth0
  */
  logout() {
    const { props } = this;
    props.auth.logout();
  }

  render() {
    const { props } = this;
    const errorType = window.sessionStorage.getItem('LOGIN_ERROR_TYPE');
    const errorDescription = window.sessionStorage.getItem('LOGIN_ERROR_DESCRIPTION');
    return (
      <div className="Login">
        { props.userIdentityReturned
          && (
            <div className="Login__panel">
              { errorType
                && (
                  <div className="LoginError">
                    <div className="Login__error">
                      <div className="Login__error-type">
                        <div className="Login__error-exclamation" />
                        <div>{errorType}</div>
                      </div>
                      <div className="Login__error-description">
                        {errorDescription}
                      </div>
                    </div>
                  </div>
                )
               }
              <div className="Login__logo grid-v-3" />
              <div className="justify--center flex align-items--start">
                <div className="Login__section grid-6 flex flex--column justify--space-around">
                  <div className="Login__summary">
                    <h4 className="Login--ternary text-center">Sign up or Log In</h4>
                    <p>Sign up or Log in to start using Gigantum Client locally.</p>
                    <p>
                      By logging in, all of your work will be properly attributed and you can
                      easily sync up to 5GB of data to Gigantum Hub for free.
                    </p>
                    <p>Once you log in, you’ll be able to work offline.</p>
                  </div>
                </div>
                <div className="grid-3" />
                <div className="grid-5 flex flex--column justify--center">
                  { props.loadingRenew
                    ? (
                      <button
                        type="button"
                        disabled
                        className="Login__button--loading"
                      >
                        Logging In
                        <div className="Code__loading" />
                      </button>
                    )
                    : (
                      <a
                        href={`https://gtm-dev.cloud/client/login#route=${window.location.origin}`}
                        className="Btn Login__button"
                        onClick={this.login.bind(this)}
                      >
                        Sign Up or Log In
                      </a>
                    )
                  }
                </div>
              </div>
            </div>
          )
        }
        {
          props.userIdentityReturned && <Loader />
        }
      </div>
    );
  }
}
