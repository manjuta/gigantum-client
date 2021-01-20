// vendor
import React, { Component } from 'react';
import Moment from 'moment';
import { getClass } from 'file-icons-js';
import classNames from 'classnames';
import MiddleTruncate from 'react-middle-truncate/lib/react-middle-truncate';
// config
import config from 'JS/config';
// components
import ActionsMenu from './DatasetActionsMenu';
// assets
import './DatasetFile.scss';

class File extends Component {
  render() {
    const {
      fileData,
      filename,
      style,
      section,
      isDownloading,
      mutations,
      mutationData,
    } = this.props;
    const { node } = fileData.edge;
    const { index } = fileData;
    const fileRowCSS = classNames({
      File__row: true,
    });

    const textIconsCSS = classNames({
      'File__cell File__cell--name': true,
    });

    const paddingLeft = 40 * index;


    const rowStyle = { paddingLeft: `${paddingLeft}px` };
    return (
      <div
        style={style}
        className="File"
      >
        <div
          className={fileRowCSS}
          style={rowStyle}
        >

          <div className={textIconsCSS}>

            <div className={`File__icon ${getClass(filename)}`} />

            <div className="File__text">
              { filename
                && (
                  <MiddleTruncate
                    ellipsis="..."
                    text={filename}
                    smartCopy
                  />
                )}
            </div>

          </div>

          <div className="File__cell File__cell--size">
            {config.humanFileSize(node.size)}
          </div>

          <div className="File__cell File__cell--date">
            {Moment((node.modifiedAt * 1000), 'x').fromNow()}
          </div>

          <div className="File__cell File__cell--menu">
            <ActionsMenu
              section={section}
              edge={fileData.edge}
              isLocal={fileData.edge.node.isLocal}
              mutationData={mutationData}
              mutations={mutations}
              renameEditMode={this._renameEditMode}
              isDownloading={isDownloading}
            />
          </div>
        </div>
      </div>
    );
  }
}


export default File;
