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
          isSelected: props.isSelected || false,
      };
      console.log(this);
      this.connectDND = this.connectDND.bind(this);
  }

  static getDerivedStateFromProps(nextProps, nextState) {
      return {
          ...nextState,
          isSelected: nextProps.isSelected === undefined ? nextState.isSelected : nextProps.isSelected,
      };
  }

  connectDND(render) {
    console.log(this.props)
    if (this.props.isDragging) {
      render = this.props.connectDragSource(render);
    } else {
      render = this.props.connectDropTarget(render);
    }
    console.log('dragging', this.props.isDragging)
    return render;
  }

  render() {
    console.log(this);
    const fileInfo = this.props.data.data;
    const splitKey = fileInfo.key.split('/');
    const fileName = splitKey[splitKey.length - 1];
    const buttonCSS = classNames({
        File__btn: true,
        'File__btn--selected': this.state.isSelected,
    });

    let row = this.props.connectDragPreview(<div className="File">

             <div className="File__row">

                <button
                    className={buttonCSS}
                    onClick={() => this.setState({ isSelected: !this.state.isSelected })}>
                </button>

                <div className={`File__icon ${fileIconsJs.getClass(fileName)}`}>
                </div>

                <div>
                    {fileName}
                </div>

                <div>
                    {config.humanFileSize(fileInfo.size)}
                </div>

                <div>
                    {Moment((fileInfo.modified * 1000), 'x').fromNow()}
                </div>

                <ActionsMenu />
            </div>

        </div>);

    return (
      this.connectDND(row)
    );
  }
}
// export default File
export default DragSource(
  'file',
  Connectors.dragSource,
  Connectors.dragCollect,
)(DropTarget(
    ['file', 'folder', NativeTypes.FILE],
    Connectors.targetSource,
    Connectors.targetCollect,
  )(File));
