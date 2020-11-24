import React, { Component } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import queryString from 'querystring';
// redux
import { setCallbackRoute } from 'JS/redux/actions/routes';
// components
import environment from 'JS/createRelayEnvironment';
import Loader from 'Components/loader/Loader';
import LocalLabbooksContainer from './labbooks/localLabbooks/LocalLabbooksContainer';
import LocalDatasetsContainer from './datasets/localDatasets/LocalDatasetsContainer';
import RemoteDatasetsContainer from './datasets/remoteDatasets/RemoteDatasetsContainer';
import RemoteLabbooksContainer from './labbooks/remoteLabbooks/RemoteLabbooksContainer';
// assets
import './Dashboard.scss';


const LocalListingQuery = graphql`query DashboardLocalQuery($first: Int!, $cursor: String, $orderBy: String $sort: String){
  ...LocalLabbooksContainer_labbookList
}`;

const LocalDatasetListingQuery = graphql`query DashboardDatasetLocalQuery($first: Int!, $cursor: String, $orderBy: String $sort: String){
  ...LocalDatasetsContainer_datasetList
}`;
const RemoteDatasetListingQuery = graphql`query DashboardDatasetRemoteQuery($first: Int!, $cursor: String, $orderBy: String $sort: String){
  ...RemoteDatasetsContainer_datasetList
}`;

const RemoteListingQuery = graphql`query DashboardRemoteQuery($first: Int!, $cursor: String, $orderBy: String $sort: String){
  ...RemoteLabbooksContainer_labbookList
}`;

type Props = {
  auth: Object,
  diskLow: boolean,
  hash: Object,
  history: Object,
  match: Object,
  serverName: string,
}

export default class DashboardContainer extends Component<Props> {
  constructor(props) {
    super(props);
    const { orderBy, sort } = queryString.parse(props.history.location.hash.slice(1));

    this.state = {
      selectedComponent: props.match && props.match.path,
      orderBy: orderBy || 'modified_on',
      sort: sort || 'desc',
    };
  }

  componentDidMount() {
    const { history } = this.props;
    window.location.hash = '';
    setCallbackRoute(history.location.pathname);
  }

  /**
  *  @param {Object} nextProps
  *  update select component before component renders
  */
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      selectedComponent: nextProps.match.path,
    });
    setCallbackRoute(nextProps.history.location.pathname);
  }

  /**
    * @param {string, string} orderBy, sort
    * sets state of orderBy and sort, passed to child components
  */
  _refetchSort = (orderBy, sort) => {
    const { state } = this;
    if (state.orderBy !== orderBy || state.sort !== sort) {
      this.setState({ orderBy, sort });
    }
  }


  /**
  *  @param {}
  *  returns jsx of selected component
  *  @return {jsx}
  */
  _displaySelectedComponent = () => {
    const {
      orderBy,
      sort,
      selectedComponent,
    } = this.state;
    const {
      auth,
      diskLow,
      hash,
      history,
      match,
      serverName,
    } = this.props;
    const sectionRoute = match
      && match.params
      && match.params.labbookSection;
    let query;

    if ((sectionRoute !== 'cloud') && (sectionRoute !== 'local')) {
      history.replace('/projects/local');
    }
    if (selectedComponent === '/datasets/:labbookSection') {
      query = sectionRoute === 'cloud' ? RemoteDatasetListingQuery : LocalDatasetListingQuery;
    } else if (sectionRoute === 'cloud') {
      query = RemoteListingQuery;
    } else {
      query = LocalListingQuery;
    }

    return (
      <QueryRenderer
        environment={environment}
        query={query}
        variables={{
          first: sectionRoute === 'cloud' ? 10 : 100,
          cursor: null,
          orderBy,
          sort,
        }}
        render={(response) => {
          const { error } = this;
          const queryProps = response.props;
          if (error) {
            console.log(error);
            return null;
          } else if (queryProps) {
            if (selectedComponent === '/datasets/:labbookSection') {
              if (sectionRoute === 'cloud') {
                return (
                  <RemoteDatasetsContainer
                    auth={auth}
                    datasetList={queryProps}
                    diskLow={diskLow}
                    history={history}
                    orderBy={orderBy}
                    refetchSort={this._refetchSort}
                    section={sectionRoute}
                    serverName={serverName}
                    sort={sort}
                  />
                );
              }
              return (
                <LocalDatasetsContainer
                  auth={auth}
                  datasetList={queryProps}
                  diskLow={diskLow}
                  hash={hash}
                  history={history}
                  orderBy={orderBy}
                  refetchSort={this._refetchSort}
                  section={sectionRoute}
                  serverName={serverName}
                  sort={sort}
                />
              );
            }
            if (sectionRoute === 'cloud') {
              return (
                <RemoteLabbooksContainer
                  auth={auth}
                  diskLow={diskLow}
                  history={history}
                  labbookList={queryProps}
                  orderBy={orderBy}
                  refetchSort={this._refetchSort}
                  section={sectionRoute}
                  serverName={serverName}
                  sort={sort}
                />
              );
            }

            return (
              <LocalLabbooksContainer
                auth={auth}
                diskLow={diskLow}
                hash={hash}
                history={history}
                labbookList={queryProps}
                orderBy={orderBy}
                refetchSort={this._refetchSort}
                section={sectionRoute}
                serverName={serverName}
                sort={sort}
              />
            );
          } else {
            if (selectedComponent === '/datasets/:labbookSection') {
              return (
                <LocalDatasetsContainer
                  auth={auth}
                  datasetList={queryProps}
                  diskLow={diskLow}
                  hash={hash}
                  history={history}
                  loading
                  orderBy={orderBy}
                  refetchSort={this._refetchSort}
                  section={sectionRoute}
                  serverName={serverName}
                  sort={sort}
                />
              );
            }

            return (
              <LocalLabbooksContainer
                auth={auth}
                diskLow={diskLow}
                history={history}
                hash={hash}
                labbookList={queryProps}
                loading
                orderBy={orderBy}
                refetchSort={this._refetchSort}
                section={sectionRoute}
                serverName={serverName}
                sort={sort}
              />
            );
          }
        }}
      />
    );
  }

  render() {
    return (
      <div className="Dashboard flex flex-column">

        <div className="Dashboard__view flex-1-0-auto">
          <div id="dashboard__cover" className="Dashboard__cover hidden">
            <Loader />
          </div>
          {
            this._displaySelectedComponent()
          }
        </div>
      </div>
    );
  }
}
