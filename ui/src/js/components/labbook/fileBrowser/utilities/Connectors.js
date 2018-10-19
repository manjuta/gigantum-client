import React from 'react';
import { DragSource } from 'react-dnd';
import uuidv4 from 'uuid/v4';
import FileBrowserMutations from './FileBrowserMutations';
// utilities
import CreateFiles from './../utilities/CreateFiles';
// store
import store from 'JS/redux/store';

const dragSource = {

 canDrag(props) {
   // You can disallow drag based on props
   return true;
 },

 isDragging(props, monitor) {
    return monitor.getItem().key === props.key;
  },

  beginDrag(props, monitor) {
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
    if (dropResult.data) {
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
      console.log(newKeyPath, fileKeyPath)
      if (newKeyPath !== fileKeyPath) {
        if ((newKey !== props.data.edge.node.key)) {

          const moveLabbookFileData = {
            newKey,
            edge: props.data.edge,
          };

          if (props.mutations) {
            props.mutations.moveLabbookFile(moveLabbookFileData, (response) => {
              console.log(response);
            });
          } else {
            const {
              parentId,
              connection,
              favoriteConnection,
              section,
            } = props;
            const { owner, labbookName } = store.getState().routes;

            const mutationData = {
              owner,
              labbookName,
              parentId,
              connection,
              favoriteConnection,
              section,
            };

            const mutations = new FileBrowserMutations(mutationData);

            mutations.moveLabbookFile(moveLabbookFileData, (response) => {
              console.log(response);
            });
          }
        }
      }
    }
  },
};

function dragCollect(connect, monitor) {
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.getSourceId() === monitor.sourceId,
  };
}

const targetSource = {
  canDrop(props, monitor) {
     // You can disallow drop based on props or item
     const item = monitor.getItem();
     return monitor.isOver({ shallow: true });
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
                    console.log('move')
                     if (fileList) {
                        CreateFiles.createFiles(fileList, `${path}/`, props.mutationData);
                     }
                     files = fileList;
                  } else if (dndItem.files && dndItem.files.length) {
                      console.log('drop')
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

          if (item.files) {
            CreateFiles.createFiles(item.files, '', component.state.mutationData);
          } else {
            const dropResult = monitor.getDropResult();
            let currentKey = item.data.edge.node.key;
            let splitKey = currentKey.split('/');
            let newKey = (splitKey[splitKey.length - 1] !== '') ? splitKey[splitKey.length - 1] : splitKey[splitKey.length - 2];
            newKey = `${newKey}/`;

            if ((newKey !== item.data.edge.node.key)) {
              const moveLabbookFileData = {
                newKey,
                edge: item.data.edge,
              };
              if (props.mutations) {
                console.log(props)
                props.mutations.moveLabbookFile(moveLabbookFileData, (response) => {
                  console.log(response);
                });
              } else {
                console.log(newKey, item.data.edge.node.key)
                const {
                  parentId,
                  connection,
                  favoriteConnection,
                  section,
                } = props;
                const { owner, labbookName } = store.getState().routes;

                const mutationData = {
                  owner,
                  labbookName,
                  parentId,
                  connection,
                  favoriteConnection,
                  section,
                };

                const mutations = new FileBrowserMutations(mutationData);

                mutations.moveLabbookFile(moveLabbookFileData, (response) => {
                  console.log(response);
                });
              }
            }
          }
      }

      return {
       data: props.data,
      };
  },
};

function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
		canDrop: true,
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
  };
}

const Connectors = {
  dragSource,
  dragCollect,
  targetSource,
  targetCollect,
};

export default Connectors;
