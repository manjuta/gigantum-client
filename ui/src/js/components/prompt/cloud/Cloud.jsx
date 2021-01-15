// @flow
// vendor
import React from 'react';


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

export default Cloud;
