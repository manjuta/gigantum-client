import React from 'react';
import { DragSource } from 'react-dnd';
import uuidv4 from 'uuid/v4';
// utilities
import CreateFiles from './../utilities/CreateFiles';

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

  beginDrag(props, monitor) {
    console.log(monitor.isDragging(), props);
    return {
      isDragging: true,
      data: props.data,
    };
  },

  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {
      return;
    }

    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();

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
        const moveLabbookFileData = {
          newKey,
          edge: props.data.edge,
        };
        props.mutations.moveLabbookFile(moveLabbookFileData, (response) => {
          console.log(response)
        });
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
    const dndItem = monitor.getItem();

    let newPath,
        fileKey,
        path,
        files;

    if (dndItem && props.data) {
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

                     if (fileList) {
                        CreateFiles.createFiles(fileList, `${path}/`, props.mutationData);
                     }
                     files = fileList;
                  } else if (dndItem.files && dndItem.files.length) {
                       // handle dragged files
                       let key = props.newKey || props.fileKey;
                       path = key.substr(0, key.lastIndexOf('/') || key.length);
                       let item = monitor.getItem();

                       if (item && item.files && props.browserProps.createFiles) {
                         CreateFiles.createFiles(item.files, `${path}/`, props.mutationData);
                       }
                       newPath = null;
                       fileKey = null;
                  }
              });
          }
      } else {
          // uploads to root directory
          let item = monitor.getItem();
          console.log(component)
          CreateFiles.createFiles(item.files, '', component.state.mutationData);
      }

      return {
       data: props.data,
      };
  },
  // hover(props, monitor, component) {
  //   // // This is fired very often and lets you perform side effects
  //   // // in response to the hover. You can't handle enter and leave
  //   // // here—if you need them, put monitor.isOver() into collect() so you
  //   // // can just use componentWillReceiveProps() to handle enter/leave.
  //   //
  //   // // You can access the coordinates if you need them
  //   // const clientOffset = monitor.getClientOffset();
  //   // const componentRect = findDOMNode(component).getBoundingClientRect();
  //   //
  //   // // You can check whether we're over a nested drop target
  //   // const isJustOverThisOne = monitor.isOver({ shallow: true });
  //   //
  //   // // You will receive hover() even for items for which canDrop() is false
  //   // const canDrop = monitor.canDrop();
  //   // console.log(component);
  //   if (component._setState) {
  //     component._setState('hoverId', uuidv4());
  //   }
  // },
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
