// vendor
import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
import classNames from 'classnames';
// utils
import getApiURL from 'JS/utils/apiUrl';
// components
import Cloud from './cloud/Cloud';
import Localhost from './localhost/Localhost';
// assets
import './Prompt.scss';

let updateAvailable = false;

const pingServer = () => {
  const apiURL = getApiURL('ping');
  const currentVersion = localStorage.getItem('currentVersion');

  return fetch(apiURL, {
    method: 'GET',
  }).then((response) => {
    if (
      (response.status === 200)
      && ((response.headers.get('content-type') === 'application/json'))
    ) {
      if (!updateAvailable) {
        response.json().then((res) => {
          if (!currentVersion) {
            localStorage.setItem('currentVersion', res.revision);
          } else if (res.revision !== currentVersion) {
            updateAvailable = true;
            localStorage.setItem('currentVersion', res.revision);
          }
        });
      }
      return true;
    }
    return false;
  }).catch(() => false);
};

class Prompt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      failureCount: 0,
      promptState: true,
      updateAvailable: false,
    };
    this._handlePing = this._handlePing.bind(this);
  }

  componentDidMount() {
    this._handlePing();
    this.intervalId = setInterval(this._handlePing.bind(this), 2500);
  }

  /**
    @param {}
    pings server and checks when the api comes back up
  */
  _handlePing = () => {
    pingServer()
      .then((response) => {
        const { state } = this;
        if (updateAvailable !== state.updateAvailable) {
          this.setState({ updateAvailable });
        }
        if (response) {
          if (state.failureCount > 0) {
            document.location.reload();
          }

          this.setState({
            promptState: true,
            connected: true,
            failureCount: 0,
          });

          clearInterval(this.intervalId);

          this.intervalId = setInterval(this._handlePing.bind(this), 10000);
        } else {
          this.setState({
            failureCount: state.failureCount + 1,
            promptState: false,
          });

          clearInterval(this.intervalId);

          this.intervalId = setInterval(this._handlePing.bind(this), 2500);
        }
      });
  }


  render() {
    const {
      failureCount,
      promptState,
      updateAvailable,
    } = this.state;
    // variables here
    const failedEightTimesOrMore = (failureCount >= 8);
    const lessThanEight = (failureCount < 8);
    // decalre css here
    const promptInfoCSS = classNames({
      Prompt__info: true,
      hidden: promptState,
    });
    const propmptLogoCSS = classNames({
      Prompt__logo: true,
      'Prompt__logo--final': failedEightTimesOrMore,
    });
    const loadingMessageCSS = classNames({
      'Prompt__loading-text': lessThanEight,
      hidden: !lessThanEight,
    });
    const failureContainerCSS = classNames({
      'Prompt__failure-container': failedEightTimesOrMore,
      hidden: !failedEightTimesOrMore,
    });
    const updateAvailableCSS = classNames({
      Prompt__refresh: updateAvailable,
      hidden: !updateAvailable,
    });

    return (
      <div className="Prompt">
        <div className={promptInfoCSS}>
          <div className={propmptLogoCSS} />
          <div className={loadingMessageCSS}>
            Please wait. Gigantum Client is starting...
          </div>
          <div className={failureContainerCSS}>
            <div className="Prompt__failure-text">
              {
                (window.location.hostname === 'localhost')
                  ? <Localhost />
                  : <Cloud />
              }
            </div>
          </div>
        </div>
        <div className={updateAvailableCSS}>
          <div>
            <p>A newer version of gigantum has been detected. Please refresh the page to view changes.</p>
          </div>
          <div>
            <button
              type="button"
              className="button--green"
              onClick={() => document.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export {
  pingServer,
};

export default Prompt;
