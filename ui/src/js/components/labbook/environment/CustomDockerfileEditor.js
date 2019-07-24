// vendor
import React, { Component } from 'react';
import { NativeTypes } from 'react-dnd-html5-backend';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
// Components
import CodeEditor from 'Components/labbook/renderers/CodeEditor';

class CustomDockerfileEditor extends Component {
  state = {
    showCustomAppForm: false,
  }

  /**
  *  @param {}
  *  showCustomAppForm set to true in state
  *  @return {}
  */
  _showCustomAppForm() {
    this.setState({ showCustomAppForm: true })
  }

  render() {
    const { props } = this;
    const showMissing = (props.dockerfileContent.length === 0) && (props.lastSavedDockerfileContent.length === 0);
    const value = showMissing ? '# Type commands here to modify your Docker environment \n' : props.dockerfileContent;
    let blockText = 'Drag and drop Docker Snippet blocks from the right';
    blockText = props.isOver ? 'Drop to add Docker Snippet block' : blockText;
    return props.connectDropTarget(
      <div className="CustomDockerfileEditor">
        <CodeEditor
          value={value}
          onValueChange={props.handleChange}
        />
        {
          (props.isOver || showMissing)
          && (
          <div className="CustomDockerfileEditor__blockMessage">
            <div className="CustomDockerfileEditor__message">{blockText}</div>
          </div>
          )
        }
      </div>,
    );
  }
}

const fileTarget = {
  drop(props, monitor, component) {
    console.log(component)
  },
};


export default DropTarget('card', fileTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(CustomDockerfileEditor);
