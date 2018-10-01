import React from 'react';
import { DragSource } from 'react-dnd';

const dragSource = {
  beginDrag(props) {
    console.log(props);
    return {
      isDragging: true,
      key: props.data.data.key,
    };
  },

  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {

      console.log(monitor)
      return;
    }

    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

    let fileNameParts = props.fileKey.split('/');

    let fileName = fileNameParts[fileNameParts.length - 1];

    let pathArray = dropResult.fileKey.split('/');
    pathArray.pop();
    let path = pathArray.join('/');

    let newKey = path ? `${path}/${fileName}` : `${fileName}`;

    let newKeyArray = dropResult.newKey.split('/');
    let fileKeyArray = props.fileKey.split('/');

    newKeyArray.pop();
    fileKeyArray.pop();

    let newKeyPath = newKeyArray.join('/');
    let fileKeyPath = fileKeyArray.join('/');

    newKeyPath = newKeyPath.replace(/\/\/\/g/, '/');

    if (newKeyPath !== fileKeyPath) {
      if ((newKey !== props.fileKey) && props.browserProps.renameFile) {
        props.browserProps.openFolder(`${dropResult.path}/`);
        props.browserProps.renameFile(props.fileKey, newKey);
      }
    }
  },
};

function dragCollect(connect, monitor) {

  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: true, // monitor.isDragging(),
  };
}

const targetSource = {
  drop(props, monitor) {
    console.log(props);
    const dndItem = monitor.getItem();

    let newPath,
        fileKey,
        path,
        files;
    console.log(dndItem)
    if (dndItem) {
          if (!dndItem.dirContent) {
              fileKey = props.browserProps.selection;

              const fileNameParts = fileKey.split('/');
              const fileName = fileNameParts[fileNameParts.length - 1];
              let newKey = props.newKey || props.fileKey;
              newPath = newKey + fileName;
              fileKey = props.fileKey;
          } else {
              dndItem.dirContent.then((fileList: Object[]) => {
                  if (fileList.length) {
                    let key = props.newKey || props.fileKey;
                    path = key.substr(0, key.lastIndexOf('/') || key.length);

                     // handle dragged folder(s)
                     if (fileList && props.browserProps.createFiles) {
                          props.browserProps.createFiles(fileList, `${path}/`);
                     }
                     files = fileList;
                  } else if (dndItem.files && dndItem.files.length) {
                       // handle dragged files
                       let key = props.newKey || props.fileKey;
                       path = key.substr(0, key.lastIndexOf('/') || key.length);
                       let item = monitor.getItem();

                       if (item && item.files && props.browserProps.createFiles) {
                         props.browserProps.createFiles(item.files, `${path}/`);
                       }
                       newPath = null;
                       fileKey = null;
                  }
              });
          }
      }

      return {
        newPath,
        fileKey,
        path,
        files,
      };
  },
};

function targetCollect(connect, monitor) {
  console.log(connect);
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
		canDrop: monitor.canDrop(),
  };
}

const Connectors = {
  dragSource,
  dragCollect,
  targetSource,
  targetCollect,
};
console.log(this)
export default Connectors;
