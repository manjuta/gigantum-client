// vendor
import React, { Component } from 'react';
import Moment from 'moment';
import fileIconsJs from 'file-icons-js';
import classNames from 'classnames';
import { DragSource, DropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
// components
import Connectors from './Connectors';
import ActionsMenu from './ActionsMenu';
// config
import config from 'JS/config';
// assets
import './File.scss';

class File extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: props.isDragging,
            isSelected: props.isSelected || false,
            stateSwitch: false,
        };
        this._setSelected = this._setSelected.bind(this);
        this.connectDND = this.connectDND.bind(this);
    }
    /**
    *  @param {boolean}
    *  sets elements to be selected and parent
    */
    _setSelected(isSelected) {
        this.setState({ isSelected }, () => {
            Object.keys(this.refs).forEach((ref) => {
                this.refs[ref]._setSelected();
            });
            if (this.props.checkParent) {
                this.props.checkParent();
            }
        });
    }
    /**
    *  @param {}
    *  sets elements to be selected and parent
    */
    connectDND(render) {
      // console.log(this.props);
      if (this.state.isDragging) {
        render = this.props.connectDragSource(render);
      } else {
        render = this.props.connectDropTarget(render);
      }
      // console.log('dragging', this.props.isDragging)
      return render;
    }
    _mouseDown() {
      this.setState({ isDragging: !this.state.isDragging });
    }

  render() {
    const { node } = this.props.data.edge;
    const splitKey = node.key.split('/');
    console.log(node, Moment((node.modifiedAt * 1000), 'x').fromNow())
    const fileName = splitKey[splitKey.length - 1];
    const buttonCSS = classNames({
        File__btn: true,
        'File__btn--selected': this.state.isSelected,
    });

    let row = this.props.connectDragPreview(<div onMouseDown={() => { this._mouseDown(); }} className="File">

             <div className="File__row">

                <button
                    className={buttonCSS}
                    onClick={() => { this._setSelected(!this.state.isSelected); }}>
                </button>

                <div className="File__cell File__cell--name">
                  <div className={`File__icon ${fileIconsJs.getClass(fileName)}`}>
                  </div>
                  <div className="File__text">
                      {fileName}
                  </div>
                </div>

                <div className="File__cell File__cell--size">
                    {config.humanFileSize(node.size)}
                </div>

                <div className="File__cell File__cell--date">
                    {Moment((node.modifiedAt * 1000), 'x').fromNow()}
                </div>
                <div className="File__cell File__cell--menu">
                  <ActionsMenu />
                </div>
            </div>

        </div>);

    return (
      this.connectDND(row)
    );
  }
}
// export default File
export default DragSource(
  'card',
  Connectors.dragSource,
  Connectors.dragCollect,
)(DropTarget(
    ['card', NativeTypes.FILE],
    Connectors.targetSource,
    Connectors.targetCollect,
  )(File));
