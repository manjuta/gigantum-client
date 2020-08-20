// vendor
import React, { Component } from 'react';
import {
  createPaginationContainer,
  graphql,
} from 'react-relay';
// components
import LocalLabbookPanel from 'Pages/dashboard/labbooks/localLabbooks/LocalLabbookPanel';
import CardLoader from 'Pages/dashboard/shared/loaders/CardLoader';
import ImportModule from 'Pages/dashboard/shared/import/ImportModule';
import NoResults from 'Pages/dashboard/shared/NoResults';
// helpers
import ContainerLookup from './lookups/ContainerLookup';
import VisibilityLookup from './lookups/VisibilityLookup';
// assets
import './LocalLabbooks.scss';


type Props = {
  filterLabbooks: Function,
  filterState: string,
  filterText: string,
  history: Object,
  labbookList: Array,
  loading: boolean,
  localLabbooks: {
    localLabbooks: {
      edges: Array<Object>,
      pageInfo: {
        hasNextPage: boolean,
      },
    },
  },
  relay: {
    loadMore: Function,
    refetchConnection: Function,
  },
  section: string,
  setFilterValue: Function,
  showModal: Function,
}

export class LocalLabbooks extends Component<Props> {
  state = {
    isPaginating: false,
    containerList: new Map(),
    visibilityList: new Map(),
  };

  /** *
  * @param {}
  * adds event listener for pagination and fetches container status
  */
  componentDidMount() {
    const {
      labbookList,
      localLabbooks,
      loading,
    } = this.props;
    this.mounted = true;
    if (!loading) {
      window.addEventListener('scroll', this._captureScroll);

      this._containerLookup();
      this._visibilityLookup();

      if (labbookList
         && localLabbooks.localLabbooks
         && localLabbooks.localLabbooks.edges
         && localLabbooks.localLabbooks.edges.length === 0) {
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
    clearTimeout(this.containerLookup);

    window.removeEventListener('scroll', this._captureScroll);
  }

  /**
    *  @param {}
    *  loads more labbooks using the relay pagination container
  */
  _loadMore = () => {
    const { localLabbooks, relay } = this.props;
    this.setState({
      isPaginating: true,
    });

    if (localLabbooks.localLabbooks.pageInfo.hasNextPage) {
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

  /**
    *  @param {}
    *  fires when user scrolls
    *  if nextPage exists and user is scrolled down, it will cause loadmore to fire
  */
  _captureScroll = () => {
    const { isPaginating } = this.state;
    const { localLabbooks } = this.props;
    const root = document.getElementById('root');
    const distanceY = window.innerHeight + document.documentElement.scrollTop + 200;
    const expandOn = root.offsetHeight;

    if (localLabbooks.localLabbooks) {
      if ((distanceY > expandOn) && !isPaginating
        && localLabbooks.localLabbooks.pageInfo.hasNextPage) {
        this._loadMore();
      }
    }
  }

  /** *
  * @param {}
  * calls ContainerLookup query and attaches the returned data to the state
  */
  _containerLookup = () => {
    const { containerList } = this.state;
    const { localLabbooks } = this.props;
    const self = this;
    const idArr = localLabbooks.localLabbooks
      ? localLabbooks.localLabbooks.edges.map(edges => edges.node.id)
      : [];

    ContainerLookup.query(idArr).then((res) => {
      if (res && res.data
        && res.data.labbookList
        && res.data.labbookList.localById) {
        const containerListCopy = new Map(containerList);
        let brokenCount = 0;
        res.data.labbookList.localById.forEach((node) => {
          if (
            node.environment.imageStatus === null
            && node.environment.containerStatus === null
          ) {
            brokenCount += 1;
          }
          containerListCopy.set(node.id, node);
        });
        if (self.mounted) {
          const delay = (brokenCount !== res.data.labbookList.localById.length) ? 30000 : 10000;

          if (!brokenCount !== res.data.labbookList.localById.length) {
            self.setState({ containerList: containerListCopy });
          }
          this.containerLookup = setTimeout(() => {
            self._containerLookup();
          }, delay);
        }
      }
    });
  }

  /** *
    * @param {integer} count
    * attempts to fetch a demo if no labbooks are present, 3 times
  */
  _fetchDemo = (count = 0) => {
    const {
      localLabbooks,
      relay,
    } = this.props;
    if (count < 3) {
      const self = this;
      setTimeout(() => {
        relay.refetchConnection(20, () => {
          if (localLabbooks.localLabbooks.edges.length > 0) {
            self._containerLookup();
            self._visibilityLookup();
          } else {
            self._fetchDemo(count + 1);
          }
        });
      }, 3000);
    }
  }

  /** *
  * @param {} -
  * calls VisibilityLookup query and attaches the returned data to the state
  */
  _visibilityLookup = () => {
    const { localLabbooks } = this.props;
    const self = this;
    const idArr = localLabbooks.localLabbooks
      ? localLabbooks.localLabbooks.edges.map(edges => edges.node.id)
      : [];
    let index = 0;

    function query(ids) {
      const subsetIds = idArr.slice(index, index + 10);

      VisibilityLookup.query(subsetIds).then((res) => {
        if (res && res.data
          && res.data.labbookList
          && res.data.labbookList.localById) {
          const visibilityListCopy = new Map(self.state.visibilityList);

          res.data.labbookList.localById.forEach((node) => {
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
      filterLabbooks,
      filterState,
      filterText,
      history,
      loading,
      localLabbooks,
      section,
      setFilterValue,
      showModal,
    } = this.props;
    const { state } = this;
    const labbookList = localLabbooks;// labbookList is passed as localLabbooks

    if (
      (labbookList && labbookList.localLabbooks && labbookList.localLabbooks.edges)
      || loading
    ) {
      const labbooks = !loading
        ? filterLabbooks(labbookList.localLabbooks.edges, filterState)
        : [];
      const importVisible = (section === 'local' || !loading) && !filterText;
      const isLoadingMore = state.isPaginating || loading;

      return (

        <div className="Labbooks__listing">

          <div className="grid">
            { importVisible
                && (
                <ImportModule
                  {...this.props}
                  section="labbook"
                  title="Add Project"
                  showModal={showModal}
                  history={history}
                />
                )
            }
            { labbooks.length ? labbooks.map((edge) => {
              const visibility = state.visibilityList.has(edge.node.id)
                ? state.visibilityList.get(edge.node.id).visibility
                : 'loading';
              const node = state.containerList.has(edge.node.id)
                && state.containerList.get(edge.node.id);

              return (
                <LocalLabbookPanel
                  key={`${edge.node.owner}/${edge.node.name}`}
                  ref={`LocalLabbookPanel${edge.node.name}`}
                  className="LocalLabbooks__panel"
                  edge={edge}
                  history={history}
                  node={node}
                  visibility={visibility}
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
                  key={`LocalLabbooks_paginationLoader${index}`}
                  index={index}
                  isLoadingMore={isLoadingMore}
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
  LocalLabbooks,
  {
    localLabbooks: graphql`
    fragment LocalLabbooks_localLabbooks on LabbookList{
      localLabbooks(first: $first, after: $cursor, orderBy: $orderBy, sort: $sort)@connection(key: "LocalLabbooks_localLabbooks", filters: []){
        edges {
          node {
            id
            name
            description
            owner
            creationDateUtc
            modifiedOnUtc
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
    getConnectionFromProps(props) {
      return props.localLabbooks.localLabbooks;
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
      cursor = props.localLabbooks.localLabbooks.pageInfo.endCursor;
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
      query LocalLabbooksPaginationQuery(
        $first: Int!
        $cursor: String
        $orderBy: String
        $sort: String
      ) {
        labbookList{
          ...LocalLabbooks_localLabbooks
        }
      }
    `,
  },
);
