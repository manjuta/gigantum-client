// vendor
import React, { Component } from 'react';
// components
import Modal from 'Components/common/Modal';
// auth
import Auth from 'JS/Auth/Auth';
// assets
import './LoginPrompt.scss';


const auth = new Auth();

type Props = {
  closeModal: Function,
  showLoginPrompt: boolean,
}

class LoginPrompt extends Component<Props> {
  /**
  *  @param {} -
  *  sends user to refresh workflow
  *  @return {}
  */
  _login() {
    const { closeModal } = this.props;

    auth.renewToken(
      null,
      () => {},
      () => {
      }, null,
      (err) => {
        console.log(err);
      },
    );

    closeModal(true);
  }

  /**
  *  @param {} -
  *  closes modal and ignores login
  *  @return {}
  */
  _dontLogin() {
    const { closeModal } = this.props;
    closeModal(true);
  }

  render() {
    const { showLoginPrompt } = this.props;

    if (!showLoginPrompt) {
      return null;
    }

    return (
      <Modal
        size="small"
        handleClose={() => this.props.closeModal()}
        icon="login"
        renderContent={() => (navigator.onLine
          ? (
            <div className="LoginPrompt">
              <div>
                <p>Your session has expired and must be renewed to perform this action.</p>
                <p>Do you want to login?</p>
              </div>
              <div className="LoginPrompt__buttonContainer">
                <button
                  type="button"
                  onClick={() => { this._login(); }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => { this._dontLogin(); }}
                >
                  no
                </button>
              </div>
            </div>
          )
          : (
            <div className="LoginPrompt">
              <div className="LoginPrompt__container">
                <p>A valid internet connection is required to perform this action.</p>
              </div>
            </div>
          ))
        }
      />
    );
  }
}

export default LoginPrompt;
