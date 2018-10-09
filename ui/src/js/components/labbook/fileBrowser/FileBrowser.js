// vendor
import React, { Component } from 'react';
import store from 'JS/redux/store';
// assets
import './FileBrowser.scss';
// components
import File from './fileRow/File';
import Folder from './fileRow/Folder';
import AddSubfolder from './fileRow/AddSubfolder';
import FileBrowserMutations from './utilities/FileBrowserMutations';

export default class FileBrowser extends Component {
    constructor(props) {
      super(props);

      this.state = {
        mutations: new FileBrowserMutations(this._getMutationData()),
      };

      this._deleteSelectedFiles = this._deleteSelectedFiles.bind(this);
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
                    currentFileObjectPosition[currentKey] = {
                                                  children: {},
                                                  edge,
                                                };
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
  /**
  *  @param {}
  *  loops through selcted files and deletes them
  *  @return {}
  */
  _deleteSelectedFiles() {
    let self = this;
    function loopDelete(refs) {
      Object.keys(refs).forEach((filename) => {
        const file = refs[filename].getDecoratedComponentInstance().getDecoratedComponentInstance();

        const { edge } = file.props.data;

        if (file.state.isSelected) {
          self._deleteMutation(edge.node.key, edge);
        } else if (file.props.data.edge.node.isDir && !file.state.isSelected) {
          loopDelete(file.refs);
        }
      });
    }

    loopDelete(this.refs);
  }

  /**
  *  @param {}
  *  triggers delete muatation
  *  @return {}
  */
  _deleteMutation(key, edge) {
    const data = {
      key,
      edge,
    };

    this.state.mutations.deleteLabbookFile(data, (response) => {
      console.log(response, edge);
    });
  }

  render() {
    const files = this._processFiles(),
          mutationData = this._getMutationData();

    return (
        <div className="FileBrowser">
                <div className="FileBrowser__header">
                    <div>
                        <button className="FileBrowser__btn FileBrowser__btn --delete"
                          onClick={() => { this._deleteSelectedFiles(); }} />
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
                <AddSubfolder
                  key={'rootAddSubfolder'}
                  folderKey=""
                  mutationData={mutationData}
                  mutations={this.state.mutations}
                />
                {
                    Object.keys(files).map((file) => {
                        if (files[file].children) {
                            return (
                                <Folder
                                    ref={file}
                                    key={files[file].edge.node.key}
                                    mutationData={mutationData}
                                    data={files[file]}
                                    mutations={this.state.mutations}>
                                </Folder>
                            );
                        }
                        return (
                            <File
                                ref={file}
                                key={files[file].edge.node.key}
                                mutationData={mutationData}
                                data={files[file]}
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
