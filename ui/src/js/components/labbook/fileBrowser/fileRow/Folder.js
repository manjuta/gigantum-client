// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import Moment from 'moment';
// assets
import './Folder.scss';
// components
import ActionsMenu from './ActionsMenu';
import File from './File';

export default class Folder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            isSelected: props.isSelected || false,
            isIncomplete: false,
        };

        this._setSelected = this._setSelected.bind(this);
        this._setIncomplete = this._setIncomplete.bind(this);
        this._checkParent = this._checkParent.bind(this);
    }

    /**
    *  @param {boolean}
    *  sets child elements to be selected and current folder item
    *  @return {}
    */
    _setSelected(isSelected) {
        this.setState({ isSelected, isIncomplete: false }, () => {
            Object.keys(this.refs).forEach((ref) => {
                this.refs[ref]._setSelected(isSelected);
            });
            if (this.props.checkParent) {
                this.props.checkParent();
            }
        });
    }

    /**
    *  @param {}
    *  sets parents element to selected if count matches child length
    *  @return {}
    */
    _setIncomplete() {
        this.setState({
          isIncomplete: true,
          isSelected: false,
        });
    }

    /**
    *  @param {}
    *  checks parent item
    *  @return {}
    */
    _checkParent() {
        let checkCount = 0;
        Object.keys(this.refs).forEach((ref) => {
            if (this.refs[ref].state.isSelected) {
                checkCount += 1;
            }
        });
        if (checkCount === 0) {
            this.setState(
              {
                isIncomplete: false,
                isSelected: false,
              },
              () => {
                if (this.props.checkParent) {
                   this.props.checkParent();
                }
              },
            );
        } else if (checkCount === Object.keys(this.refs).length) {
            this.setState(
              {
                isIncomplete: false,
                isSelected: true,
              },
              () => {
                if (this.props.checkParent) {
                    this.props.checkParent();
                }
              },
            );
            if (this.props.checkParent) {
                this.props.checkParent();
            }
        } else {
            this.setState(
              {
                isIncomplete: true,
                isSelected: false,
              },
              () => {
                if (this.props.setIncomplete) {
                    this.props.setIncomplete();
                }
              },
          );
        }
    }

    render() {
        const folderInfo = this.props.data.data;
        const { children } = this.props.data;
        const folderRowCSS = classNames({
            Folder__row: true,
            'Folder__row--expanded': this.state.expanded,
        });
        const buttonCSS = classNames({
            Folder__btn: true,
            'Folder__btn--selected': this.state.isSelected,
            'Folder__btn--incomplete': this.state.isIncomplete,
        });

        const folderChildCSS = classNames({
            Folder__child: true,
            hidden: !this.state.expanded,
        });

        const splitKey = folderInfo.key.split('/');
        const folderName = splitKey[splitKey.length - 2];

        return (
            <div className="Folder">
                <div
                    className={folderRowCSS}
                    onClick={evt => !evt.target.classList.contains('Folder__btn') && !evt.target.classList.contains('ActionsMenu__item') && this.setState({ expanded: !this.state.expanded }) }
                >
                    <button
                        className={buttonCSS}
                        onClick={() => this._setSelected(!this.state.isSelected)}
                    >
                    </button>
                    <div className="Folder__icon">
                    </div>
                    <div className="Folder__name">
                        {folderName}
                    </div>
                    <div className="Folder__size">

                    </div>
                    <div className="Folder__date">
                        {Moment((folderInfo.modifiedAt * 1000), 'x').fromNow()}
                    </div>
                    <ActionsMenu>
                    </ActionsMenu>
                </div>
                <div className={folderChildCSS}>
                    <div
                        className="Folder__subfolder"
                    >
                        Add Subfolder
                    </div>
                    {
                        Object.keys(children).map((childFile) => {
                            if (children[childFile].children) {
                                return (
                                    <Folder
                                        ref={children[childFile].data.key}
                                        data={children[childFile]}
                                        key={children[childFile].data.key}
                                        isSelected={this.state.isSelected}
                                        setIncomplete={this._setIncomplete}
                                        checkParent={this._checkParent}
                                    >
                                    </Folder>
                                );
                            }
                            return (
                                <File
                                    ref={children[childFile].data.key}
                                    data={children[childFile]}
                                    key={children[childFile].data.key}
                                    isSelected={this.state.isSelected}
                                    checkParent={this._checkParent}
                                >
                                </File>
                            );
                        })
                    }
                </div>

            </div>
        );
    }
}
