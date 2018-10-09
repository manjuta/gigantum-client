// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import Moment from 'moment';
import { DragSource, DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
// components
import ActionsMenu from './ActionsMenu';
import File from './File';
import AddSubfolder from './AddSubfolder';
// assets
import './Folder.scss';
// components
import Connectors from './Connectors';


class Folder extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: props.isDragging,
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

    render() {
        const { node } = this.props.data.edge;
        const { children } = this.props.data;
        const childrenKeys = Object.keys(children);
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

        const folderNameCSS = classNames({
          'Folder__cell Folder__cell--name': true,
          'Folder__cell--open': this.state.expanded,
        })

        const splitKey = node.key.split('/');
        const folderName = splitKey[splitKey.length - 2];

        let folder = this.props.connectDragPreview(<div onMouseLeave={() => { this._mouseLeave(); }} onMouseEnter={() => { this._mouseEnter(); }} className="Folder">
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
                      <ActionsMenu />
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
                            if (children[file].children) {
                                return (
                                    <FolderDND
                                        key={children[file].edge.node.key}
                                        ref={children[file].edge.node.key}
                                        mutations={this.props.mutations}
                                        mutationData={this.props.mutationData}
                                        data={children[file]}
                                        isSelected={this.state.isSelected}
                                        setIncomplete={this._setIncomplete}
                                        checkParent={this._checkParent}>
                                    </FolderDND>
                                );
                            }
                            return (
                                <File
                                    mutations={this.props.mutations}
                                    mutationData={this.props.mutationData}
                                    ref={children[file].edge.node.key}
                                    data={children[file]}
                                    key={children[file].edge.node.key}
                                    isSelected={this.state.isSelected}
                                    checkParent={this._checkParent}>
                                </File>
                            );
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
