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

      if (newKeyPath !== fileKeyPath) {
        if (newKey !== props.data.edge.node.key) {

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
  console.log(monitor, monitor.isDraggingSource(monitor.sourceId), monitor.isDragging())

  return {
    // connectDragPreview: connect.dragPreview(),
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
              dndItem.dirContent.then((fileList) => {
                  console.log(fileList);
                  if (fileList.length) {
                    let key = props.data.edge.node.key || props.fileKey;
                    path = key.substr(0, key.lastIndexOf('/') || key.length);
                    CreateFiles.createFiles(fileList.flat(), `${path}/`, props.mutationData);

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

      return {
       data: props.data,
      };
  },
};

function targetCollect(connect, monitor) {

  let currentTargetId = monitor.targetId;
  let isOverCurrent = monitor.isOver({ shallow: true });
  let isOver = monitor.isOver({});
  let currentTarget = monitor.internalMonitor.registry.dropTargets.get(currentTargetId);
  let canDrop = monitor.canDrop();
  let newLastTarget;

  let targetIds = monitor.internalMonitor.getTargetIds();

  let targets = targetIds.map(id => monitor.internalMonitor.registry.dropTargets.get(id));
  if (targets.length > 0) {
    let lastTarget = targets[targets.length - 1];
    if (lastTarget.props.data && !lastTarget.props.data.edge.node.isDir) {
      targets.pop();
    }
    newLastTarget = targets[targets.length - 1];
    isOver = (currentTargetId === newLastTarget.monitor.targetId);
  } else {
    isOver = false;
  }

  let dragItem;
  monitor.internalMonitor.registry.dragSources.forEach((item) => {
    // console.log(item.ref)
    if (item.ref && item.ref.current && item.ref.current.props.isDragging) {
      dragItem = item.ref.current
    }
  })

 // console.log(newLastTarget, dragItem)
  if (dragItem && newLastTarget) {
    let dragKeyArray = dragItem.props.data.edge.node.key.split('/')
    dragKeyArray.pop();

    let dragKeyPruned = dragKeyArray.join('/') === '' ? '' : `${dragKeyArray.join('/')}/`;

    let dropKey = newLastTarget.props.files ? '' : newLastTarget.props.data.edge.node.key;
    // console.log(dragKeyPruned, dropKey);
    canDrop = (dragKeyPruned !== dropKey);
    isOver = isOver && canDrop;
  }
  // if (!canDrop) {
  //   console.log(currentTarget);
  // }
   // console.log(currentTarget);
  return {
    connectDropTarget: connect.dropTarget(),
		canDrop,
    isOver,
    isOverCurrent,
  };
}

const Connectors = {
  dragSource,
  dragCollect,
  targetSource,
  targetCollect,
};

export default Connectors;
