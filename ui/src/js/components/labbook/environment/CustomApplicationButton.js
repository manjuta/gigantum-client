// vendor
import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import classNames from 'classnames';
// Components
import CodeEditor from 'Components/labbook/renderers/CodeEditor';

class CustomApplicationButton extends Component {

  /**
  *  @param {Object} file
  *  parses requirements file
  *  @return {}
  */
  _parseFile(file) {
  }

  render() {
    const { props } = this;
    // console.log(props.isDragging)
    return props.connectDragSource(
      <div>
        <div className="CustomDockerfile__draggable CustomDockerfile__draggable--custom">
          Custom Application
        </div>
      </div>,
    );
  }
}

const cardSource = {
  canDrag(props) {
    // You can disallow drag based on props
    return true;
  },

  isDragging(props, monitor) {
    return monitor.getItem().id === props.id
  },

  beginDrag(props, monitor, component) {
    const item = { id: props.id }
    return item
  },
};
const collect = (connect, monitor) => {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),
    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging(),
  };
};


export default DragSource('card', cardSource, collect)(CustomApplicationButton);
