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
        };
    }

    static getDerivedStateFromProps(nextProps, nextState) {
        return {
            ...nextState,
            isSelected: nextProps.isSelected,
        };
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
        });
        const splitKey = folderInfo.key.split('/');
        const folderName = splitKey[splitKey.length - 2];
        return (
            <div className="Folder">
                <div
                    className={folderRowCSS}
                    onClick={evt => !evt.target.classList.contains('Folder__btn') && this.setState({ expanded: !this.state.expanded }) }
                >
                    <button
                        className={buttonCSS}
                        onClick={(evt) => {
                            evt.stopPropagation();
                            this.setState({ isSelected: !this.state.isSelected })

                            }
                        }
                    >
                    </button>
                    <div className="Folder__icon">
                    </div>
                    <div>
                        {folderName}
                    </div>
                    <div>

                    </div>
                    <div>
                        {Moment((folderInfo.modified * 1000), 'x').fromNow()}
                    </div>
                    <ActionsMenu>
                    </ActionsMenu>
                </div>
                { this.state.expanded &&
                    <div className="Folder__child">
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
                                            data={children[childFile]}
                                            key={children[childFile].data.key}
                                            isSelected={this.state.isSelected}
                                        >
                                        </Folder>
                                    );
                                }
                                return (
                                    <File
                                        data={children[childFile]}
                                        key={children[childFile].data.key}
                                        isSelected={this.state.isSelected}
                                    >
                                    </File>
                                );
                            })
                        }
                    </div>
                }

            </div>
        );
    }
}
