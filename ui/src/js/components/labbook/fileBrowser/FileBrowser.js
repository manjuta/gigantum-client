// vendor
import React, { Component } from 'react';
import store from 'JS/redux/store';
import { DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import classNames from 'classnames';
// assets
import './FileBrowser.scss';
// components
import File from './fileRow/File';
import Folder from './fileRow/Folder';
import AddSubfolder from './fileRow/AddSubfolder';
import FileBrowserMutations from './utilities/FileBrowserMutations';
import Connectors from './utilities/Connectors';

const sortFolders = (a, b) => {
  let aKey = a.node.key.split('/').length;
  let bKey = b.node.key.split('/').length;

  if ((aKey > bKey) || a.node.isDir) {
    return -1;
  } else if ((aKey < bKey) || !a.node.isDir) {
    return 1;
  }
  return 0;
};

class FileBrowser extends Component {
    constructor(props) {
      super(props);

      this.state = {
        mutations: new FileBrowserMutations(this._getMutationData()),
        mutationData: this._getMutationData(),
        hoverId: '',
      };

      this._deleteSelectedFiles = this._deleteSelectedFiles.bind(this);
      this._setState = this._setState.bind(this);
    }
    /**
    *  @param {}
    *  update state of component for a given key value pair
    *  @return {}
    */
    _setState(stateKey, value) {
       this.setState({ [stateKey]: value });
    }
    /**
    *  @param {}
    *  sorts files into an object for rendering
    *  @return {}
    */
    _processFiles() {
        let edges = this.props.files.edges;
        let edgesToSort = JSON.parse(JSON.stringify(edges));
        let edgesSorted = edgesToSort.sort(sortFolders);
        let fileObject = {};

        edgesSorted.forEach((edge, index) => {
            let currentObject = fileObject;
            let splitKey = edge.node.key.split('/', -1).filter(key => key.length);

            splitKey.forEach((key, index) => {
                if (currentObject && !currentObject[key]) {
                    if (edge.node.isDir) {
                      currentObject[key] = {
                        children: {},
                        edge,
                      };

                      currentObject = currentObject[key];
                    } else {
                      currentObject[key] = {
                        edge,
                      };
                    }
                } else if (currentObject) {
                    currentObject = currentObject[key].children;
                }
            });
        });

        return fileObject;
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
  /**
  *  @param {string, boolean}
  *  updates boolean state of a given key
  *  @return {}
  */
  _updateStateBoolean(key, value) {
    this.setState({ [key]: value });
  }
  /**
  *  @param {}
  *  checks if folder refs has props.isOver === true
  *  @return {boolean}
  */
  _checkRefs() {
    let isOver = this.props.isOverCurrent,
        { refs } = this;

    Object.keys(refs).forEach((childname) => {
      if (refs[childname].getDecoratedComponentInstance && refs[childname].getDecoratedComponentInstance() && refs[childname].getDecoratedComponentInstance().getDecoratedComponentInstance && refs[childname].getDecoratedComponentInstance().getDecoratedComponentInstance()) {
        const child = refs[childname].getDecoratedComponentInstance().getDecoratedComponentInstance();
        if (!child.props.data.edge.node.isDir) {
          console.log(child.props.data.edge.node.key, child.props.isOverCurrent, !child.props.data.edge.node.isDir);
        }

        if (child.props.data && !child.props.data.edge.node.isDir) {
          if (child.props.isOverCurrent) {
            isOver = true;
          }
        }
      }
    });
    console.log(isOver);
    return (isOver);
  }

  render() {
    const files = this._processFiles(),
          { mutationData } = this.state,
          isOver = this._checkRefs();

   const fileBrowserCSS = classNames({
     FileBrowser: true,
     'FileBrowser--highlight': isOver,
   });

   return (
       this.props.connectDropTarget(<div className={fileBrowserCSS}>
                <div className="FileBrowser__header">
                    <div className="FileBrowser__header--name">
                        <button className="FileBrowser__btn FileBrowser__btn--delete"
                          onClick={() => { this._deleteSelectedFiles(); }} />
                        File
                    </div>

                    <div className="FileBrowser__header--size">
                        Size
                    </div>

                    <div className="FileBrowser__header--date">
                        Modified
                    </div>

                    <div className="FileBrowser__header--menu">
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
                                    mutations={this.state.mutations}
                                    setState={this._setState}>
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
            {/* <div className={drogTargetCSS}>
              <h3 className="FileBrowser__h3">Add file to root</h3>
            </div> */}
        </div>)
    );
  }
}


export default DropTarget(
    ['card', NativeTypes.FILE],
    Connectors.targetSource,
    Connectors.targetCollect,
  )(FileBrowser);
