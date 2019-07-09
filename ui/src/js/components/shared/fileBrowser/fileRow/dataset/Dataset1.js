// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// components
// import Modal from 'Components/common/Modal';
// config
import config from 'JS/config';
// assets
import './Dataset1.scss';

export default class Datasets extends Component {
  state = {
    expanded: false,
  }

  render() {
    const { props, state } = this;
    const numFilesText = `${props.dataset.overview.numFiles} file${(props.dataset.overview.numFiles === 1) ? '' : 's'}`
    const sizeText = config.humanFileSize(props.dataset.overview.totalBytes);
    const cardCSS = classNames({
      'Dataset Card': true,
      'Dataset--expanded': state.expanded,
      'Dataset--collapsed': !state.expanded,
    });
    return (
      <div className={cardCSS}>
        <div className="Dataset__summary flex justify--space-between">
          <div className="Dataset__info flex flex-1">
            <div className="Dataset__icon" />
            <div className="flex flex--column justify--space-between">
              <div className="Dataset__name">{props.dataset.name}</div>
              <div className="Dataset__owner">{`by ${props.dataset.owner}`}</div>
              <div className="Dataset__details flex justify--space-between">
                <span>{sizeText}</span>
                <span>{numFilesText}</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
          </div>
          <div className="flex-1">
          </div>
        </div>
      </div>
    );
  }
}
