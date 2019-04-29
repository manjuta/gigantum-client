// vendor
import React, { Component, Fragment } from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import { boundMethod } from 'autobind-decorator';
// store
import store from 'JS/redux/store';
import { setContainerMenuWarningMessage } from 'JS/redux/actions/labbook/environment/environment';
import { setMergeMode, setBuildingState, setStickyDate } from 'JS/redux/actions/labbook/labbook';
import { setCallbackRoute } from 'JS/redux/actions/routes';
// utils
import { getFilesFromDragEvent } from 'JS/utils/html-dir-content';
// config
import Config from 'JS/config';
// mutations
import LabbookContainerStatusMutation from 'Mutations/LabbookContainerStatusMutation';
import LabbookLookupMutation from 'Mutations/LabbookLookupMutation';
import BranchMutations from 'Components/shared/utils/BranchMutations';
// components
import Login from 'Components/login/Login';
import Loader from 'Components/common/Loader';
import ErrorBoundary from 'Components/common/ErrorBoundary';
import Header from 'Components/shared/header/Header';
import Migration from './Migration';
// query
import fetchMigrationInfoQuery from './queries/fetchMigrationInfoQuery';
import fetchPackageLatestVersion from './queries/fetchPackageLatestVersionQuery';
// assets
import './Labbook.scss';

let count = 0;

const Loading = () => <Loader />;

/*
 * Code splitting imports intended to boost initial load speed
*/

const Overview = Loadable({
  loader: () => import('./overview/LabbookOverviewContainer'),
  loading: Loading,
});
const Activity = Loadable({
  loader: () => import('./activity/LabbookActivityContainer'),
  loading: Loading,
});
const Code = Loadable({
  loader: () => import('./code/Code'),
  loading: Loading,
});
const InputData = Loadable({
  loader: () => import('./inputData/Input'),
  loading: Loading,
});
const OutputData = Loadable({
  loader: () => import('./outputData/Output'),
  loading: Loading,
});
const Environment = Loadable({
  loader: () => import('./environment/Environment'),
  loading: Loading,
});

class Labbook extends Component {
  constructor(props) {
  	super(props);

    localStorage.setItem('owner', store.getState().routes.owner);
    // bind functions here
    this._toggleBranchesView = this._toggleBranchesView.bind(this);
    this._branchViewClickedOff = this._branchViewClickedOff.bind(this);

    setCallbackRoute(props.location.pathname);
  }

  state = {
    isLocked: (this.props.labbook.environment.containerStatus !== 'NOT_RUNNING') || (this.props.labbook.environment.imageStatus === 'BUILD_IN_PROGRESS') || (this.props.labbook.environment.imageStatus === 'BUILD_QUEUED') || this.props.isBuilding || this.props.isSynching || this.props.isPublishing,
    collaborators: this.props.labbook.collaborators,
    canManageCollaborators: this.props.labbook.canManageCollaborators,
    branches: this.props.labbook.branches,
    deletedBranches: [],
    branchMutations: new BranchMutations({
      parentId: this.props.labbook.id,
      name: this.props.labbook.name,
      owner: this.props.labbook.owner,
    }),
    isDeprecated: null,
    shouldMigrate: null,
    buttonState: '',
    packageLatestVersions: [],
    isFetchingPackages: false,
    queuePackageFetch: false,
    activeBranchName: this.props.labbook.activeBranchName,
  }

  static getDerivedStateFromProps(nextProps, state) {
    setCallbackRoute(nextProps.location.pathname);
    const propBranches = nextProps.labbook && nextProps.labbook.branches ? nextProps.labbook.branches : [];
    const stateBranches = state.branches;
    const branchMap = new Map();
    const mergedBranches = [];
    const newDeletedBranches = state.deletedBranches.slice();

    propBranches.forEach((branch) => {
      if (newDeletedBranches.indexOf(branch.id) === -1) {
        branchMap.set(branch.id, branch);
      }
    });
    stateBranches.forEach((branch) => {
      if (branchMap.has(branch.id)) {
        const itemReference = branchMap.get(branch.id);
        const newItem = Object.assign({}, branch, itemReference);
        branchMap.set(branch.id, newItem);
      } else {
        newDeletedBranches.push(branch.id);
      }
    });
    branchMap.forEach((branch) => {
      mergedBranches.push(branch);
    });
    const isLocked = (nextProps.labbook && nextProps.labbook.environment.containerStatus !== 'NOT_RUNNING') || (nextProps.labbook.environment.imageStatus === 'BUILD_IN_PROGRESS') || (nextProps.labbook.environment.imageStatus === 'BUILD_QUEUED') || nextProps.isBuilding || nextProps.isSynching || nextProps.isPublishing;

    return {
      ...state,
      deletedBranches: newDeletedBranches,
      branches: mergedBranches,
      canManageCollaborators: nextProps.labbook ? nextProps.labbook.canManageCollaborators : false,
      collaborators: nextProps.labbook ? nextProps.labbook.collaborators : [],
      isLocked,
    };
  }

  /**
    @param {}
    subscribe to store to update state
    set unsubcribe for store
  */
  componentDidMount() {
    const { props, state } = this;
    const { name, owner } = props.labbook;

    this.mounted = true;
    document.title = `${owner}/${name}`;
    props.auth.isAuthenticated().then((response) => {
      let isAuthenticated = response;
      if (isAuthenticated === null) {
        isAuthenticated = false;
      }
      if ((isAuthenticated !== state.authenticated) && this.mounted) {
        this.setState({ authenticated: isAuthenticated });
      }
    });

    this._fetchPackageVersion();
    this._fetchMigrationInfo();

    this._setStickHeader();
    this._fetchStatus(true);

    window.addEventListener('scroll', this._setStickHeader);
    window.addEventListener('click', this._branchViewClickedOff);
  }

  componentDidUpdate(prevProps, prevState) {
    const { props, state } = this;
    const { activeBranchName } = props.labbook;

    if (activeBranchName !== state.activeBranchName) {
      this.setState({ activeBranchName });

      this._fetchPackageVersion();
    }
  }

  /**
    @param {}
    removes event listeners
  */
  componentWillUnmount() {
    this.mounted = false;
    window.removeEventListener('scroll', this._setStickHeader);

    window.removeEventListener('click', this._branchViewClickedOff);
  }


  /**
    @param {}
    gets latest version for packages
  */
  @boundMethod
  _fetchPackageVersion() {
    const { props, state } = this;
    const { owner, name } = props.labbook;
    const currentTimestamp = new Date().getTime();
    const timestamp = localStorage.getItem('latestVersionTimestamp');
    const delayRefetch = timestamp && ((currentTimestamp - timestamp) < 120000);

    if (!state.isFetchingPackages && !delayRefetch) {
      this.setState({ isFetchingPackages: true });
      const date = new Date();
      localStorage.setItem('latestVersionTimestamp', date.getTime());

      fetchPackageLatestVersion.getPackageVersions(owner, name, 1000, null).then((response, error) => {
        if (response && response.labbook) {
          const packageLatestVersions = response.labbook.environment.packageDependencies.edges;
          this.setState({ packageLatestVersions });
        }
        localStorage.setItem('latestVersionTimestamp', 0);
        if (state.queuePackageFetch) {
          this.setState({
            isFetchingPackages: false,
            queuePackageFetch: false,
          });
          this._fetchPackageVersion();
        } else {
          this.setState({
            isFetchingPackages: false,
            queuePackageFetch: false,
          });
        }
      });
    } else {
      this.setState({ queuePackageFetch: true });
    }
  }

  /**
  *  @param {object} - response
  *  update state from switch mutation
  *  @return {}
  */
  @boundMethod
  _updateMigrationState(response) {
    if (response && response.workonExperimentalBranch) {
      const { isDeprecated, shouldMigrate } = response.workonExperimentalBranch.labbook;
      this.setState({
        isDeprecated,
        shouldMigrate,
      });
    }
  }

  /**
   * @param {}
   * checks if project is deprecated and should migrate and sets state
  */
  _fetchMigrationInfo() {
    const { props } = this;
    const { owner, name } = props.labbook;
    const self = this;

    fetchMigrationInfoQuery.getLabook(owner, name).then((response) => {
      if (response.labbook) {
        const {
          isDeprecated,
          shouldMigrate,
        } = response.labbook;
        self.setState({
          isDeprecated,
          shouldMigrate,
        });
      }
    });
  }

  /**
  *  @param {}
  *  fetches status of labbook container and image
  *  sets state of labbook using redux and containerStatus using setState
  *  @return {}
  */
  _fetchStatus(isLabbookUpdate) {
    const { props } = this;
    const { owner, name } = props.labbook;
    const self = this;
    const { isBuilding } = props;

    if (this.mounted) {
      if (!isLabbookUpdate) {
        LabbookContainerStatusMutation(owner, name, (error, response) => {
          if (response && response.fetchLabbookEdge && response.fetchLabbookEdge.newLabbookEdge) {
            const { environment } = response.fetchLabbookEdge.newLabbookEdge.node;
            if ((environment.imageStatus !== 'BUILD_IN_PROGRESS') && isBuilding) {
              setBuildingState(false);
            }
          }
          setTimeout(() => {
            const canLabbookUpdate = (count === 20);
            self._fetchStatus(canLabbookUpdate);
            count = canLabbookUpdate ? 0 : (count + 1);
          }, 3 * 1000);
        });
      } else {
        LabbookLookupMutation(owner, name, (error, response) => {
          if (response && response.fetchLabbookEdge && response.fetchLabbookEdge.newLabbookEdge) {
            const {
              branches,
              collaborators,
              canManageCollaborators,
            } = response.fetchLabbookEdge.newLabbookEdge.node;
            self.setState({
              branches,
              collaborators,
              canManageCollaborators,
            });
          }
          setTimeout(() => {
            const canLabbookUpdate = (count === 20);
            self._fetchStatus(canLabbookUpdate);
            count = canLabbookUpdate ? 0 : (count + 1);
          }, 3 * 1000);
        });
      }
    }
  }

  /**
    @param {event}
    updates state of labbook when prompted ot by the store
    updates history prop
  */
  _branchViewClickedOff(evt) {
    if (evt.target.className.indexOf('Labbook__veil') > -1) {
      this._toggleBranchesView(false, false);
    }
  }

  /**
    sets branch uptodate in state
  */
  @boundMethod
  _setBranchUptodate() {
    const { branches } = this.state;
    const activePosition = branches.map(branch => branch.isActive).indexOf(true);
    const branchesClone = branches.slice();
    branchesClone[activePosition].commitsBehind = 0;
    branchesClone[activePosition].commitsAhead = 0;
    this.setState({ branches: branchesClone });
  }

  /**
    @param {}
    dispatches sticky state to redux to update state
  */
  _setStickHeader() {
    this.offsetDistance = window.pageYOffset;
    const sticky = 50;
    const isSticky = window.pageYOffset >= sticky;
    if (store.getState().labbook.isSticky !== isSticky) {
      setStickyDate(isSticky);
    }

    if (isSticky) {
      setMergeMode(false, false);
    }
  }

  /**
    @param {boolean, boolean}
    updates branchOpen state
  */
  @boundMethod
  _toggleBranchesView(branchesOpen, mergeFilter) {
    if (store.getState().containerStatus.status !== 'Running') {
      setMergeMode(branchesOpen, mergeFilter);
    } else {
      setContainerMenuWarningMessage('Stop Project before switching branches. \n Be sure to save your changes.');
    }
  }

  /**
    scrolls to top of window
  */
  _scrollToTop() {
    window.scrollTo(0, 0);
  }

  /**
    @param {boolean}
    updates migration button via callback from migration component
  */
  @boundMethod
  _showMigrationButtonCallback(showMigrationButton) {
    const { state } = this;
    if (state.showMigrationButton !== showMigrationButton) {
      this.setState({ showMigrationButton });
    }
  }

  render() {
    const { props, state } = this;
    const { showMigrationButton } = state;
    const isLocked = props.isBuilding || props.isSyncing || props.isPublishing || state.isLocked;
    const isLockedBrowser = {
      locked: (props.isPublishing || props.isSyncing || props.isExporting),
      isPublishing: props.isPublishing,
      isExporting: props.isExporting,
      isSyncing: props.isSyncing,
      isLocked,
    };

    if (props.labbook) {
      const { labbook, branchesOpen } = props;
      const sidePanelVisible = !isLocked && props.sidePanelVisible;
      const branchName = '';
      const isDemo = window.location.hostname === Config.demoHostName;

      const labbookCSS = classNames({
        Labbook: true,
        'Labbook--detail-mode': props.detailMode,
        'Labbook--branch-mode': branchesOpen,
        'Labbook--demo-mode': isDemo,
        'Labbook--deprecated': state.isDeprecated,
        'Labbook--demo-deprecated': state.isDeprecated && isDemo,
        'Labbook--sidePanelVisible': sidePanelVisible,
      });

      return (
        <div className={labbookCSS}>
          <div id="labbook__cover" className="Labbook__cover hidden">
            <Loader />
          </div>
          <div className="Labbook__spacer flex flex--column">
            <Migration
              labbook={labbook}
              isDemo={isDemo}
              isLocked={props.isLocked}
              isDeprecated={state.isDeprecated}
              shouldMigrate={state.shouldMigrate}
              showMigrationButtonCallback={this._showMigrationButtonCallback}
            />
            <Header
              {...props}
              description={labbook.description}
              toggleBranchesView={this._toggleBranchesView}
              sectionType="labbook"
              containerStatus={labbook.environment.containerStatus}
              imageStatus={labbook.environment.imageStatus}
              isLocked={isLocked}
              collaborators={state.collaborators}
              canManageCollaborators={state.canManageCollaborators}
              visibility={labbook.visibility}
              defaultRemote={labbook.defaultRemote}
              branches={state.branches}
              setBranchUptodate={this._setBranchUptodate}
              isDeprecated={state.isDeprecated}
              updateMigationState={this._updateMigrationState}
              sidePanelVisible={sidePanelVisible}
              showMigrationButton={showMigrationButton}
            />

            <div className="Labbook__routes flex flex-1-0-auto">

              <Switch>
                <Route
                  exact
                  path={`${props.match.path}`}
                  render={() => (
                    <ErrorBoundary type="labbookSectionError">
                      <Overview
                        key={`${props.labbookName}_overview`}
                        labbook={labbook}
                        labbookId={labbook.id}
                        isSyncing={props.isSyncing}
                        isPublishing={props.isPublishing}
                        scrollToTop={this._scrollToTop}
                        sectionType="labbook"
                        history={props.history}
                      />
                    </ErrorBoundary>
                  )}
                />

                <Route path={`${props.match.path}/:labbookMenu`}>

                  <Switch>

                    <Route
                      path={`${props.match.path}/overview`}
                      render={() => (

                        <ErrorBoundary
                          type="labbookSectionError"
                          key="overview"
                        >
                          <Overview
                            key={`${props.labbookName}_overview`}
                            labbook={labbook}
                            description={labbook.description}
                            labbookId={labbook.id}
                            isSyncing={props.isSyncing}
                            isPublishing={props.isPublishing}
                            scrollToTop={this._scrollToTop}
                            sectionType="labbook"

                            history={props.history}
                          />
                        </ErrorBoundary>
                      )}
                    />

                    <Route
                      path={`${props.match.path}/activity`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="activity"
                        >
                          <Activity
                            key={`${props.labbookName}_activity`}
                            labbook={labbook}
                            activityRecords={props.activityRecords}
                            labbookId={labbook.id}
                            branchName={branchName}
                            description={labbook.description}
                            activeBranch={labbook.activeBranchName}
                            isMainWorkspace={branchName === 'master'}
                            sectionType="labbook"
                            isLocked={isLocked}
                            isDeprecated={state.isDeprecated}
                            {...props}
                          />
                        </ErrorBoundary>
                      )}
                    />

                    <Route
                      path={`${props.match.url}/environment`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="environment"
                        >
                          <Environment
                            key={`${props.labbookName}_environment`}
                            labbook={labbook}
                            labbookId={labbook.id}
                            containerStatus={this.refs.ContainerStatus}
                            overview={labbook.overview}
                            isLocked={isLocked}
                            packageLatestVersions={state.packageLatestVersions}
                            fetchPackageVersion={this._fetchPackageVersion}
                            {...props}
                          />
                        </ErrorBoundary>
                      )}
                    />

                    <Route
                      path={`${props.match.url}/code`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="code"
                        >
                          <Code
                            labbook={labbook}
                            labbookId={labbook.id}
                            setContainerState={this._setContainerState}
                            isLocked={isLockedBrowser}
                            section="code"
                          />
                        </ErrorBoundary>
                      )}
                    />

                    <Route
                      path={`${props.match.url}/inputData`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="input"
                        >
                          <InputData
                            labbook={labbook}
                            labbookId={labbook.id}
                            isLocked={isLockedBrowser}
                            section="input"
                          />
                        </ErrorBoundary>
                      )}
                    />

                    <Route
                      path={`${props.match.url}/outputData`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="output"
                        >
                          <OutputData
                            labbook={labbook}
                            labbookId={labbook.id}
                            isLocked={isLockedBrowser}
                            section="output"
                          />
                        </ErrorBoundary>
                      )}
                    />

                  </Switch>

                </Route>

              </Switch>

            </div>

          </div>
          <div className="Labbook__veil" />

        </div>
      );
    }

    if (state.authenticated) {
      return (<Loader />);
    }

    return (<Login auth={props.auth} />);
  }
}

const mapStateToProps = state => state.labbook;

const mapDispatchToProps = () => ({ setBuildingState });

const LabbookContainer = connect(mapStateToProps, mapDispatchToProps)(Labbook);


const LabbookFragmentContainer = createFragmentContainer(
  LabbookContainer,
  {
    labbook: graphql`
      fragment Labbook_labbook on Labbook {
          id
          description
          defaultRemote
          owner
          name
          creationDateUtc
          visibility
          activeBranchName

          environment{
            containerStatus
            imageStatus
            base{
              developmentTools
            }
          }

          overview{
            remoteUrl
            numAptPackages
            numConda2Packages
            numConda3Packages
            numPipPackages
          }

         branches {
           id
           owner
           name
           branchName
           isActive
           isLocal
           isRemote
         }

          ...Environment_labbook
          ...LabbookOverviewContainer_labbook
          ...LabbookActivityContainer_labbook
          ...Code_labbook
          ...Input_labbook
          ...Output_labbook

      }`,
  },
);

/** *
  * @param {Object} manager
  * data object for reactDND
*/

const backend = (manager) => {
  const backend = HTML5Backend(manager);


  const orgTopDropCapture = backend.handleTopDropCapture;

  backend.handleTopDropCapture = (e) => {
    if (backend.currentNativeSource) {
      orgTopDropCapture.call(backend, e);
      backend.currentNativeSource.item.dirContent = getFilesFromDragEvent(e, { recursive: true }); // returns a promise
    }
  };

  return backend;
};

export default DragDropContext(backend)(LabbookFragmentContainer);
