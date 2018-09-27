// vendor
import React, { Component } from 'react';
import Moment from 'moment';
import fileIconsJs from 'file-icons-js';
import classNames from 'classnames';
// assets
import './File.scss';
// components
import ActionsMenu from './ActionsMenu';
// config
import config from 'JS/config';

export default class File extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSelected: props.isSelected || false,
        };
    }

    static getDerivedStateFromProps(nextProps, nextState) {
        return {
            ...nextState,
            isSelected: nextProps.isSelected === undefined ? nextState.isSelected : nextProps.isSelected,
        };
    }

  render() {
    const fileInfo = this.props.data.data;
    const splitKey = fileInfo.key.split('/');
    const fileName = splitKey[splitKey.length - 1];
    const buttonCSS = classNames({
        File__btn: true,
        'File__btn--selected': this.state.isSelected,
    });
    return (
        <div className="File">
            <div className="File__row">
                <button
                    className={buttonCSS}
                    onClick={() => this.setState({ isSelected: !this.state.isSelected })}
                >
                </button>
                <div
                    className={`File__icon ${fileIconsJs.getClass(fileName)}`}
                >
                </div>
                <div>
                    {fileName}
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
