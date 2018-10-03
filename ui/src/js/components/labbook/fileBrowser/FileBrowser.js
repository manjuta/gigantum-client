// vendor
import React, { Component } from 'react';
import store from 'JS/redux/store';
// assets
import './FileBrowser.scss';
// components
import File from './fileRow/File';
import Folder from './fileRow/Folder';
import FileBrowserMutations from './utilities/FileBrowserMutations';

export default class FileBrowser extends Component {
    constructor(props) {
      super(props);

      this.state = {
        mutations: new FileBrowserMutations(this._getMutationData()),
      };
    }
    /**
    *  @param {}
    *  sorts files into an object for rendering
    *  @return {}
    */
    _processFiles() {
        const edges = this.props.files.edges;

        let collectedFiles = {};

        edges.forEach((edge) => {
            let splitKey = edge.node.key.split('/', -1).filter(key => key.length);
            let currentFileObjectPosition = collectedFiles;
            while (splitKey.length > 1) {
                const currentKey = splitKey[0];

                if (!currentFileObjectPosition[currentKey]) {
                    currentFileObjectPosition[currentKey] = { children: {} };
                }
                currentFileObjectPosition = currentFileObjectPosition[currentKey].children;
                splitKey = splitKey.slice(1, splitKey.length);
            }
            if (splitKey.length === 1) {
                if (currentFileObjectPosition[splitKey[0]]) {
                    currentFileObjectPosition[splitKey[0]].edge = edge;
                } else {
                    currentFileObjectPosition[splitKey[0]] = { edge };
                }
                if (edge.node.isDir) {
                    currentFileObjectPosition[splitKey[0]].children = {};
                }
            }
        });
        console.log(collectedFiles);
        return collectedFiles;
  }
  /**
  *  @param {}
  *  sorts files into an object for rendering
  *  @return {object}
  */
  _getMutationData() {

    const {
      parentId,
      connection,
      favoriteConnection,
      section,
    } = this.props;
    const { owner, labbookName } = store.getState().routes;

    return {
      owner,
      labbookName,
      parentId,
      connection,
      favoriteConnection,
      section,
    };
  }

  render() {
    const files = this._processFiles(),
          mutationData = this._getMutationData();

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
                                    mutationData={mutationData}
                                    data={files[file]}
                                    key={files[file].edge.node.key}
                                    mutations={this.state.mutations}>
                                </Folder>
                            );
                        }
                        return (
                            <File
                                mutationData={mutationData}
                                data={files[file]}
                                key={files[file].edge.node.key}
                                mutations={this.state.mutations}>
                            </File>
                        );
                    })
                }
            </div>
        </div>
    );
  }
}
