// vendor
import React, { Component } from 'react';
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
        };
    }

    render() {
        const folderInfo = this.props.data.data;
        const { children } = this.props.data;
        return (
            <div className="Folder">
                <div
                    className="Folder__row"
                    onClick={() => this.setState({ expanded: !this.state.expanded })}
                >
                    <div>
                        Folder
                    </div>
                    <div>
                        {folderInfo.key}
                    </div>
                    <div>

                    </div>
                    <div>
                        {Moment((folderInfo.modified * 1000), 'x').fromNow()}
                    </div>
                    <ActionsMenu>
                    </ActionsMenu>
                </div>
                <div className="Folder__child">
                    {
                        this.state.expanded && Object.keys(children).map((childFile) => {
                            if (children[childFile].children) {
                                return (
                                <Folder
                                    data={children[childFile]}
                                    key={children[childFile].data.key}
                                >
                                </Folder>
                            );
                            }
                            return (
                            <File
                                data={children[childFile]}
                                key={children[childFile].data.key}
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
