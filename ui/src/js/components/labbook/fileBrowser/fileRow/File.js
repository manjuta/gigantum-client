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
            stateSwitch: false,
        };
        this._setSelected = this._setSelected.bind(this)
    }

    _setSelected(isSelected) {
        this.setState({ isSelected }, () => {
            Object.keys(this.refs).forEach((ref) => {
                this.refs[ref]._setSelected();
            });
            if (this.props.checkParent) {
                this.props.checkParent();
            }
        });
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
                    onClick={() => this._setSelected(!this.state.isSelected)}
                >
                </button>
                <div
                    className={`File__icon ${fileIconsJs.getClass(fileName)}`}
                >
                </div>
                <div className="File__name">
                    {fileName}
                </div>
                <div className="File__size">
                    {config.humanFileSize(fileInfo.size)}
                </div>
                <div className="File__date">
                    {Moment((fileInfo.modifiedAt * 1000), 'x').fromNow()}
                </div>
                <ActionsMenu>
                </ActionsMenu>
            </div>

        </div>
    );
  }
}
