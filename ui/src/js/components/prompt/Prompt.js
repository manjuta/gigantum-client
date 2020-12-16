// vendor
import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
import classNames from 'classnames';
// utils
import getApiURL from 'JS/utils/apiUrl';
// assets
import './Prompt.scss';

let updateAvailable = false;

const Localhost = () => (
  <div>
    <div className="Prompt__header">
      <p>Cannot connect to Gigantum Client</p>
    </div>
    <p>
      Please verify that that the Client is running by clicking on the Gigantum logo in your system tray to open Gigantum Desktop.
    </p>
    <p>
      If the problem persists, try the steps outlined
      {' '}
      <a
        href="https://docs.gigantum.com/docs/client-interface-fails-to-load"
        rel="noopener noreferrer"
        target="_blank"
      >
        here
      </a>
      {' '}
      , contact
      {' '}
      <a
        href="mailto:support@gigantum.com"
      >
        support@gigantum.com
      </a>
      , or visit our
      {' '}
      <a
        href="https://spectrum.chat/gigantum/"
        rel="noopener noreferrer"
        target="_blank"
      >
        forum
      </a>
      {' '}
      and post a question.
    </p>
  </div>
);

const Cloud = () => (
  <div>
    <div className="Prompt__header">
      <p>Cannot connect to your Gigantum Hub Client</p>
    </div>
    <p>
      Please verify that you are connected to the internet and have a running Client.
    </p>
    <p>
        If the problem persists, contact
      {' '}
      <a
        href="mailto:support@gigantum.com"
      >
        support@gigantum.com
      </a>
      , or visit our
      {' '}
      <a
        href="https://spectrum.chat/gigantum/"
        rel="noopener noreferrer"
        target="_blank"
      >
        forum
      </a>
      .
    </p>
  </div>
);

const pingServer = () => {
  const apiURL = getApiURL('ping');
  const currentVersion = localStorage.getItem('currentVersion');

  return fetch(apiURL, {
    method: 'GET',
  }).then((response) => {
    if (response.status === 200 && (response.headers.get('content-type') === 'application/json')) {
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

export default class Prompt extends Component {
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
    const { state } = this;
    // variables here
    const failedEightTimesOrMore = (state.failureCount >= 8);
    const lessThanEight = (state.failureCount < 8);
    // decalre css here
    const promptInfoCSS = classNames({
      Prompt__info: true,
      hidden: state.promptState,
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
      Prompt__refresh: state.updateAvailable,
      hidden: !state.updateAvailable,
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
