// vendor
import React from 'react';
import { render } from 'react-dom';
import xhook from 'xhook';
import { Provider } from 'react-redux';
import { detect } from 'detect-browser';
// store
import store from 'JS/redux/store';
// components
import Routes from 'Components/Routes';
import BrowserSupport from 'Components/browserSupport/BrowserSupport';
// service worker
import { unregister } from './registerServiceWorker';
// assets
import '../css/critical.scss';


xhook.before((request) => {
  console.log(request);
  // if (request.url.match(/example\.txt$/)) {
  //   response.text = response.text.replace(/[aeiou]/g, 'z');
  // }
});

const browser = detect();
if ((browser.name === 'chrome') || (browser.name === 'firefox')) {
  render(
    <Provider store={store}>
      <Routes />
    </Provider>,
    document.getElementById('root') || document.createElement('div'),
  );
} else {
  render(
    <BrowserSupport />,
    document.getElementById('root') || document.createElement('div'),
  );
}

unregister();
