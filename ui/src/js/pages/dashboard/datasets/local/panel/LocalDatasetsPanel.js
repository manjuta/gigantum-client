// vendor
import React, { Component } from 'react';
import Highlighter from 'react-highlight-words';
import { Link } from 'react-router-dom';
import Moment from 'moment';
// components
import RepositoryTitle from 'Pages/dashboard/shared/title/RepositoryTitle';
// store
import store from 'JS/redux/store';
// assets
import './LocalDatasetsPanel.scss';
// config
import config from 'JS/config';

type Props = {
  edge: {
    node: {
      description: string,
      modifiedOnUtc: string,
      name: string,
      overview: string,
      owner: string,
      createdOnUtc: string,
    }
  },
  filterText: string,
  visibility: string,
};


/**
*  dataset panel is to only render the edge passed to it
*/
export default class LocalDatasetPanel extends Component<Props> {

  render() {
    const {
      edge,
      filterText,
      visibility,
    } = this.props;
    const {
      owner,
      name,
      overview,
      createdOnUtc,
      modifiedOnUtc,
      description,
    } = edge.node;
    const sizeText = `${overview.numFiles} file${(overview.numFiles === 1) ? '' : 's'}, ${config.humanFileSize(overview.totalBytes)}`;
    return (
      <Link
        to={`/datasets/${owner}/${name}`}
        key={`local${name}`}
        className="Card Card--225 Card--text column-4-span-3 flex flex--column justify--space-between"
      >
        <div className="LocalDatasets__row--icons">
          <div
            data-tooltip={`${visibility}`}
            className={`Tooltip LocalDatasetPanel__visibility LocalDatasetPanel__visibility--${visibility} Tooltip-data Tooltip-data--small`}
          />
          <div className="LocalDatasets__dataset-icon" />
        </div>
        <div className="LocalDatasets__row--text">
          <div>
            <RepositoryTitle
              action={() => this._goToDataset()}
              name={name}
              section="LocalDatasets"
              filterText={filterText}
            />
          </div>

          <p className="LocalDatasets__paragraph LocalDatasets__paragraph--owner">{owner}</p>
          <p className="LocalDatasets__paragraph LocalDatasets__paragraph--metadata">
            <span className="bold">Created:</span>
            {' '}
            {Moment(createdOnUtc).format('MM/DD/YY')}
          </p>
          <p className="LocalDatasets__paragraph LocalDatasets__paragraph--metadata">
            <span className="bold">Modified:</span>
            {' '}
            {Moment(modifiedOnUtc).fromNow()}
          </p>
          <p className="LocalDatasets__paragraph LocalDatasets__paragraph--metadata">
            <span className="bold">Size:</span>
            {' '}
            {sizeText}
          </p>

          <p className="LocalDatasets__paragraph LocalDatasets__paragraph--description">
            { (description && description.length)
              ? (
                <Highlighter
                  highlightClassName="LocalLabbooks__highlighted"
                  searchWords={[store.getState().labbookListing.filterText]}
                  autoEscape={false}
                  caseSensitive={false}
                  textToHighlight={description}
                />
              )
              : <span className="LocalDatasets__description--blank">No description provided</span>

            }
          </p>

        </div>
      </Link>
    );
  }
}
