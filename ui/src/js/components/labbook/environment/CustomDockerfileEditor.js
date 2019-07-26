// vendor
import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
// Components
import CodeEditor from 'Components/labbook/renderers/CodeEditor';
import AddBundle from './AddBundle';
import BundledApp from './BundledApp';

class CustomDockerfileEditor extends Component {
  render() {
    const { props } = this;
    const showMissing = (props.dockerfileContent.length === 0) && (props.lastSavedDockerfileContent.length === 0) && (props.customAppFormList.length === 0);
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
          props.bundledApps.map((app) => {
            return (
              <BundledApp
                data={app}
                key={app.id}
                removeBundledApp={props.removeBundledApp}
              />
            );
          })
        }
        {
          props.customAppFormList.map((formData, index) => {
            return (
              <AddBundle
                key={formData.key}
                formData={formData}
                index={index}
                modifyCustomApp={props.modifyCustomApp}
              />
            );
          })
        }
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
    component.props.addCustomAppForm();
  },
};


export default DropTarget('card', fileTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(CustomDockerfileEditor);
