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

// const sortFolders = (a, b) => {
//   if (a.node && b.node) {
//     let aKey = a.node.key.split('/').length;
//     let bKey = b.node.key.split('/').length;
//
//     if ((aKey < bKey) || a.node.isDir) {
//       return -1;
//     } else if ((aKey > bKey) || !a.node.isDir) {
//       return 1;
//     }
//   }
//   return 0;
// };

class FileBrowser extends Component {
    constructor(props) {
      super(props);

      this.state = {
        mutations: new FileBrowserMutations(this._getMutationData()),
        mutationData: this._getMutationData(),
        hoverId: '',
        childrenState: {},
      };

      this._deleteSelectedFiles = this._deleteSelectedFiles.bind(this);
      this._setState = this._setState.bind(this);
      this._updateChildState = this._updateChildState.bind(this);
      this._checkChildState = this._checkChildState.bind(this);
    }
    static getDerivedStateFromProps(props, state) {
        let childrenState = {};
        props.files.edges.forEach((edge) => {
          if (edge.node && edge.node.key) {
            let key = edge.node.key.split('/').join('');
            childrenState[key] = {
              isSelected: (state.childrenState && state.childrenState[key]) ? state.childrenState[key].isSelected : false,
              edge,
            };
          }
        });

        return {
          ...state,
          childrenState,
        };
    }
    /**
    *  @param {string} key - key of file to be updated
    *  @param {boolean} isSelected - update if the value is selected
    *  @return {}
    */
    _updateChildState(key, isSelected) {
      let { childrenState } = this.state;
      let santizedKey = key.split('/').join('');
      childrenState[santizedKey].isSelected = isSelected;
      this.setState({ childrenState });
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
        let fileObject = {};

        edgesToSort.forEach((edge, index) => {
            if (edge.node) {
              let currentObject = fileObject;
              let splitKey = edge.node.key.split('/').filter(key => key.length);
              console.log(`${edge.node.key}-----------------------------`);

              splitKey.forEach((key, index) => {
                  console.log(key)
                  if (currentObject && (index === (splitKey.length - 1))) {
                      if (!currentObject[key]) {
                        currentObject[key] = {
                          edge,
                        };
                      } else {
                        currentObject[key].edge = edge
                      }
                      console.log(currentObject)
                  } else if (currentObject && !currentObject[key]) {
                      currentObject[key] = {
                        children: {},
                      }
                      currentObject = currentObject[key].children;
                  } else if (currentObject && currentObject[key] && !currentObject[key].children) {
                      currentObject[key].children = {};
                      currentObject = currentObject[key].children;
                  } else {
                    currentObject = currentObject[key].children;
                  }
              });
            }
        });
        console.log(fileObject)
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
    for (let key in this.state.childrenState) {
      if (this.state.childrenState[key].isSelected) {
        let { edge } = this.state.childrenState[key];
        delete this.state.childrenState[key];
        self._deleteMutation(edge.node.key, edge);
      }
    }
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

        if (child.props.data && !child.props.data.edge.node.isDir) {
          if (child.props.isOverCurrent) {
            isOver = true;
          }
        }
      }
    });

    return ({
      isOver,
    });
  }
  /**
  *  @param {}
  *  checks if folder refs has props.isOver === true
  *  @return {boolean} isSelected - returns true if a child has been selected
  */
  _checkChildState() {
    let isSelected = false;

    for (let key in this.state.childrenState) {
      if (this.state.childrenState[key].isSelected) {
        isSelected = true;
      }
    }

    return { isSelected };
  }

  render() {
    const files = this._processFiles(),
          { mutationData } = this.state,
          {
            isOver,
          } = this._checkRefs();

   const { isSelected } = this._checkChildState();

   const fileBrowserCSS = classNames({
     FileBrowser: true,
     'FileBrowser--highlight': isOver,
   });

   return (
       this.props.connectDropTarget(<div className={fileBrowserCSS}>
                <div className="FileBrowser__header">
                    <div className="FileBrowser__header--name">
                        <button
                          disabled={ !isSelected }
                          className="Btn Btn--round Btn--delete"
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
                        if (files[file] && files[file].edge && files[file].edge.node.isDir) {
                            return (
                                <Folder
                                    ref={file}
                                    filename={file}
                                    key={files[file].edge.node.key}
                                    mutationData={mutationData}
                                    data={files[file]}
                                    mutations={this.state.mutations}
                                    setState={this._setState}
                                    updateChildState={this._updateChildState}>
                                </Folder>
                            );
                        } else if (files[file] && files[file].edge && !files[file].edge.node.isDir) {
                          return (
                              <File
                                  ref={file}
                                  filename={file}
                                  key={files[file].edge.node.key}
                                  mutationData={mutationData}
                                  data={files[file]}
                                  mutations={this.state.mutations}
                                  updateChildState={this._updateChildState}>
                              </File>
                          );
                        }

                        return (<div>Loading</div>);
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
