// vendor
import React, { Component } from 'react';
// assets
import './FileBrowser.scss';
// components
import File from './File';
import Folder from './Folder';

export default class FileBrowser extends Component {

    _processFiles() {
        const files = this.props.files;
        let collectedFiles = {};
        this.props.files.forEach((file) => {
            let splitKey = file.key.split('/', -1).filter(key => key.length);
            let currentFileObjectPosition = collectedFiles;
            while (splitKey.length > 1) {
                const currentKey = splitKey[0]
                if (!currentFileObjectPosition[currentKey]) {

                    currentFileObjectPosition[currentKey] = { children: {} };
                }
                currentFileObjectPosition = currentFileObjectPosition[currentKey].children;
                splitKey = splitKey.slice(1, splitKey.length);
            }
            if (splitKey.length === 1) {
                if (currentFileObjectPosition[splitKey[0]]) {
                    currentFileObjectPosition[splitKey[0]].data = file;
                } else {
                    currentFileObjectPosition[splitKey[0]] = { data: file };
                }
                if (file.isDir) {
                    currentFileObjectPosition[splitKey[0]].children = {};
                }
            }
        });
        return collectedFiles;
    }
    _renderJSX(files) {
        return Object.keys(files).map((file) => {
            if (files[file].children) {
                return (<Folder data={files[file]}></Folder>);
            }
            return (<File data={files[file]}></File>);
        })
    }
  render() {
    const files = this._processFiles()
    console.log(files)
    return (
        <div className="FileBrowser">
            <div className="FileBrowser__header">
                <div>
                    File
                </div>

                <div>
                    Size
                </div>

                <div>
                    Modified
                </div>
            </div>
            <div className="FileBrowser__body">
                {
                    Object.keys(files).map((file) => {
                        if (files[file].children) {
                            return (
                                <Folder
                                    data={files[file]}
                                    key={files[file].data.key}
                                >
                                </Folder>
                            );
                        }
                        return (
                            <File
                                data={files[file]}
                                key={files[file].data.key}
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
