// vendor
import React, { Component } from 'react';
// components
import Dataset1 from './Dataset1';
// assets
import './Datasets.scss';

export default class Datasets extends Component {
  state = {

  }

  render() {
    const { props } = this;
    console.log(props.linkedDatasets);
    return (
      <div className="Datasets">
        <div className="Datasets__header flex justify--space-between">
          <h4 className="margin--0">Datasets</h4>
          <button
            className="Btn Btn__FileBrowserAction Btn__FileBrowserAction--link"
            type="button"
            onClick={() => props.showLinkModal(true)}
            data-tooltip="Link Dataset"
            disabled={props.isLocked}
          >
            Link Dataset
          </button>
        </div>
        {
          (props.linkedDatasets.length === 0)
          && (
            <div>
              There are no Datasets linked to this project.
            </div>
          )
        }
        {
          props.linkedDatasets.map(dataset => (
            <Dataset1
              key={dataset.name}
              dataset={dataset}
            />
          ))
        }
      </div>
    );
  }
}
