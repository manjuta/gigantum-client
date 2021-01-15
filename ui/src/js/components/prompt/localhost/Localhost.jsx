// @flow
// vendor
import React from 'react';

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

export default Localhost;
