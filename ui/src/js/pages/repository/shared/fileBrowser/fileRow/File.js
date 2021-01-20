// @flow
// vendor
import React, { Component } from 'react';
import Moment from 'moment';
import { getClass } from 'file-icons-js';
import classNames from 'classnames';
import { DragSource } from 'react-dnd';
import ReactTooltip from 'react-tooltip';
import MiddleTruncate from 'react-middle-truncate/lib/react-middle-truncate';
// config
import config from 'JS/config';
// store
import { setMergeMode, updateTransitionState } from 'JS/redux/actions/labbook/labbook';
import { setErrorMessage, setInfoMessage, setWarningMessage } from 'JS/redux/actions/footer';
// mutations
import StartContainerMutation from 'Mutations/container/StartContainerMutation';
import StartDevToolMutation from 'Mutations/container/StartDevToolMutation';
// components
import PopupBlocked from 'Components/modal/popup/PopupBlocked';
import ActionsMenu from './ActionsMenu';
import DatasetActionsMenu from './dataset/DatasetActionsMenu';
// utils
import Connectors from '../utilities/Connectors';
// assets
import './File.scss';

/**
*  @param {String} fileName
*  gets dev tool to be launched
*/
const getDevTool = (fileName) => {
  const isNotebook = fileName.split('.')[fileName.split('.').length - 1] === 'ipynb';
  // TODO remove hard coded references when api is updated
  const isRFile = fileName.split('.')[fileName.split('.').length - 1] === 'Rmd';
  let devTool = '';

  if (isNotebook) {
    devTool = 'JupyterLab';
  }
  if (isRFile) {
    devTool = 'Rstudio';
  }

  return {
    devTool,
    isNotebook,
    isRFile,
  };
};

const getIsSelected = (props) => {
  const childState = props.childrenState[props.fileData.edge.node.key];
  const isSelected = props.isSelected || (childState && childState.isSelected);
  return (isSelected || false);
};

type Props = {
  checkParent: Function,
  connectDragSource: Function,
  containerStatus: string,
  fileData :{
    edge: {
      node: {
        id: string,
        isLocal: boolean,
        key: string,
        modifiedAt: string,
        size: string,
      },
    },
    index: boolean,
  },
  filename: string,
  isDragging: boolean,
  isDownloading: boolean,
  mutationData: Object,
  mutations: {
    moveDatasetFile: Function,
    moveLabbookFile: Function,
  },
  name: string,
  owner: string,
  parentDownloading: boolean,
  readOnly: boolean,
  section: string,
  setFolderIsDownloading: Function,
  setParentDragFalse: Function,
  setParentDragTrue: Function,
  setParentHoverState: Function,
  style: Object,
  updateChildState: Function,
}

class File extends Component<Props> {
  state = {
    isDragging: this.props.isDragging,
    isSelected: getIsSelected(this.props),
    stateSwitch: false,
    newFileName: this.props.filename,
    renameEditMode: false,
    hover: false,
    forceUpdate: false,
    showPopupBlocked: false,
  };

  static getDerivedStateFromProps(nextProps, state) {
    let { isSelected } = state;

    if ((nextProps.multiSelect === 'all') && !state.forceUpdate) {
      isSelected = true;
    }
    if (nextProps.multiSelect === 'none') {
      isSelected = false;
    }

    if ((nextProps.isOverCurrent !== nextProps.isOverChildFile)
    && !nextProps.isDragging && state.hover) {
      nextProps.updateParentDropZone(nextProps.isOverCurrent);
    }
    return {
      ...state,
      isSelected,
      forceUpdate: false,
    };
  }

  componentDidUpdate() {
    const { state } = this;
    if (state.renameEditMode) {
      this.reanmeInput.focus();
    }
  }

  /**
  *  @param {boolean} isSelected - sets if file has been selected
  *  sets elements to be selected and parent
  */
  _setSelected = (evt, isSelected) => {
    const { props } = this;
    props.updateChildState(props.fileData.edge.node.key, isSelected, false);
    this.setState({ isSelected, forceUpdate: true }, () => {
      Object.keys(this.refs).forEach((ref) => {
        this.refs[ref].getDecoratedComponentInstance().getDecoratedComponentInstance()._setSelected();
      });
      if (props.checkParent) {
        props.checkParent();
      }
    });
  }

  /**
   * sets state for popup modal
   */
  _togglePopupModal = () => {
    this.setState({ showPopupBlocked: false });
  }

  /**
    *  @param {}
    *  sets dragging state
    */
  _mouseEnter = () => {
    const { isDragging, isHovered } = this.state;
    const { setParentDragFalse } = this.props;

    if (setParentDragFalse) {
      setParentDragFalse();
    }
    if (isDragging && isHovered) {
      this.setState({ isDragging: true, isHovered: true });
    }
  }

  /**
    *  @param {String} devTool
    *  @param {Boolean} forceStart
    *  launches dev tool to appropriate file
    */
  _openDevTool = (devTool, forceStart) => {
    if (process.env.BUILD_TYPE !== 'cloud') {
      const { props } = this;
      const { owner, name } = props;
      const { showPopupBlocked } = this.state;
      const status = props.containerStatus;
      const tabName = `${devTool}-${owner}-${name}`;

      if ((status !== 'NOT_RUNNING') && (status !== 'RUNNING')) {
        setWarningMessage(owner, name, 'Could not launch development environment as the project is not ready.');
      } else if (status === 'NOT_RUNNING' && !forceStart) {
        setInfoMessage(owner, name, 'Starting Project container. When done working, click Stop to shutdown the container.');
        updateTransitionState(owner, name, 'Starting');
        setMergeMode(owner, name, false, false);

        StartContainerMutation(
          owner,
          name,
          (response, error) => {
            if (error) {
              setErrorMessage(owner, name, `There was a problem starting ${name} container`, error);
            } else {
              this._openDevTool(devTool, true);
            }
          },
        );
      } else {
        setInfoMessage(owner, name, `Starting ${devTool}, make sure to allow popups.`);
        StartDevToolMutation(
          owner,
          name,
          devTool,
          (response, error) => {
            if (response.startDevTool) {
              let path = `${window.location.protocol}//${window.location.hostname}${response.startDevTool.path}`;
              if (path.includes(`/lab/tree/${props.section}`)) {
                path = path.replace(`/lab/tree/${props.section}`, `/lab/tree/${props.section}/${props.fileData.edge.node.key}`);
              } else if (props.fileData.edge.node.key.indexOf('.Rmd') === -1) {
                path = `${path}/lab/tree/${props.section}/${props.fileData.edge.node.key}`;
              }

              window[tabName] = window.open(path, tabName);
              window[tabName].close();
              window[tabName] = window.open(path, tabName);

              if (
                !window[tabName]
                || window[tabName].closed
                || typeof window[tabName].closed === 'undefined'
              ) {
                this.setState({ showPopupBlocked: true });
              } else if (showPopupBlocked) {
                this.setState({ showPopupBlocked: false });
              }
            }

            if (error) {
              setErrorMessage(owner, name, 'Error Starting Dev tool', error);
            }
          },
        );
      }
    }
  }

  /**
  *  @param {}
  *  sets dragging state
  */
  _mouseLeave = () => {
    const { isDragging, isHovered } = this.state;
    const { setParentDragTrue } = this.props;
    if (setParentDragTrue) {
      setParentDragTrue();
    }
    if (!isDragging && !isHovered) {
      this.setState({ isDragging: false, isHovered: false });
    }
  }

  /**
  *  @param {}
  *  sets dragging state to true
  */
  _checkHover = () => {
    const { isHovered, isDragging } = this.state;
    if (isHovered && !isDragging) {
      this.setState({ isDragging: true });
    }
  }

  /**
  *  @param {boolean} renameEditMode
  *  sets dragging state
  */
  _renameEditMode = (renameEditMode) => {
    this.setState({ renameEditMode });
  }

  /**
  *  @param {Object} evt
  *  sets dragging state
  */
  _updateFileName = (evt) => {
    this.setState({
      newFileName: evt.target.value,
    });
  }

  /**
  *  @param {Object} evt
  *  sets dragging state
  *  @return {}
  */
  _submitRename = (evt, fileName) => {
    const { newFileName } = this.state;

    if ((evt.key === 'Enter') && (newFileName !== fileName)) {
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
  _clearState = () => {
    const { props } = this;
    this.setState({
      newFileName: props.filename,
      renameEditMode: false,
    });
  }

  /**
  *  @param {}
  *  triggers move mutation and clearState function
  *  @return {}
  */
  _triggerMutation = () => {
    const { props, state } = this;
    const fileKeyArray = props.fileData.edge.node.key.split('/');
    fileKeyArray.pop();
    const folderKeyArray = fileKeyArray;
    const folderKey = folderKeyArray.join('/');
    const newKey = (folderKey.length > 0)
      ? `${folderKey}/${state.newFileName}` : state.newFileName;

    this._clearState();

    if (props.fileData.edge.node.key !== newKey) {
      const data = {
        newKey: `${folderKey}/${state.newFileName}`,
        edge: props.fileData.edge,
        removeIds: [props.fileData.edge.node.id],
      };

      if (props.section !== 'data') {
        props.mutations.moveLabbookFile(data, () => {
          this._clearState();
        });
      } else {
        props.mutations.moveDatasetFile(data, () => {
          this._clearState();
        });
      }
    }
  }

  /**
  *  @param {object} event
  *  @param {boolean} hover - hover state for mouseover
  *  sets hover state
  *  @return {}
  */
  _setHoverState = (evt, hover) => {
    const { props, state } = this;
    evt.preventDefault();

    if (state.hover !== hover) {
      this.setState({ hover });
    }

    if (props.setParentHoverState && hover) {
      props.setParentHoverState(evt, !hover);
    }
  }

  /**
  *  @param {String} isLaunchable
  *  @param {String} devTool
  *  checks if devtool is launchable
  *  @return {}
  */
  _validateFile = (isLaunchable, devTool) => {
    if (isLaunchable) {
      this._openDevTool(devTool);
    }
  }

  render() {
    const {
      newFileName,
      renameEditMode,
      isSelected,
      hover,
      showPopupBlocked,
    } = this.state;
    const {
      connectDragSource,
      readOnly,
      fileData,
      filename,
      section,
      isDragging,
      style,
    } = this.props;

    const { node } = fileData.edge;
    const { index } = fileData;
    const cantDrag = !fileData.edge.node.isLocal && (section === 'data');
    const paddingLeft = 40 * index;
    const rowStyle = { paddingLeft: `${paddingLeft}px` };
    const {
      devTool,
      isNotebook,
      isRFile,
    } = getDevTool(filename);
    const isLaunchable = isNotebook || isRFile;
    const addButtonDisabled = (newFileName === filename);
    // declare css here
    const fileRowCSS = classNames({
      File__row: true,
      'File__row--hover': hover,
      'File__row--noDrag': isDragging && cantDrag,
      'File__row--canDrag': isDragging && !cantDrag,
    });
    const buttonCSS = classNames({
      CheckboxMultiselect: true,
      CheckboxMultiselect__uncheck: !isSelected,
      CheckboxMultiselect__check: isSelected,
    });
    const textIconsCSS = classNames({
      'File__cell File__cell--name': true,
      hidden: renameEditMode,
    });
    const renameCSS = classNames({
      'File__cell File__cell--edit': true,
      hidden: !renameEditMode,
    });

    const file = (
      <div
        style={style}
        onMouseOver={(evt) => { this._setHoverState(evt, true); }}
        onMouseOut={(evt) => { this._setHoverState(evt, false); }}
        onMouseLeave={() => { this._mouseLeave(); }}
        onMouseEnter={() => { this._mouseEnter(); }}
        className="File"
      >
        {
          showPopupBlocked
          && (
            <PopupBlocked
              togglePopupModal={this._togglePopupModal}
              devTool={devTool}
              attemptRelaunch={() => this._validateFile(isLaunchable, devTool)}
            />
          )
        }
        <div
          className={fileRowCSS}
          style={rowStyle}
        >
          {
            !readOnly
            && (
            <button
              type="button"
              className={buttonCSS}
              onClick={(evt) => { this._setSelected(evt, !isSelected); }}
            />
            )
          }
          <div className={textIconsCSS}>

            <div className={`File__icon ${getClass(filename)}`} />

            <div
              className="File__text"
              role="presentation"
              onClick={() => this._validateFile(isLaunchable, devTool)}
              data-tip={filename}
              data-for="Tooltip--file"
            >
              {
                filename
                && (
                  <MiddleTruncate
                    ellipsis="..."
                    text={filename}
                    smartCopy
                  />
                )
              }
            </div>
            <ReactTooltip
              place="bottom"
              id="Tooltip--file"
              delayShow={500}
            />
          </div>

          <div className={renameCSS}>

            <div className="File__container">
              <input
                draggable
                ref={(input) => { this.reanmeInput = input; }}
                value={newFileName}
                type="text"
                className="File__input"
                maxLength="255"
                onClick={(evt) => { evt.preventDefault(); evt.stopPropagation(); }}
                onDragStart={(evt) => { evt.preventDefault(); evt.stopPropagation(); }}
                onChange={(evt) => { this._updateFileName(evt); }}
                onKeyDown={(evt) => { this._submitRename(evt, filename); }}
              />
            </div>
            <div className="flex justify-space-around">
              <button
                type="button"
                className="File__btn--round File__btn--cancel File__btn--rename-cancel"
                onClick={() => { this._clearState(); }}
              />
              <button
                type="button"
                className="File__btn--round File__btn--add File__btn--rename-add"
                disabled={addButtonDisabled}
                onClick={() => { this._triggerMutation(); }}
              />
            </div>
          </div>

          <div className="File__cell File__cell--size">
            {config.humanFileSize(node.size)}
          </div>

          <div className="File__cell File__cell--date">
            {Moment((node.modifiedAt * 1000), 'x').fromNow()}
          </div>

          <div className="File__cell File__cell--menu">
            {
              !readOnly
              && (
              <ActionsMenu
                edge={fileData.edge}
                renameEditMode={this._renameEditMode}
                {...this.props}
              />
              )
            }
            {
              (section === 'data')
              && (
              <DatasetActionsMenu
                edge={fileData.edge}
                renameEditMode={this._renameEditMode}
                isLocal={fileData.edge.node.isLocal}
                {...this.props}
              />
              )
            }
          </div>

        </div>
      </div>
    );

    if (!readOnly) {
      return (
        connectDragSource(file)
      );
    }
    return file;
  }
}

const FileDnD = DragSource(
  'card',
  Connectors.dragSource,
  Connectors.dragCollect,
)((File));


export default FileDnD;
