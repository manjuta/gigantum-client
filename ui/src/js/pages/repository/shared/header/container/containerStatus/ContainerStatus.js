// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
// store
import store from 'JS/redux/store';
import { setContainerState } from 'JS/redux/actions/labbook/overview/overview';
import { setContainerStatus, setContainerMenuVisibility } from 'JS/redux/actions/labbook/containerStatus';
import { setContainerMenuWarningMessage, setCloseEnvironmentMenus } from 'JS/redux/actions/labbook/environment/environment';
import { setPackageMenuVisible } from 'JS/redux/actions/labbook/environment/packageDependencies';
import { setBuildingState, setMergeMode, updateTransitionState } from 'JS/redux/actions/labbook/labbook';
import { setErrorMessage, setInfoMessage } from 'JS/redux/actions/footer';
// components
import Tooltip from 'Components/tooltip/Tooltip';
// assets
import './ContainerStatus.scss';

type Props = {
  containerMenuOpen: boolean,
  containerMutations: {
    buildImage: Function,
    cancelBuild: Function,
    startContainer: Function,
    stopContainer: Function,
  },
  containerStatus: string,
  creationDateUtc: string,
  imageStatus: string,
  isBuilding: boolean,
  isLocked: boolean,
  isLookingUpPackages: boolean,
  isSyncing: boolean,
  isPublishing: boolean,
  labbookId: string,
  labbook: {
    name: string,
    owner: string,
  },
}

class ContainerStatus extends Component<Props> {
  state = {
    status: '',
    isMouseOver: false,
    showDevList: false,
    attemptingRebuild: false,
  };

  static getDerivedStateFromProps(nextProps, state) {
    const displayTransitionState = nextProps.transitionState
      && nextProps.transitionState.length;
    const status = displayTransitionState
      ? nextProps.transitionState
      : state.status;
    return ({
      ...state,
      status,
    });
  }

  /**
  *  @param {}
  *  set fetch interval
  *  @return {string}
  */
  componentDidMount() {
    const {
      containerStatus,
      imageStatus,
      labbookId,
    } = this.props;
    const status = this._getContainerStatusText({
      containerStatus,
      imageStatus,
    });
    const hasLabbookId = store.getState().overview.containerStates[labbookId];

    if (hasLabbookId) {
      const storeStatus = store.getState().overview.containerStates[labbookId];

      if (storeStatus !== status) {
        setContainerState(labbookId, status);
      }
    }

    window.addEventListener('click', this._closePopupMenus);
  }

  /**
  *  @param {}
  *  clear interval to stop polling and clean up garbage
  */
  componentWillUnmount() {
    // memory clean up
    window.removeEventListener('click', this._closePopupMenus);
  }


  /**
   *  @param {event} evt
   *  closes menu box when menu is open and the menu has not been clicked on
   *
  */
  _closePopupMenus = (evt) => {
    const {
      containerMenuOpen,
    } = this.props;
    const {
      pluginsMenu,
      showDevList,
    } = this.state;
    // TODO fix this implementation, this is not sustainable.
    const containerMenuClicked = evt.target.getAttribute('data-container-popup') === 'true';

    if (!containerMenuClicked
    && containerMenuOpen) {
      setContainerMenuVisibility(false);
    }

    const pluginsMenuClicked = (evt.target.className.indexOf('ContainerStatus__plugins') > -1);
    if (!pluginsMenuClicked && pluginsMenu) {
      this.setState({
        pluginsMenu: false,
      });
    }

    if (showDevList && evt.target.className.indexOf('ContainerStatus__expand-tools') === -1) {
      this.setState({ showDevList: false });
    }
  }

  /**
    @param {string, string} containerStatus,imageStatus -
    get status by mixing containrSatus imagesStatus and state.status
    @return {string}
  */
  _getContainerStatusText = ({ containerStatus, imageStatus }) => {
    const {
      creationDateUtc,
      isBuilding,
    } = this.props;
    const {
      attemptingRebuild,
    } = this.state;
    const { state } = this;

    const labbookCreationDate = Date.parse(`${creationDateUtc}Z`);
    const timeNow = Date.parse(new Date());
    const timeDifferenceMS = timeNow - labbookCreationDate;

    let status = (containerStatus === 'RUNNING')
      ? 'Running'
      : containerStatus;
    status = (containerStatus === 'NOT_RUNNING')
      ? 'Stopped'
      : status;
    status = (imageStatus === 'BUILD_IN_PROGRESS' || imageStatus === 'BUILD_QUEUED')
      ? 'Building'
      : status;
    status = (imageStatus === 'BUILD_FAILED')
      ? 'Rebuild'
      : status;
    status = (imageStatus === 'DOES_NOT_EXIST')
      ? 'Rebuild'
      : status;
    status = (
      (imageStatus === 'DOES_NOT_EXIST')
      || isBuilding
      || (imageStatus === 'BUILD_IN_PROGRESS'))
      && (timeDifferenceMS < 15000)
      ? 'Building'
      : status;

    status = ((status === 'Stopped') && (state.status === 'Starting'))
      ? 'Starting'
      : status;
    status = ((status === 'Running') && (state.status === 'Stopping'))
      ? 'Stopping'
      : status;

    if (store.getState().containerStatus.status !== status) {
      setContainerStatus(status);
    }

    if ((status === 'Stopped') && attemptingRebuild) {
      this.setState({ attemptingRebuild: false });
      this._startContainerMutation(false);
    } else if ((status === 'Rebuild') && attemptingRebuild) {
      this.setState({ attemptingRebuild: false });
    }

    if ((status) && (status !== 'Stopped') && (status !== 'Rebuild')) {
      setCloseEnvironmentMenus();
      setPackageMenuVisible(false);
    }
    let cssClass = status;
    const constainerStatus = (status === 'Rebuild') ? 'Stopped' : status;
    cssClass = ((cssClass === 'Building') && (state.status === 'Canceling')) ? 'Canceling' : cssClass;

    return { constainerStatus, cssClass };
  }

  /**
    @param {}
    triggers stop container mutation
  */
  _stopContainerMutation = () => {
    const { containerMutations, labbook } = this.props;
    const { name, owner } = labbook;
    const self = this;

    setContainerMenuVisibility(false);

    containerMutations.stopContainer(
      {},
      (response, error) => {
        self.setState({
          imageStatus: 'EXISTS',
          containerStatus: 'NOT_RUNNING',
        });

        if (error) {
          setErrorMessage(owner, name, `There was a problem stopping ${name} container`, error);
        }
      },
    );
  }

  /**
    @param {}
    triggers stop build mutation
  */
  _cancelBuildMutation = () => {
    const { containerMutations } = this.props;
    const self = this;

    setContainerMenuVisibility(false);
    containerMutations.cancelBuild(
      () => {
        setTimeout(() => {
          self.setState({
            status: '',
            contanerMenuRunning: false,
          });
        }, 3000);
      },
    );
  }

  /**
    @param {}
    triggers start container mutation
  */
  _startContainerMutation = (launchDevTool) => {
    const { containerMutations, labbook } = this.props;
    const { name, owner } = labbook;
    const { selectedDevTool } = this.state;
    const self = this;
    const data = launchDevTool ? { devTool: selectedDevTool } : {};

    setCloseEnvironmentMenus();
    setPackageMenuVisible(false);
    setContainerMenuVisibility(false);

    containerMutations.startContainer(
      data,
      (response, error) => {
        self.setState({
          imageStatus: 'EXISTS',
          containerStatus: 'RUNNING',
        });

        if (error) {
          setErrorMessage(owner, name, `There was a problem starting ${name} container`, error);
          if (error[0].message.indexOf('404 Client Error') > -1) {
            self._rebuildContainer();
          }
        } else {
          setCloseEnvironmentMenus();
          setPackageMenuVisible(false);
        }
      },
    );
  }


  /**
    @param {string} status
    trigger mutatuion to stop or start container depdending on the state
    @return {string} newStatus
   */
  _containerAction = (status, cssStatus, evt) => {
    const { labbook, isLookingUpPackages } = this.props;
    const { owner, name } = labbook;

    if (!store.getState().labbook.isBuilding && !isLookingUpPackages) {
      if (status === 'Stop') {
        updateTransitionState(owner, name, 'Stopping');
        this.setState({ contanerMenuRunning: false });
        this._stopContainerMutation();
      } else if ((status === 'Start') && (cssStatus !== 'Rebuild')) {
        updateTransitionState(owner, name, 'Starting');
        this.setState({ contanerMenuRunning: false });
        setMergeMode(owner, name, false, false);
        this._startContainerMutation();
      } else if ((status === 'Start') || (status === 'Rebuild')) {
        this.setState({
          status: 'Building',
          contanerMenuRunning: false,
        });
        this._rebuildContainer(evt, status);
      }
    } else {
      setContainerMenuWarningMessage('Can\'t start container when environment is being edited');
    }

    if ((status === 'Cancel')) {
      this.setState({
        status: 'Canceling',
        contanerMenuRunning: false,
      });
      this._cancelBuildMutation();
    }
  }

  /**
    @param {} value
    shows message plugin menu
  */
  _openPluginMenu = () => {
    this.setState((state) => {
      const pluginsMenu = !state.pluginsMenu;
      return {
        pluginsMenu,
      };
    });
  }

  /**
    @param {boolean} value
    trigger mutatuion to stop or start container depdending on the state
  */
  _setMouseOverState = (value) => {
    this.setState({ isMouseOver: value });
  }

  /**
    @param {string} status
    trigger mutatuion to stop or start container depdending on the state
    @return {string} newStatus
  */
  _getStatusText = (status) => {
    const {
      isBuilding,
      isLookingUpPackages,
      isSyncing,
      isPublishing,
    } = this.props;
    const {
      isMouseOver,
    } = this.state;
    const { state } = this;
    let newStatus = status;

    newStatus = isMouseOver && (status === 'Running') ? 'Stop' : newStatus;
    newStatus = isMouseOver && ((status === 'Stopped') && !isLookingUpPackages)
      ? 'Start'
      : newStatus;
    newStatus = isMouseOver && (status === 'Rebuild') ? 'Rebuild' : newStatus;
    newStatus = isMouseOver && (status === 'Rebuild') ? 'Rebuild' : newStatus;

    newStatus = isBuilding ? 'Building' : newStatus;
    newStatus = isSyncing ? 'Syncing' : newStatus;
    newStatus = isPublishing ? 'Publishing' : newStatus;
    newStatus = (isMouseOver && (isBuilding || status === 'Building'))
      ? 'Cancel' : newStatus;
    newStatus = (
      (newStatus === 'Building' || newStatus === 'Cancel')
      && (state.status === 'Canceling'))
      ? 'Canceling'
      : newStatus;

    return newStatus;
  }

  /**
    @param {}
    triggers build image mutations with force === true
    @return {}
  */
  _rebuildContainer = () => {
    const { containerMutations } = this.props;
    const data = { noCache: true };

    setContainerMenuVisibility(false);

    this.setState({ imageStatus: 'BUILD_IN_PROGRESS', attemptingRebuild: true });

    containerMutations.buildImage(
      data,
      (response, error) => {
        if (error) {
          console.log(error);
        }
      },
    );
  }

  render() {
    const {
      containerMenuOpen,
      imageStatus,
      isBuilding,
      isLocked,
      isLookingUpPackages,
      isPublishing,
      isSyncing,
    } = this.props;
    const {
      isMouseOver,
    } = this.state;
    const { props, state } = this;
    const { constainerStatus, cssClass } = this._getContainerStatusText(this.props);
    const key = 'setStatus';
    const excludeStatuses = ['Stopping', 'Starting', 'Publishing', 'Syncing'];
    const notExcluded = (excludeStatuses.indexOf(constainerStatus) === -1);
    const status = this._getStatusText(constainerStatus);
    // declare css here
    const containerStatusCss = classNames({
      'ContainerStatus__container-state--menu-open': containerMenuOpen,
      'ContainerStatus__container-state': !containerMenuOpen,
      [cssClass]: !isBuilding && !isSyncing && !isPublishing,
      'Tooltip-data': (cssClass === 'Rebuild'),
      Building: (isBuilding || (imageStatus === 'BUILD_IN_PROGRESS')
        || (imageStatus === 'BUILD_QUEUED'))
        && state.status !== 'Canceling',
      Canceling: (state.status === 'Canceling')
        && ((props.isBuilding || (imageStatus === 'BUILD_IN_PROGRESS')
        || props.imageStatus === 'BUILD_QUEUED')),
      Syncing: isSyncing,
      Publishing: isPublishing,
      LookingUp: isLookingUpPackages,
      'ContainerStatus__container-state--expanded': isMouseOver && notExcluded && !props.isBuilding && !(state.imageStatus === 'BUILD_IN_PROGRESS'),
      'ContainerStatus__container-remove-pointer': !notExcluded || isSyncing || props.isPublishing || (isLocked && constainerStatus === 'Stopped'),
    });

    return (
      <div className="ContainerStatus flex flex--row">

        <div
          role="presentation"
          data-tooltip="Rebuild Required, container will attempt to rebuild before starting."
          onClick={evt => this._containerAction(status, cssClass, key)}
          key={key}
          className={containerStatusCss}
          onMouseOver={() => { this._setMouseOverState(true); }}
          onMouseOut={() => { this._setMouseOverState(false); }}
        >

          <div className="ContainerStatus__text">{ status }</div>
          <div className="ContainerStatus__toggle">
            <div className="ContainerStatus__toggle-btn" />
          </div>
        </div>

        { containerMenuOpen
          && <div className="ContainerStatus__menu-pointer" />
        }

        { containerMenuOpen
          && (
          <div className="ContainerStatus__button-menu" data-container-popup="true">
            { store.getState().environment.containerMenuWarning }
          </div>
          )
        }

        <Tooltip
          section="containerStatus"
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  containerMenuOpen: state.containerStatus.containerMenuOpen,
  isLookingUpPackages: state.containerStatus.isLookingUpPackages,
});

const mapDispatchToProps = dispatch => ({
  setContainerState,
  setContainerStatus,
  setContainerMenuVisibility,
  setBuildingState,
  setErrorMessage,
  setCloseEnvironmentMenus,
  setInfoMessage,
  setMergeMode,
  setContainerMenuWarningMessage,
});

export default connect(mapStateToProps, mapDispatchToProps)(ContainerStatus);
