// vendor
import React, { Component } from 'react';
// assets
import './BrowserSupport.scss';
import gigantumSrc from 'Images/logos/gigantum-turquise-logo.svg'


export default class BrowserSupport extends Component {
  render() {
    return (
      <div className="BrowserSupport">
        <img
          className="BrowserSupport__img"
          src={gigantumSrc}
          alt="Gigantum"
        />
        <p>Gigantum currently only supports Chrome and Firefox</p>
        <p>We intend on supporting all major browsers in the near future</p>
      </div>
    );
  }
}
