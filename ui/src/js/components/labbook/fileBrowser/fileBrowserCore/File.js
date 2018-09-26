// vendor
import React, { Component } from 'react';
import Moment from 'moment';
// assets
import './File.scss';
// components
import ActionsMenu from './ActionsMenu';
// config
import config from 'JS/config';

export default class File extends Component {
  render() {
    const fileInfo = this.props.data.data;
    return (
        <div className="File">
            <div className="File__row">
                <div>
                    File
                </div>
                <div>
                    {fileInfo.key}
                </div>
                <div>
                    {config.humanFileSize(fileInfo.size)}
                </div>
                <div>
                    {Moment((fileInfo.modified * 1000), 'x').fromNow()}
                </div>
                <ActionsMenu>
                </ActionsMenu>
            </div>

        </div>
    );
  }
}
