// @flow
// vendor
import React, { PureComponent } from 'react';
import classNames from 'classnames';
// assets
import './FooterUploadBar.scss';

type Props = {
  closeFooter: Function,
  openLabbook: Function,
  parentState: {
    labbookSuccess: boolean,
    progessBarPercentage: number,
    uploadError: boolean,
    uploadMessage: string,
    uploadOpen: boolean,
  }
}

class FooterUploadBar extends PureComponent<Props> {
  render() {
    const {
      closeFooter,
      openLabbook,
      parentState,
    } = this.props;
    const {
      labbookSuccess,
      progessBarPercentage,
      uploadError,
      uploadMessage,
      uploadOpen,
    } = parentState;
    const isNotZero = progessBarPercentage !== 0;
    // declare css here
    const footerUploadClass = classNames({
      hidden: !uploadOpen,
      'FooterUploadBar--status': uploadOpen,
      'FooterUploadBar--error': uploadError,
    });
    const footerUploadBarClass = classNames({
      FooterUploadBar__progressBar: true,
      'FooterUploadBar__progressBar--animation': isNotZero,
    });

    return (
      <div className={footerUploadClass}>
        <div className="FooterUploadBar__message">
          {uploadMessage}
        </div>

        <div
          id="footerProgressBar"
          style={{ width: `${progessBarPercentage}%` }}
          className={footerUploadBarClass}
        />

        {
          uploadError
          && (
            <div
              className="Footer__close"
              onClick={() => { closeFooter(); }}
              role="presentation"
            />
          )
        }
        {
          labbookSuccess
          && (
          <button
            onClick={() => openLabbook()}
            type="button"
          >
            Open Project
          </button>
          )
        }
      </div>
    );
  }
}

export default FooterUploadBar;
