import React from 'react';
import { DragSource } from 'react-dnd';
import { createFiles } from './../utilities/FileBrowserMethods'

const dragSource = {

 canDrag(props) {
   // You can disallow drag based on props
   return true;
 },

 isDragging(props, monitor) {
    // If your component gets unmounted while dragged
    // (like a card in Kanban board dragged between lists)
    // you can implement something like this to keep its
    // appearance dragged:
    // console.log(props, monitor)
    return monitor.getItem().key === props.key;
  },

  beginDrag(props) {
    // console.log(props);
    return {
      isDragging: true,
      data: props.data,
    };
  },

  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {

      // console.log(monitor)
      return;
    }
    console.log(props, monitor, component)
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    console.log(monitor.getDropResult())
    let fileNameParts = props.data.edge.node.key.split('/');

    let fileName = fileNameParts[fileNameParts.length - 1];

    let pathArray = dropResult.data.edge.node.key.split('/');
    pathArray.pop();
    let path = pathArray.join('/');

    let newKey = path ? `${path}/${fileName}` : `${fileName}`;

    let newKeyArray = dropResult.data.edge.node.key.split('/');
    let fileKeyArray = props.data.edge.node.key.split('/');

    newKeyArray.pop();
    fileKeyArray.pop();

    let newKeyPath = newKeyArray.join('/');
    let fileKeyPath = fileKeyArray.join('/');

    newKeyPath = newKeyPath.replace(/\/\/\/g/, '/');

    if (newKeyPath !== fileKeyPath) {
      if ((newKey !== props.data.edge.node.key)) {
        console.log('move file', newKey, props.data.edge.node.key)
        // props.browserProps.openFolder(`${dropResult.path}/`);
        // props.browserProps.renameFile(props.fileKey, newKey);
      }
    }
  },
};

function dragCollect(connect, monitor) {
  // console.log(connect, monitor)
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

const targetSource = {
  canDrop(props, monitor) {
     // You can disallow drop based on props or item
     const item = monitor.getItem();
     return true;
  },
  drop(props, monitor, component) {
    console.log(props);
    const dndItem = monitor.getItem();

    let newPath,
        fileKey,
        path,
        files;
    // console.log(dndItem)
    if (dndItem) {
          if (!dndItem.dirContent) {
              fileKey = props.data.edge.node.key;

              const fileNameParts = fileKey.split('/');
              const fileName = fileNameParts[fileNameParts.length - 1];
              let newKey = props.newKey || props.fileKey;
              newPath = newKey + fileName;
              fileKey = props.fileKey;
          } else {
              dndItem.dirContent.then((fileList: Object[]) => {
                  if (fileList.length) {
                    let key = props.data.edge.node.key || props.fileKey;
                    path = key.substr(0, key.lastIndexOf('/') || key.length);

                     // handle dragged folder(s)
                     // create files
                     console.log(fileList, props)
                     if (fileList) {
                        createFiles(fileList, `${path}/`, props.mutationData);
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
       data: props.data,
      };
  },
};

function targetCollect(connect, monitor) {
  // console.log(connect, monitor);
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
		canDrop: true,
  };
}

const Connectors = {
  dragSource,
  dragCollect,
  targetSource,
  targetCollect,
};
// console.log(this)
export default Connectors;
