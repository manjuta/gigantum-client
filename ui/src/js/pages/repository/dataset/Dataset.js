// @flow
// vendor
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { createRefetchContainer, graphql } from 'react-relay';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
// store
import store from 'JS/redux/store';
import { setStickyState } from 'JS/redux/actions/dataset/dataset';
import { setCallbackRoute } from 'JS/redux/actions/routes';
// utils
import { getFilesFromDragEvent } from 'JS/utils/html-dir-content';
// components
import Login from 'Pages/login/Login';
import Loader from 'Components/loader/Loader';
import ErrorBoundary from 'Components/errorBoundary/ErrorBoundary';
import Header from 'Pages/repository/shared/header/Header';
// assets
import './Dataset.scss';

const Loading = () => <Loader />;

const Overview = Loadable({
  loader: () => import('./overview/DatasetOverviewContainer'),
  loading: Loading,
  delay: 500,
});

const Activity = Loadable({
  loader: () => import('./activity/DatasetActivityContainer'),
  loading: Loading,
  delay: 500,
});

const Data = Loadable({
  loader: () => import('./data/Data'),
  loading: Loading,
  delay: 500,
});

/**
  scrolls to top of window
*/
const scrollToTop = () => {
  window.scrollTo(0, 0);
};

/**
*  @param {Object} props
*
*  gets value of isLocked to lock out functionality while the backend is synching
*/
const getIsLocked = (props) => {
  const isLocked = props.isSyncing
    || props.isExporting
    || props.isUploading
    || props.globalIsUploading;
  return isLocked;
};


type Props = {
  activityRecords: Array,
  auth: {
    isAuthenticated: Function,
  },
  dataset: {
    activeBranch: string,
    description: string,
    id: string,
    name: string,
    owner: string,
    datasetType: {
      isManaged: boolean,
    }
  },
  datasetName: string,
  detailMode: string,
  diskLow: boolean,
  globalIsUploading: boolean,
  location: {
    pathname: string,
  },
  match: {
    path: string,
  },
  relay: {
    refetch: Function,
  }
}

class Dataset extends Component<Props> {
  constructor(props) {
    super(props);
    const { name, owner } = props.dataset;
    localStorage.setItem('owner', owner);

    setCallbackRoute(props.location.pathname);

    document.title = `${owner}/${name}`;
  }

  state = {
    activitySkip: true,
    uploadAllowed: false,
    datasetSkip: true,
    dataSkip: true,
    overviewSkip: true,
  };

  /**
    @param {object} nextProps
    @param {object} state
    calls setCallbackRoute on prop change
  */
  static getDerivedStateFromProps(nextProps, state) {
    setCallbackRoute(nextProps.location.pathname);
    return state;
  }

  /**
    @param {} -
    subscribe to store to update state
    set unsubcribe for store
  */
  componentDidMount() {
    const { auth } = this.props;
    auth.isAuthenticated().then((response) => {
      let isAuthenticated = response;
      if (isAuthenticated === null) {
        isAuthenticated = false;
      }
      if (isAuthenticated !== this.state.authenticated) {
        this.setState({ authenticated: isAuthenticated });
      }
    });

    this._setStickHeader();
    window.addEventListener('scroll', this._setStickHeader);
  }

  /**
    @param {}
    removes event listeners
  */
  componentWillUnmount() {
    window.removeEventListener('scroll', this._setStickHeader);
  }

  /**
    @param {}
    dispatches sticky state to redux to update state
  */
  _setStickHeader = () => {
    const { owner, name } = this.props.dataset;
    const isExpanded = (window.pageYOffset < this.offsetDistance)
      && (window.pageYOffset > 120);
    const sticky = 50;
    const isSticky = window.pageYOffset >= sticky;

    this.offsetDistance = window.pageYOffset;

    if ((store.getState().dataset.isSticky !== isSticky)
      || (store.getState().dataset.isExpanded !== isExpanded)) {
      setStickyState(owner, name, isSticky);
    }
  }

  /**
   @param {String} section
   refetch dataset
   */
  _refetchDataset = (section) => {
    const { dataset, relay } = this.props;
    const {
      activitySkip,
      dataSkip,
      overviewSkip,
    } = this.state;
    const currentSection = `${section}Skip`;
    const currentState = {
      activitySkip,
      overviewSkip,
      dataSkip,
    };
    const sections = ['overview', 'activity', 'data'];
    const queryVariables = {
      datasetID: dataset.id,
      [currentSection]: false,
    };
    const renderVariables = {
      datasetID: dataset.id,
      ...currentState,
      [currentSection]: false,
    };
    const remainingQueryVariables = {
      datasetID: dataset.id,
      datasetSkip: false,
    };
    const remainingRenderVariables = {
      datasetID: dataset.id,
      datasetSkip: false,
    };
    const newState = {
      datasetSkip: true,
    };
    const options = {
      force: true,
    };

    sections.forEach((fragmentSection) => {
      const remainingSection = `${fragmentSection}Skip`;
      if (fragmentSection !== section) {
        remainingQueryVariables[remainingSection] = false;
        newState[remainingSection] = false;
      }
      remainingRenderVariables[remainingSection] = false;
    });

    const refetchCallback = () => {
      this.setState({ [currentSection]: false });
      relay.refetch(
        remainingQueryVariables,
        remainingRenderVariables,
        () => {
          this.setState(newState);
        },
        options,
      );
    };

    if (this.state[currentSection]) {
      relay.refetch(queryVariables, renderVariables, refetchCallback, options);
    }
  }

  /**
  *  @param {Object} props
  *
  *  checks to see if user can upload files
  */
  allowFileUpload = (collaboratorProps) => {
    const { dataset } = this.props;
    const { uploadAllowed } = this.state;
    if (
      collaboratorProps
      && collaboratorProps.dataset
      && collaboratorProps.dataset.collaborators
    ) {
      const { collaborators } = collaboratorProps.dataset;
      if (collaborators.length) {
        collaborators.forEach((collaborator) => {
          const username = localStorage.getItem('username');
          if (
            (username === collaborator.collaboratorUsername)
            && (collaborator.permission !== 'READ_ONLY')
            && !uploadAllowed
          ) {
            this.setState({ uploadAllowed: true });
          }
        });
      }

      if (dataset && (dataset.defaultRemote === null) && !uploadAllowed) {
        this.setState({ uploadAllowed: true });
      }
    }
  };

  render() {
    const {
      activityRecords,
      auth,
      dataset,
      datasetName,
      detailMode,
      diskLow,
      globalIsUploading,
      match,
    } = this.props;
    const { owner, name } = dataset;
    const {
      authenticated,
      uploadAllowed,
    } = this.state;
    if (dataset) {
      const isLocked = getIsLocked(this.props);
      // declare css here
      const datasetCSS = classNames({
        Dataset: true,
        'Dataset--detail-mode': detailMode,
        'Dataset--disk-low': diskLow,
      });

      return (
        <div className={datasetCSS}>

          <div className="Dataset__spacer flex flex--column">

            <Header
              allowFileUpload={this.allowFileUpload}
              description={dataset.description}
              toggleBranchesView={() => {}}
              branchName=""
              dataset={dataset}
              sectionType="dataset"
              isLocked={isLocked}
              {...this.props}
              owner={owner}
              name={name}
            />

            <div className="Dataset__routes flex flex-1-0-auto">

              <Switch>
                <Route
                  exact
                  path={`${match.path}`}
                  render={() => (
                    <ErrorBoundary type="datasetSectionError" key="overview">
                      <Overview
                        key={`${datasetName}_overview`}
                        dataset={dataset}
                        isManaged={dataset.datasetType.isManaged}
                        datasetId={dataset.id}
                        scrollToTop={scrollToTop}
                        sectionType="dataset"
                        datasetType={dataset.datasetType}
                        refetch={this._refetchDataset}
                        owner={owner}
                        name={name}
                      />
                    </ErrorBoundary>
                  )}
                />

                <Route path={`${match.path}/:datasetMenu`}>

                  <Switch>

                    <Route
                      path={`${match.path}/overview`}
                      render={() => (
                        <ErrorBoundary
                          type="datasetSectionError"
                          key="activity"
                        >

                          <Overview
                            key={`${datasetName}_overview`}
                            dataset={dataset}
                            isManaged={dataset.datasetType.isManaged}
                            datasetId={dataset.id}
                            scrollToTop={scrollToTop}
                            sectionType="dataset"
                            datasetType={dataset.datasetType}
                            refetch={this._refetchDataset}
                            owner={owner}
                            name={name}
                          />

                        </ErrorBoundary>
                      )}
                    />

                    <Route
                      path={`${match.path}/activity`}
                      render={() => (
                        <ErrorBoundary
                          type="datasetSectionError"
                          key="activity"
                        >
                          <Activity
                            key={`${datasetName}_activity`}
                            dataset={dataset}
                            diskLow={diskLow}
                            activityRecords={activityRecords}
                            datasetId={dataset.id}
                            activeBranch={dataset.activeBranch}
                            sectionType="dataset"
                            refetch={this._refetchDataset}
                            owner={owner}
                            name={name}
                            {...this.props}
                          />
                        </ErrorBoundary>
                      )}
                    />

                    <Route
                      path={`${match.url}/data`}
                      render={() => (
                        <ErrorBoundary
                          type="datasetSectionError"
                          key="code"
                        >

                          <Data
                            dataset={dataset}
                            owner={owner}
                            name={name}
                            datasetId={dataset.id}
                            isManaged={dataset.datasetType.isManaged}
                            type="dataset"
                            section="data"
                            refetch={this._refetchDataset}
                            lockFileBrowser={globalIsUploading || isLocked}
                            uploadAllowed={uploadAllowed}
                          />

                        </ErrorBoundary>
                      )}
                    />

                  </Switch>

                </Route>

              </Switch>

            </div>

          </div>

          <div className="Dataset__veil" />

        </div>
      );
    }

    if (authenticated) {
      return (<Loader />);
    }

    return (<Login auth={auth} />);
  }
}

const mapStateToProps = (state, props) => {
  const { owner, name } = props.dataset;
  const namespace = `${owner}_${name}`;
  const namespaceState = state.dataset[namespace]
    ? state.dataset[namespace]
    : state.dataset;

  const { isUploading } = state.dataset;
  return {
    ...namespaceState,
    globalIsUploading: isUploading,
    owner,
    name,
  };
};

const mapDispatchToProps = () => ({});

const DatasetContainer = connect(mapStateToProps, mapDispatchToProps)(Dataset);


const DatasetFragmentContainer = createRefetchContainer(
  DatasetContainer,
  {
    dataset: graphql`
      fragment Dataset_dataset on Dataset{
          id
          description
          owner
          name
          defaultRemote
          visibility @skip(if: $datasetSkip)
          backendIsConfigured
          commitsBehind
          commitsAhead
          backendConfiguration{
            parameter
            description
            parameterType
            value
          }
          datasetType {
              name
              storageType
              description
              readme
              tags
              icon
              url
              isManaged
          }
          ...Data_dataset
          ...DatasetActivityContainer_dataset
          ...DatasetOverviewContainer_dataset
      }`,
  },
  graphql`
  query DatasetRefetchQuery($first: Int!, $cursor: String, $datasetID: ID!, $overviewSkip: Boolean!, $activitySkip: Boolean!, $dataSkip: Boolean!, $datasetSkip: Boolean!){
    dataset: node(id: $datasetID){
      ... on Dataset {
        visibility @skip(if: $datasetSkip)
      }
      ...Data_dataset
      ...DatasetActivityContainer_dataset
      ...DatasetOverviewContainer_dataset
    }
  }
  `,
);

const datasetBackend = (manager: Object) => {
  const backend = HTML5Backend(manager);
  const orgTopDropCapture = backend.handleTopDropCapture;

  backend.handleTopDropCapture = (e) => {
    e.preventDefault();
    if (backend.currentNativeSource) {
      orgTopDropCapture.call(backend, e);

      // returns a promise
      backend.currentNativeSource.item.dirContent = getFilesFromDragEvent(e, { recursive: true });
    }
  };

  return backend;
};

export default DragDropContext(datasetBackend)(DatasetFragmentContainer);
