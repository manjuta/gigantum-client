// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import Moment from 'moment';
import { DragSource, DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import uuidv4 from 'uuid/v4';
// components
import ActionsMenu from './ActionsMenu';
import File from './File';
import AddSubfolder from './AddSubfolder';
// assets
import './Folder.scss';
// components
import Connectors from './../utilities/Connectors';


class Folder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: props.isDragging,
            expanded: false,
            isSelected: props.isSelected || false,
            isIncomplete: false,
            hoverId: '',
            isOver: false,
            prevIsOverState: false,
        };

        this._setSelected = this._setSelected.bind(this);
        this._setIncomplete = this._setIncomplete.bind(this);
        this._checkParent = this._checkParent.bind(this);
        this._checkRefs = this._checkRefs.bind(this);
        this._setState = this._setState.bind(this);
        this._setHoverState = this._setHoverState.bind(this);
    }


    static getDerivedStateFromProps(nextProps, state) {
      let isSelected = (nextProps.multiSelect === 'all')
        ? true
        : (nextProps.multiSelect === 'none')
        ? false
        : state.isSelected;
      return {
        ...state,
        isOver: nextProps.isOver,
        prevIsOverState: state.isOver,
        isSelected,
      };
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
    *  @param {boolean}
    *  sets child elements to be selected and current folder item
    *  @return {}
    */
    _setSelected(isSelected) {
        this.props.updateChildState(this.props.data.edge.node.key, isSelected);
        this.setState(
          {
            isSelected,
            isIncomplete: false,
          },
          () => {
              Object.keys(this.refs).forEach((ref) => {
                    const folder = this.refs[ref];

                    if (folder._setSelected) {
                      folder._setSelected(isSelected);
                    } else {
                      folder.getDecoratedComponentInstance().getDecoratedComponentInstance()._setSelected(isSelected);
                    }
              });
              if (this.props.checkParent) {
                  this.props.checkParent();
              }
          },
        );
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
            if (this.refs[ref].getDecoratedComponentInstance().getDecoratedComponentInstance().state.isSelected) {
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

    /**
    *  @param {event}
    *  sets item to expanded
    *  @return {}
    */
    _expandSection(evt) {
      if (!evt.target.classList.contains('Folder__btn') && !evt.target.classList.contains('ActionsMenu__item')) {
        this.setState({ expanded: !this.state.expanded });
      }
    }

    /**
    *  @param {}
    *  sets elements to be selected and parent
    */
    connectDND(render) {
      if (this.state.isDragging) {
        render = this.props.connectDragSource(render);
      } else {
        render = this.props.connectDropTarget(render);
      }

      return render;
    }
    /**
    *  @param {}
    *  sets dragging state
    */
    _mouseEnter() {
      this.setState({ isDragging: true });
    }

    /**
    *  @param {}
    *  sets dragging state
    */
    _mouseLeave() {
      this.setState({ isDragging: false });
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

      return (isOver);
    }

    /**
    *  @param {event, boolean}
    *  sets hover state
    *  @return {}
    */
    _setHoverState(evt, hover) {
      evt.preventDefault();
      evt.stopPropagation();
      this.setState({ hover });

      if (this.props.setParentHoverState && hover) {
        let fakeEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        this.props.setParentHoverState(fakeEvent, false);
      }
    }

    render() {
        const { node } = this.props.data.edge,
              { children } = this.props.data,
              childrenKeys = children ? Object.keys(children) : [],
              isOver = this._checkRefs(),
              splitKey = node.key.split('/'),
              folderName = this.props.filename,
              folderRowCSS = classNames({
                Folder__row: true,
                'Folder__row--expanded': this.state.expanded,
              }),

              buttonCSS = classNames({
                Folder__btn: true,
                'Folder__btn--selected': this.state.isSelected,
                'Folder__btn--incomplete': this.state.isIncomplete,
              }),

              folderChildCSS = classNames({
                Folder__child: true,
                hidden: !this.state.expanded,
              }),

              folderNameCSS = classNames({
                'Folder__cell Folder__cell--name': true,
                'Folder__cell--open': this.state.expanded,
              }),

              folderCSS = classNames({
                Folder: true,
                'Folder--highlight': isOver,
                'Folder--hover': this.state.hover,
                'Folder--background': this.props.isDragging,
              });


        let folder = this.props.connectDragPreview(<div
          onMouseOver={(evt) => { this._setHoverState(evt, true); }}
          onMouseOut={(evt) => { this._setHoverState(evt, false); }}
          onMouseLeave={() => { this._mouseLeave(); }}
          onMouseEnter={() => { this._mouseEnter(); }}
          className={folderCSS}>
                <div
                    className={folderRowCSS}
                    onClick={evt => this._expandSection(evt)}>
                    <button
                        className={buttonCSS}
                        onClick={() => this._setSelected(!this.state.isSelected)}>
                    </button>
                    <div className={folderNameCSS}>
                      <div className="Folder__icon">
                      </div>
                      <div className="Folder__name">
                          {folderName}
                      </div>
                    </div>
                    <div className="Folder__cell Folder__cell--size">

                    </div>
                    <div className="Folder__cell Folder__cell--date">
                        {Moment((node.modifiedAt * 1000), 'x').fromNow()}
                    </div>
                    <div className="Folder__cell Folder__cell--menu">
                      <ActionsMenu
                        edge={this.props.data.edge}
                        mutationData={this.props.mutationData}
                        mutations={this.props.mutations}
                        renameEditMode={ () => {} }
                      />
                    </div>
                </div>
                <div className={folderChildCSS}>
                    <AddSubfolder
                      key={`${node.key}__subfolder`}
                      folderKey={node.key}
                      mutationData={this.props.mutationData}
                      mutations={this.props.mutations}
                    />
                    {
                        childrenKeys.map((file) => {

                            if ((children && children[file] && children[file].edge && children[file].edge.node.isDir)) {
                                console.log(children[file].edge)
                                return (
                                    <FolderDND
                                        filename={file}
                                        key={children[file].edge.node.key}
                                        ref={children[file].edge.node.key}
                                        mutations={this.props.mutations}
                                        mutationData={this.props.mutationData}
                                        data={children[file]}
                                        isSelected={this.state.isSelected}
                                        multiSelect={this.props.multiSelect}
                                        setIncomplete={this._setIncomplete}
                                        checkParent={this._checkParent}
                                        setState={this._setState}
                                        setParentHoverState={this._setHoverState}
                                        updateChildState={this.props.updateChildState}>
                                    </FolderDND>
                                );
                            } else if ((children && children[file] && children[file].edge && !children[file].edge.node.isDir)) {
                              return (
                                  <File
                                      filename={file}
                                      mutations={this.props.mutations}
                                      mutationData={this.props.mutationData}
                                      ref={children[file].edge.node.key}
                                      data={children[file]}
                                      key={children[file].edge.node.key}
                                      isSelected={this.state.isSelected}
                                      multiSelect={this.props.multiSelect}
                                      checkParent={this._checkParent}
                                      setParentHoverState={this._setHoverState}
                                      updateChildState={this.props.updateChildState}>
                                  </File>
                              );
                            }
                            return (<div>Loading</div>)
                        })
                    }
                </div>

            </div>);

        return (
          this.connectDND(folder)
        );
    }
}

const FolderDND = DragSource(
  'card',
  Connectors.dragSource,
  Connectors.dragCollect,
)(DropTarget(
    ['card', NativeTypes.FILE],
    Connectors.targetSource,
    Connectors.targetCollect,
  )(Folder));

// export default File
export default FolderDND;
