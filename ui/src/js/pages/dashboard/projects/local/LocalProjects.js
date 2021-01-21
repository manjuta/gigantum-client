// vendor
import React, { Component } from 'react';
import {
  createPaginationContainer,
  graphql,
} from 'react-relay';
// components
import LocalProjectPanel from 'Pages/dashboard/projects/local/panel/LocalProjectPanel';
import CardLoader from 'Pages/dashboard/shared/loaders/CardLoader';
import ImportModule from 'Pages/dashboard/shared/import/ImportModule';
import NoResults from 'Pages/dashboard/shared/NoResults';
// helpers
import ContainerLookup from './lookups/ContainerLookup';
import VisibilityLookup from './lookups/VisibilityLookup';
// assets
import './LocalProjects.scss';


type Props = {
  filterProjects: Function,
  filterState: string,
  filterText: string,
  history: Object,
  projectList: Array,
  loading: boolean,
  localProjects: {
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

export class LocalProjects extends Component<Props> {
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
      projectList,
      localProjects,
      loading,
    } = this.props;
    this.mounted = true;
    if (!loading) {
      window.addEventListener('scroll', this._captureScroll);

      this._containerLookup();
      this._visibilityLookup();

      if (projectList
         && localProjects.localLabbooks
         && localProjects.localLabbooks.edges
         && localProjects.localLabbooks.edges.length === 0) {
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
    *  loads more Projects using the relay pagination container
  */
  _loadMore = () => {
    const { localProjects, relay } = this.props;
    this.setState({
      isPaginating: true,
    });

    if (localProjects.localLabbooks.pageInfo.hasNextPage) {
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
    const { localProjects } = this.props;
    const root = document.getElementById('root');
    const distanceY = window.innerHeight + document.documentElement.scrollTop + 200;
    const expandOn = root.offsetHeight;

    if (localProjects.localLabbooks) {
      if ((distanceY > expandOn) && !isPaginating
        && localProjects.localLabbooks.pageInfo.hasNextPage) {
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
    const { localProjects } = this.props;
    const self = this;
    const idArr = localProjects.localLabbooks
      ? localProjects.localLabbooks.edges.map(edges => edges.node.id)
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
    * attempts to fetch a demo if no projects are present, 3 times
  */
  _fetchDemo = (count = 0) => {
    const {
      localProjects,
      relay,
    } = this.props;
    if (count < 3) {
      const self = this;
      setTimeout(() => {
        relay.refetchConnection(20, () => {
          if (localProjects.localLabbooks.edges.length > 0) {
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
    const { localProjects } = this.props;
    const self = this;
    const idArr = localProjects.localLabbooks
      ? localProjects.localLabbooks.edges.map(edges => edges.node.id)
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
      filterProjects,
      filterState,
      filterText,
      history,
      loading,
      localProjects,
      section,
      setFilterValue,
      showModal,
    } = this.props;
    const {
      isPaginating,
      visibilityList,
      containerList,
    } = this.state;
    const projectList = localProjects;

    if (
      (projectList && projectList.localLabbooks && projectList.localLabbooks.edges)
      || loading
    ) {
      const Projects = !loading
        ? filterProjects(projectList.localLabbooks.edges, filterState)
        : [];
      const importVisible = (section === 'local' || !loading) && !filterText;
      const isLoadingMore = isPaginating || loading;

      return (

        <div className="Projects__listing">

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
                )}
            { Projects.length ? Projects.map((edge) => {
              const visibility = visibilityList.has(edge.node.id)
                ? visibilityList.get(edge.node.id).visibility
                : 'loading';
              const node = containerList.has(edge.node.id)
                && containerList.get(edge.node.id);

              return (
                <LocalProjectPanel
                  key={`${edge.node.owner}/${edge.node.name}`}
                  ref={`LocalLabbookPanel${edge.node.name}`}
                  className="LocalProjects__panel"
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
                  key={`LocalProjects_paginationLoader${index}`}
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
  LocalProjects,
  {
    localProjects: graphql`
    fragment LocalProjects_localProjects on LabbookList{
      localLabbooks(first: $first, after: $cursor, orderBy: $orderBy, sort: $sort)@connection(key: "LocalProjects_localLabbooks", filters: []){
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
      return props.localProjects.localLabbooks;
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
      cursor = props.localProjects.localLabbooks.pageInfo.endCursor;
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
      query LocalProjectsPaginationQuery(
        $first: Int!
        $cursor: String
        $orderBy: String
        $sort: String
      ) {
        labbookList{
          ...LocalProjects_localProjects
        }
      }
    `,
  },
);
