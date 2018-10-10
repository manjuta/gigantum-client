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
          newFileName: '',
      };
      this._setSelected = this._setSelected.bind(this);
      this.connectDND = this.connectDND.bind(this);
      this._renameEditMode = this._renameEditMode.bind(this);
      this._triggerMutation = this._triggerMutation.bind(this);
      this._clearState = this._clearState.bind(this);
      this._clearInput = this._clearInput.bind(this);
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
  /**
  *  @param {}
  *  sets dragging state
  */
  _mouseDown() {
    this.setState({ isDragging: !this.state.isDragging });
  }

  /**
  *  @param {}
  *  sets dragging state
  */
  _renameEditMode(value) {
    this.setState({ renameEditMode: value });
  }

  /**
  *  @param {event}
  *  sets dragging state
  */
  _updateFileName(evt) {
    this.setState({
      newFileName: evt.target.value,
    });

    if (evt.key === 'Enter') {
      this._triggerMutation();
    }

    if (evt.key === 'Escape') {
      this._clearState();
    }
  }

  /**
  *  @param {}
  *  sets state on a boolean value
  *  @return {}
  */
  _clearState() {
    this.setState({
      newFileName: '',
      editMode: false,
    });
    console.log(this);
    // this.refs.renameInput.value = '';
  }

  /**
  *  @param {}
  *  sets state on a boolean value
  *  @return {}
  */
  _clearInput() {
    this.setState({
      newFileName: '',
    });

    // this.refs.renameInput.value = '';
  }

  /**
  *  @param {string, boolean}
  *  sets state on a boolean value
  *  @return {}
  */
  _triggerMutation() {
    let fileKeyArray = this.props.data.edge.node.key.split('/');
    fileKeyArray.pop();
    let folderKeyArray = fileKeyArray;
    console.log(folderKeyArray);
    let folderKey = folderKeyArray.join('/');

    const data = {
      newKey: `${folderKey}/${this.state.newFileName}`,
      edge: this.props.data.edge,
    };

    this.props.mutations.moveLabbookFile(data, (response) => {
       this._clearState();
    });
  }

  render() {
    const { node } = this.props.data.edge;
    const splitKey = node.key.split('/');

    const fileName = splitKey[splitKey.length - 1];
      const buttonCSS = classNames({
          File__btn: true,
          'File__btn--selected': this.state.isSelected,
      }),

      textIconsCSS = classNames({
        'File__cell File__cell--name': true,
        hidden: this.state.renameEditMode,
      }),
      renameCSS = classNames({
        'File__cell File__cell--edit': true,
        hidden: !this.state.renameEditMode,
      });

    let file = this.props.connectDragPreview(<div onMouseDown={() => { this._mouseDown(); }} className="File">

             <div className="File__row">

                <button
                    className={buttonCSS}
                    onClick={() => { this._setSelected(!this.state.isSelected); }}>
                </button>

                <div className={textIconsCSS}>

                  <div className={`File__icon ${fileIconsJs.getClass(fileName)}`}></div>

                  <div className="File__text">
                      {fileName}
                  </div>

                </div>

                <div className={renameCSS}>

                  <div className="File__container">
                    <input
                      ref={'renameInput'}
                      placeholder="Rename File"
                      type="text"
                      className="File__input"
                      onKeyUp={(evt) => { this._updateFileName(evt); }}
                    />
                    { (this.state.newFileName.length > 0) &&
                        <button
                          className="File__btn File__btn--clear"
                          onClick={() => { this._clearInput(); }}>
                          Clear
                        </button>
                      }
                  </div>
                  <button
                    className="file__btn File__btn--add"
                    onClick={() => { this._triggerMutation(); }}
                  />

                </div>

                <div className="File__cell File__cell--size">
                    {config.humanFileSize(node.size)}
                </div>

                <div className="File__cell File__cell--date">
                    {Moment((node.modifiedAt * 1000), 'x').fromNow()}
                </div>

                <div className="File__cell File__cell--menu">
                  <ActionsMenu
                    edge={this.props.data.edge}
                    mutationData={this.props.mutationData}
                    mutations={this.props.mutations}
                    renameEditMode={ this._renameEditMode }
                  />
                </div>

            </div>

        </div>);

    return (
      this.connectDND(file)
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
