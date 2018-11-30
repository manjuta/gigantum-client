// vendor
import React, { Component } from 'react';
import store from 'JS/redux/store';
import { DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import classNames from 'classnames';
import { List, WindowScroller, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
// assets
import './FileBrowser.scss';
// components
import File from './fileRow/File';
import Folder from './fileRow/Folder';
import AddSubfolder from './fileRow/AddSubfolder';
import FileBrowserMutations from './utilities/FileBrowserMutations';
import Connectors from './utilities/Connectors';
// util
import FileFormatter, { fileHandler } from './utilities/FileFormatter';

class FileBrowser extends Component {
    constructor(props) {
      super(props);

      this.state = {
        mutations: new FileBrowserMutations(this._getMutationData()),
        mutationData: this._getMutationData(),
        hoverId: '',
        childrenState: {},
        multiSelect: 'none',
        search: '',
        isOverChildFile: false,
        sort: 'az',
        reverse: false,
        count: 0,
        files: {},
        aboveSize: window.innerWidth > 1240,
      };

      this.cache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 50,
      });

      this._deleteSelectedFiles = this._deleteSelectedFiles.bind(this);
      this._setState = this._setState.bind(this);
      this._updateChildState = this._updateChildState.bind(this);
      this._checkChildState = this._checkChildState.bind(this);
      this._updateDropZone = this._updateDropZone.bind(this);
      this._getRowHeight = this._getRowHeight.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        let previousCount = state.count;
        let count = props.files.edges.length;
        let childrenState = {};
        props.files.edges.forEach((edge) => {
          if (edge.node && edge.node.key) {
            let key = edge.node.key;
            childrenState[key] = {
              isSelected: (state.childrenState && state.childrenState[key]) ? state.childrenState[key].isSelected : false,
              isIncomplete: (state.childrenState && state.childrenState[key]) ? state.childrenState[key].isIncomplete : false,
              isExpanded: (state.childrenState && state.childrenState[key]) ? state.childrenState[key].isExpanded : false,
              isAddingFolder: (state.childrenState && state.childrenState[key]) ? state.childrenState[key].isAddingFolder : false,
              edge,
            };
          }
        });

        return {
          ...state,
          childrenState,
          search: count === previousCount ? state.search : '',
          count,
        };
    }
    /**
      sets worker
    */
    componentDidMount() {
      // window.addEventListener('resize', this._forceScrollerUpdate.bind(this));
      this.fileHandler = new FileFormatter(fileHandler);
      this.fileHandler.postMessage({ files: this.props.files.edges, search: this.state.search });
      this.fileHandler.addEventListener('message', (evt) => {
        if (this.state.fileHash !== evt.data.hash) {
          this.setState({ fileHash: evt.data.hash, files: evt.data.files })
        }
      })
    }

    /*
      resets search
    */
    componentDidUpdate() {
      if (this.list) {
        this.list.recomputeGridSize()
      }
      if (window.innerWidth < 1240) {
        this.refs.windowScroller.updatePosition()
      }
      let element = document.getElementsByClassName('FileBrowser__input')[0];
      if (this.state.search === '' && element.value !== '') {
        element.value = '';
      }
      this.fileHandler.postMessage({ files: this.props.files.edges, search: this.state.search });
    }
    /**
    *  @param {string} key - key of file to be updated
    *  @param {boolean} isSelected - update if the value is selected
    *  @param {boolean} isIncomplete - update if the value is incomplete
    *  @return {}
    */
    _updateChildState(key, isSelected, isIncomplete, isExpanded, isAddingFolder) {
      let isChildSelected = false;
      let count = 0;
      let selectedCount = 0;
      let { childrenState } = this.state;
      childrenState[key].isSelected = isSelected;
      childrenState[key].isIncomplete = isIncomplete;
      childrenState[key].isExpanded = isExpanded;
      childrenState[key].isAddingFolder = isAddingFolder;

      for (let key in childrenState) {
        if (childrenState[key]) {
          if (childrenState[key].isSelected) {
            isChildSelected = true;
            selectedCount++;
          }
          count++;
        }
      }

      let multiSelect = !isChildSelected ? 'none' : (selectedCount === count) ? 'all' : 'partial';

      this.setState({ childrenState, multiSelect });
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
    let filePaths = [];
    let dirList = [];
    let comparePaths = [];
    let edges = [];

    for (let key in this.state.childrenState) {
      if (this.state.childrenState[key].isSelected) {
        let { edge } = this.state.childrenState[key];
        delete this.state.childrenState[key];
        comparePaths.push(edge.node.key);
        filePaths.push(edge.node.key);
        edges.push(edge);
        if (edge.node.isDir) {
          dirList.push(edge.node.key);
        }
      }
    }

    let filteredPaths = filePaths.filter((key) => {
      let folderKey = key.substr(0, key.lastIndexOf('/'));
      folderKey = `${folderKey}/`;

      let hasDir = dirList.some(dir => ((key.indexOf(dir) > -1) && (dir !== key)));
      return !hasDir;
    });
    self._deleteMutation(filteredPaths, edges);
  }

  /**
  *  @param {}
  *  selects all or unselects files
  *  @return {}
  */
  _selectFiles() {
    let isSelected = false;
    let count = 0;
    let selectedCount = 0;

    for (let key in this.state.childrenState) {
      if (this.state.childrenState[key]) {
        if (this.state.childrenState[key].isSelected) {
          isSelected = true;
          selectedCount++;
        }
        count++;
      }
    }
    let multiSelect = (count === selectedCount) ? 'none' : 'all';

    let { childrenState } = this.state;

    for (let key in childrenState) {
      if (childrenState[key]) {
        childrenState[key].isSelected = (multiSelect === 'all');
        count++;
      }
    }
    this.setState({ multiSelect, childrenState });
  }

  /**
  *  @param {}
  *  triggers delete muatation
  *  @return {}
  */
  _deleteMutation(filePaths, edges) {
    const data = {
      filePaths,
      edges,
    };
    this.setState({ multiSelect: 'none' });
    this.state.mutations.deleteLabbookFiles(data, (response) => {});
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
    let isOver = this.props.isOverCurrent || this.props.isOver, // this.state.isOverChildFile,
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
  /**
  *  @param {evt}
  *  update state
  *  @return {}
  */
  _updateSearchState(evt) {
    this.setState({ search: evt.target.value });
  }

  /**
  *  @param {boolean} isOverChildFile
  *  update state to update drop zone
  *  @return {}
  */
  _updateDropZone(isOverChildFile) {
    this.setState({ isOverChildFile });
  }
  /**
  *  @param {Array, String, Boolean, Object, String} array, type, reverse, children, section
  *  returns sorted children
  *  @return {}
  */
 _childSort(array, type, reverse, children, section) {
    array.sort((a, b) => {
      let lowerA,
      lowerB;
      if (type === 'az' || type === 'size' && section === 'folder') {
        lowerA = a.toLowerCase();
        lowerB = b.toLowerCase();
        if (type === 'size' || !reverse) {
          return (lowerA < lowerB) ? -1 : (lowerA > lowerB) ? 1 : 0;
        }
        return (lowerA < lowerB) ? 1 : (lowerA > lowerB) ? -1 : 0;
      } else if (type === 'modified') {
        lowerA = children[a].edge.node.modifiedAt;
        lowerB = children[b].edge.node.modifiedAt;
        return reverse ? lowerB - lowerA : lowerA - lowerB;
      } else if (type === 'size') {
        lowerA = children[a].edge.node.size;
        lowerB = children[b].edge.node.size;
        return reverse ? lowerB - lowerA : lowerA - lowerB;
      }
      return 0;
    });
  return array;
}
  /**
  *  @param {String} Type
  *  handles state changes for type
  *  @return {}
  */
  _handleSort(type) {
    if (type === this.state.sort) {
      this.setState({ reverse: !this.state.reverse });
    } else {
      this.setState({ sort: type, reverse: false });
    }
  }
  _getRowHeight(index, keys, files, totalSize = 50) {
    let file = keys[index];
    const reference = files[file] && files[file].edge && files[file].edge.node.key || file;
    const isExpanded = reference && this.state.childrenState[reference] && this.state.childrenState[reference].isExpanded || false
    const addFolderSize = this.state.childrenState[reference] && this.state.childrenState[reference].isAddingFolder ? 50 : 0;
    let newTotalSize = totalSize
    if (isExpanded && files[file].children) {
      let childKeys = Object.keys(files[file].children)
      childKeys.forEach((child, index) => {
        newTotalSize += this._getRowHeight(index, childKeys, files[file].children, totalSize)
      })
    }
    return newTotalSize + addFolderSize;
  }

  render() {
    console.log('render file browser')
    const files = this.state.files,
          { mutationData } = this.state,
          { isOver } = this.props;
    let folderKeys = files && Object.keys(files).filter(child => files[child].edge && files[child].edge.node.isDir) || [];
    folderKeys = this._childSort(folderKeys, this.state.sort, this.state.reverse, files, 'folder');
    let fileKeys = files && Object.keys(files).filter(child => files[child].edge && !files[child].edge.node.isDir) || [];
    fileKeys = this._childSort(fileKeys, this.state.sort, this.state.reverse, files, 'files');
    let childrenKeys = folderKeys.concat(fileKeys);

   const { isSelected } = this._checkChildState();

   const fileBrowserCSS = classNames({
        FileBrowser: true,
        'FileBrowser--highlight': isOver,
        'FileBrowser--dropzone': fileKeys.length === 0,
      }),
      deleteButtonCSS = classNames({
        'Btn Btn--round Btn--delete': true,
        hidden: !isSelected,
      }),
      multiSelectButtonCSS = classNames({
        'Btn Btn--round': true,
        'Btn--check': this.state.multiSelect === 'all',
        'Btn--uncheck': this.state.multiSelect === 'none',
        'Btn--partial': this.state.multiSelect === 'partial',
      }),
      nameHeaderCSS = classNames({
      'FileBrowser__name-text': true,
      'FileBroser__sort--asc': this.state.sort === 'az' && !this.state.reverse,
      'FileBroser__sort--desc': this.state.sort === 'az' && this.state.reverse,
      }),
      sizeHeaderCSS = classNames({
      'FileBrowser__header--size': true,
      'FileBroser__sort--asc': this.state.sort === 'size' && !this.state.reverse,
      'FileBroser__sort--desc': this.state.sort === 'size' && this.state.reverse,
      }),
      modifiedHeaderCSS = classNames({
      'FileBrowser__header--date': true,
      'FileBroser__sort--asc': this.state.sort === 'modified' && !this.state.reverse,
      'FileBroser__sort--desc': this.state.sort === 'modified' && this.state.reverse,
      });
   const rowRenderer = ({
      index, // Index of row
      key, // Unique key within array of rendered rows
      style, // Style object to be applied to row (to position it);
      parent,
    }) => {
      let file = childrenKeys[index];
      const isDir = files[file] && files[file].edge && files[file].edge.node.isDir;
      const isFile = files[file] && files[file].edge && !files[file].edge.node.isDir;
      this.list = parent;
      return (
        <CellMeasurer
          key={key}
          cache={this.cache}
          parent={parent}
          columnIndex={0}
          rowIndex={index}
        >
          {
            isDir ?
              <Folder
                index={index}
                style={style}
                ref={file}
                filename={file}
                key={files[file].edge.node.key}
                multiSelect={this.state.multiSelect}
                mutationData={mutationData}
                data={files[file]}
                mutations={this.state.mutations}
                setState={this._setState}
                rowStyle={{}}
                sort={this.state.sort}
                reverse={this.state.reverse}
                childrenState={this.state.childrenState}
                listRef={parent}
                updateChildState={this._updateChildState}>
              </Folder>
            :
            isFile ?
            <File
              style={style}
              ref={file}
              filename={file}
              key={files[file].edge.node.key}
              multiSelect={this.state.multiSelect}
              mutationData={mutationData}
              data={files[file]}
              childrenState={this.state.childrenState}
              mutations={this.state.mutations}
              expanded
              isOverChildFile={this.state.isOverChildFile}
              updateParentDropZone={this._updateDropZone}
              updateChildState={this._updateChildState}>

            </File>
            : (children[file]) ?
            <div
              style={style}
              key={file + index}
            />
          :
            <div
              key={file + index}
              style={style}
            >
              Loading
            </div>
          }
      </CellMeasurer>);
    };

   return (
       this.props.connectDropTarget(<div className={fileBrowserCSS}>

                <div className="FileBrowser__tools flex justify--space-between">
                  <div className="FileBrowser__multiselect flex justify--start">
                    <button
                      className={multiSelectButtonCSS}
                      onClick={() => { this._selectFiles(); }} />
                    <button
                      className={deleteButtonCSS}
                      onClick={() => { this._deleteSelectedFiles(); }} />
                  </div>
                  <div className="FileBrowser__search flex-1">
                    <input
                      className="FileBrowser__input full--border"
                      type="text"
                      placeholder="Search Files Here"
                      onChange={(evt) => { this._updateSearchState(evt); } }
                      onKeyUp={(evt) => { this._updateSearchState(evt); } }
                    />
                  </div>
                </div>
                <div className="FileBrowser__header">
                    <div
                      className="FileBrowser__header--name flex justify--start"
                      onClick={() => this._handleSort('az')}
                    >
                      <div
                        className={nameHeaderCSS}
                      >
                        File
                      </div>
                    </div>

                    <div
                      className={sizeHeaderCSS}
                      onClick={() => this._handleSort('size')}
                    >
                        Size
                    </div>

                    <div
                      className={modifiedHeaderCSS}
                      onClick={() => this._handleSort('modified')}
                    >
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
                <WindowScroller
                  ref="windowScroller"
                >
                  {({
                    height,
                    isScrolling,
                    onChildScroll,
                    scrollTop,
                  }) => (
                    <AutoSizer disableHeight>
                    {({ width }) => (
                      <List
                        isScrolling={isScrolling}
                        onScroll={onChildScroll}
                        autoHeight
                        height={height}
                        scrollTop={scrollTop}
                        width={width}
                        rowCount={childrenKeys.length}
                        rowHeight={({ index }) => this._getRowHeight(index, childrenKeys, this.state.files)}
                        rowRenderer={(rowRenderer)}
                        deferredMeasurementCache={this.cache}
                        overscanRowCount={20}
                      />
                    )}
                  </AutoSizer>
                  )}
                </WindowScroller>
                { (childrenKeys.length === 0) &&
                  <div className="FileBrowser__empty">
                    {
                      this.state.search !== '' ?
                        <h5>No files match your search.</h5>
                        :
                        this.props.files.edges.length ?
                        <h5>Loading Files...</h5>
                        :
                        <h5>Upload Files by Dragging & Dropping Here</h5>
                  }
                  </div>
                }
            </div>
        </div>)
    );
  }
}


export default DropTarget(
    ['card', NativeTypes.FILE],
    Connectors.targetSource,
    Connectors.targetCollect,
  )(FileBrowser);
