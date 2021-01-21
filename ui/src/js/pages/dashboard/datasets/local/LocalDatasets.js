// vendor
import React, { Component } from 'react';
import {
  createPaginationContainer,
  graphql,
} from 'react-relay';
// components
import LocalDatasetPanel from 'Pages/dashboard/datasets/local/panel/LocalDatasetsPanel';
import CardLoader from 'Pages/dashboard/shared/loaders/CardLoader';
import ImportModule from 'Pages/dashboard/shared/import/ImportModule';
import NoResults from 'Pages/dashboard/shared/NoResults';
// helpers
import DatasetVisibilityLookup from './lookups/DatasetVisibilityLookup';
// assets
import './LocalDatasets.scss';

type Props = {
  datasetList: Array,
  filterDatasets: Function,
  filterState: Object,
  filterText: String,
  loading: boolean,
  localDatasets: Object,
  relay: Object,
  section: String,
  setFilterValue: Function,
  showModal: Function,
};

export class LocalDatasets extends Component<Props> {
  state = {
    isPaginating: false,
    visibilityList: new Map(),
  };

  /** *
  * @param {}
  * adds event listener for pagination and fetches container status
  */
  componentDidMount() {
    const {
      datasetList,
      loading,
      localDatasets,
    } = this.props;
    this.mounted = true;
    if (!loading) {
      this._visibilityLookup();
      if (datasetList
         && localDatasets.localDatasets
         && localDatasets.localDatasets.edges
         && localDatasets.localDatasets.edges.length === 0) {
        this._fetchDemo();
      }
    }
  }

  /** *
  * @param {}
  * removes event listener for pagination and removes timeout for container status
  */
  componentWillUnmount() {
    this.mounted = false;

    window.removeEventListener('scroll', this._captureScroll);
  }

  /**
    *  @param {}
    *  fires when user scrolls
    *  if nextPage exists and user is scrolled down, it will cause loadmore to fire
  */
  _captureScroll = () => {
    const { localDatasets } = this.props;
    const { isPaginating } = this.state;
    const root = document.getElementById('root');
    const distanceY = window.innerHeight + document.documentElement.scrollTop + 200;
    const expandOn = root.offsetHeight;

    if (localDatasets.localDatasets) {
      if ((distanceY > expandOn) && !isPaginating
      && localDatasets.localDatasets.pageInfo.hasNextPage) {
        this._loadMore();
      }
    }
  }

  /**
    *  @param {}
    *  loads more datasets using the relay pagination container
  */
  _loadMore = () => {
    const { localDatasets, relay } = this.props;
    this.setState({
      isPaginating: true,
    });

    if (localDatasets.localDatasets.pageInfo.hasNextPage) {
      relay.loadMore(
        10, // Fetch the next 10 items
        () => {
          this.setState({
            isPaginating: false,
          });
          this._visibilityLookup();
        },
      );
    }
  }

  /** *
    * @param {integer} count
    * attempts to fetch a demo if no datasets are present, 3 times
  */
  _fetchDemo = (count = 0) => {
    const { localDatasets, relay } = this.props;
    if (count < 3) {
      const self = this;
      setTimeout(() => {
        relay.refetchConnection(20, () => {
          if (!(localDatasets.localDatasets.edges.length > 0)) {
            self._fetchDemo(count + 1);
          }
        });
      }, 3000);
    }
  }

  /** *
    * @param {}
    * calls VisibilityLookup query and attaches the returned data to the state
    */
  _visibilityLookup = () => {
    const { localDatasets } = this;
    const self = this;
    const idArr = localDatasets.localDatasets.edges.map(edges => edges.node.id);
    let index = 0;

    function query(ids) {
      const subsetIds = idArr.slice(index, index + 10);

      DatasetVisibilityLookup.query(subsetIds).then((res) => {
        if (res && res.data
          && res.data.datasetList
          && res.data.datasetList.localById) {
          const visibilityListCopy = new Map(self.state.visibilityList);

          res.data.datasetList.localById.forEach((node) => {
            visibilityListCopy.set(node.id, node);
          });


          if (index < idArr.length) {
            index += 10;

            query(ids, index);
          }
          if (self.mounted) {
            self.setState({ visibilityList: visibilityListCopy });
          }
        }
      });
    }

    query(idArr, index);
  }

  render() {
    const {
      filterDatasets,
      filterState,
      filterText,
      loading,
      localDatasets,
      section,
      setFilterValue,
      showModal,
    } = this.props;
    const {
      isPaginating,
      visibilityList,
    } = this.state;
    const datasetList = localDatasets;// datasetList is passed as localDatasets
    if (
      (datasetList && datasetList.localDatasets && datasetList.localDatasets.edges)
      || loading
    ) {
      const datasets = filterDatasets(datasetList, filterState, loading);
      const importVisible = (section === 'local' || !loading) && !filterText;

      return (

        <div className="Datasets__listing">

          <div className="grid">
            {
              importVisible
                && (
                <ImportModule
                  {...this.props}
                  ref="ImportModule_localLabooks"
                  section="dataset"
                  title="Add Dataset"
                  showModal={showModal}
                  history={history}
                />
                )
            }
            {
              datasets.length ? datasets.map((edge) => {
                const visibility = visibilityList.has(edge.node.id) ?
                  visibilityList.get(edge.node.id).visibility : 'loading';

                return (
                  <LocalDatasetPanel
                    key={`${edge.node.owner}/${edge.node.name}`}
                    ref={`LocalDatasetPanel${edge.node.name}`}
                    className="LocalDatasets__panel"
                    edge={edge}
                    visibility={visibility}
                    history={history}
                    filterText={filterText}
                  />
                );
              })
                : !loading && filterText
                && <NoResults setFilterValue={setFilterValue} />
            }

            {
              Array(5).fill(1).map((value, index) => (
                <CardLoader
                  key={`LocalDatasets_paginationLoader${index}`}
                  index={index}
                  isLoadingMore={isPaginating || loading}
                />
              ))
            }

          </div>
        </div>
      );
    }
    return (<div />);
  }
}

export default createPaginationContainer(
  LocalDatasets,
  {
    localDatasets: graphql`
      fragment LocalDatasets_localDatasets on DatasetList{
        localDatasets(first: $first, after: $cursor, orderBy: $orderBy, sort: $sort)@connection(key: "LocalDatasets_localDatasets", filters: []){
          edges {
            node {
              id
              name
              description
              owner
              createdOnUtc
              modifiedOnUtc
              overview {
                numFiles
                totalBytes
              }
            }
            cursor
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props, error) {
      return props.localDatasets.localDatasets;
    },
    getFragmentVariables(prevVars, first) {
      return {
        ...prevVars,
        first,
      };
    },
    getVariables(props, {
      first, cursor, orderBy, sort,
    }, fragmentVariables) {
      first = 10;
      cursor = props.localDatasets.localDatasets.pageInfo.endCursor;
      orderBy = fragmentVariables.orderBy;
      sort = fragmentVariables.sort;
      return {
        first,
        cursor,
        orderBy,
        sort,
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
      };
    },
    query: graphql`
      query LocalDatasetsPaginationQuery(
        $first: Int!
        $cursor: String
        $orderBy: String
        $sort: String
      ) {
        datasetList{
          ...LocalDatasets_localDatasets
        }
      }
    `,
  },
);
