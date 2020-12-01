// vendor
import React, { Component } from 'react';
// context
import ServerContext from 'Pages/ServerContext';
// components
import Modal from 'Components/modal/Modal';
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
    const { currentServer } = this.context;
    auth.renewToken(
      currentServer,
      `#route=${window.location.href}`,
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

  static contextType = ServerContext;

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
      >
        {(navigator.onLine)
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
          )
        }
      </Modal>
    );
  }
}

export default LoginPrompt;
