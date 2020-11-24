// @flow
// vendor
import React from 'react';
import classNames from 'classnames';
// components
import Loader from 'Components/loader/Loader'
// assets
import gigantumLogo from 'Images/logos/gigantum-client.svg';
import exclamationSVG from 'Images/icons/exclamation-orange.svg';
// css
import './Interstitial.scss';

type Props = {
  message: string,
  messageType: string,
}

const Interstitial = (props: Props) => {
  const { message, messageType } = props;
  // declare css here
  const messageCSS = classNames({
    Interstitial__message: messageType === 'error',
  });

  return (
    <div className="App flex flex--column align-items--center relative">
      <header className="App__header">
        <img
          alt="Gigantum"
          width="600"
          src={gigantumLogo}
        />
      </header>
      { (messageType === 'error')
        && (
          <h2 className="Interstitial--type flex">
            <img
              alt="Error"
              className="Interstitial--exclamation"
              src={exclamationSVG}
            />
            <span>{messageType}</span>
          </h2>
        )
      }
      <main className="App__loader relative">
        { (messageType === 'loader')
          && (
            <div className="Interstitial__loader relative">
              <Loader nested />
            </div>
          )
        }
        <p className={messageCSS}>{message}</p>
      </main>
    </div>
  );
};

export default Interstitial;
