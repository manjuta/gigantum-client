// vendor
import React, { PureComponent } from 'react';
import classNames from 'classnames';
// config
import config from 'JS/config';
// assets
import DatasetSVG from 'Images/icons/datasets-jet.svg';
import './LinkCard.scss';

class LinkCard extends PureComponent {
  render() {
    const { node, selectedDataset } = this.props;
    const size = config.humanFileSize(node.overview.totalBytes);
    // declare css here
    const linkCardCSS = classNames({
      'LinkCard__dataset--selected': selectedDataset && (selectedDataset.owner === node.owner)
      && (selectedDataset.name === node.name),
      LinkCard__dataset: true,
      Card: true,
    });

    return (
      <div className={linkCardCSS}>
        <img
          alt=""
          src={DatasetSVG}
          height="20"
          width="20"
        />

        <div className="LinkCard__details">
          <h6
            className="LinkCard__header"
            data-name={node.name}
          >
            <b>{node.name}</b>
          </h6>
          <div className="flex justify--flex-start">
            <p
              className="LinkCard__paragraph break-word"
              data-owner={node.owner}
            >
              {`by ${node.owner}`}
            </p>

            <p className="LinkCard__paragraph LinkCard__paragraph--grey">{`${size}, ${node.overview.numFiles} files`}</p>
          </div>
        </div>
        <div className="LinkCard__text">
          <p className="LinkCard__description">
            {node.description}
          </p>
        </div>
      </div>
    );
  }
}

export default LinkCard;
