// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// assets
import './FooterUploadBar.scss';

export default class FooterUploadBar extends Component {
  render() {
    const footerUploadClass = classNames({
      hidden: !this.props.parentState.uploadOpen,
      'Footer__upload-status': this.props.parentState.uploadOpen,
      'Footer__upload-error': this.props.parentState.uploadError,
    });

    return (
      <div className={footerUploadClass}>
        <div className="Footer__upload-message">
          {this.props.parentState.uploadMessage}
        </div>

        <div
          id="footerProgressBar"
          style={{
            width: `${this.props.parentState.progessBarPercentage}%`,
          }}
          className="Footer__progress-bar"
        />

        {
          this.props.parentState.uploadError && <div
            onClick={() => {
                this.props.closeFooter();
              }}
            className="Footer__close"
          />
        }
        {
          this.props.parentState.labbookSuccess && <button className="Footer__button" onClick={() => this.props.openLabbook()}>
              Open Project
          </button>
        }
      </div>
    );
  }
}
