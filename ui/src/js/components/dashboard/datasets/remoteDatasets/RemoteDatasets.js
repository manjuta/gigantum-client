// vendor
import React, { Component } from 'react';
import {
  createPaginationContainer,
  graphql,
} from 'react-relay';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// store
import store from 'JS/redux/store';
// components
import RemoteDatasetPanel from 'Components/dashboard/datasets/remoteDatasets/RemoteDatasetsPanel';
import DeleteDataset from 'Components/shared/modals/DeleteDataset';
import CardLoader from 'Components/dashboard/shared/loaders/CardLoader';
import NoResults from 'Components/dashboard/shared/NoResults';
// assets
import './RemoteDatasets.scss';


type Props = {
  filterDatasets: Function,
  filterState: String,
  forceLocalView: Function,
  relay: {
    isLoading: Function,
    loadMore: Function,
  },
  remoteDatasets: {
    remoteDatasets: {
      pageInfo: {
        hasNextPage: boolean,
      }
    }
  },
  remoteDatasetsId: string,
  setFilterValue: Function,
}

class RemoteDatasets extends Component<Props> {
  state = {
    deleteData: {
      remoteId: null,
      remoteOwner: null,
      remoteDatasetName: null,
      remoteUrl: null,
      existsLocally: null,
    },
    deleteModalVisible: false,
  };

  /*
    loads more remote datasets on mount
  */
  componentDidMount() {
    const { forceLocalView, remoteDatasets } = this.props;
    if (remoteDatasets.remoteDatasets
      && remoteDatasets.remoteDatasets.pageInfo.hasNextPage) {
      this._loadMore();
    }

    UserIdentity.getUserIdentity().then((response) => {
      if (navigator.onLine) {
        if (response.data) {
          if (!response.data.userIdentity.isSessionValid) {
            forceLocalView();
          }
        }
      } else {
        forceLocalView();
      }
    });
  }

  /**
    *  @param {}
    *  loads more datasets using the relay pagination container
  */
  _loadMore = () => {
    const {
      forceLocalView,
      relay,
      remoteDatasets,
    } = this.props;

    if (relay.isLoading()) {
      return;
    }

    UserIdentity.getUserIdentity().then((response) => {
      if (navigator.onLine) {
        if (response.data) {
          if (response.data.userIdentity.isSessionValid) {

            if (remoteDatasets.remoteDatasets.pageInfo.hasNextPage) {
              relay.loadMore(
                8, // Fetch the next 8 items
                () => {
                  if (
                    remoteDatasets.remoteDatasets
                    && remoteDatasets.remoteDatasets.pageInfo.hasNextPage
                  ) {
                    this._loadMore();
                  }
                },
              );
            }
          } else {
            forceLocalView();
          }
        }
      } else {
        forceLocalView();
      }
    });
  }

  /**
    *  @param {object} deleteData
    *  changes the delete modal's visibility and changes the data passed to it
  */
  _toggleDeleteModal = (deleteData) => {
    if (deleteData) {
      this.setState({
        deleteData,
        deleteModalVisible: true,
      });
    } else {
      this.setState({
        deleteData: {
          remoteId: null,
          remoteOwner: null,
          remoteUrl: null,
          remoteDatasetName: null,
          existsLocally: null,
        },
        deleteModalVisible: false,
      });
    }
  }

  render() {
    const {
      filterDatasets,
      filterState,
      remoteDatasets,
      remoteDatasetsId,
      setFilterValue,
      relay,
    } = this.props;
    const {
      deleteData,
      deleteModalVisible,
    } = this.state;
    const { hasNextPage } = remoteDatasets.remoteDatasets.pageInfo;

    if (remoteDatasets && (remoteDatasets.remoteDatasets !== null)) {
      const datasets = filterDatasets(remoteDatasets, filterState);

      return (
        <div className="Datasets__listing">
          <div className="grid">
            {
            datasets.length
              ? datasets.map(edge => (
                <RemoteDatasetPanel
                  {...this.props}
                  toggleDeleteModal={this._toggleDeleteModal}
                  datasetListId={remoteDatasetsId}
                  key={edge.node.owner + edge.node.name}
                  ref={`RemoteDatasetPanel${edge.node.name}`}
                  edge={edge}
                  existsLocally={edge.node.isLocal}
                />
              ))
              : !relay.isLoading()
                && store.getState().datasetListing.filterText
                && <NoResults setFilterValue={setFilterValue} />
            }
            {
              Array(5).fill(1).map((value, index) => (
                <CardLoader
                  key={`RemoteDatasets_paginationLoader${index}`}
                  index={index}
                  isLoadingMore={relay.isLoading() || hasNextPage}
                />
              ))
            }
          </div>
          {
            deleteModalVisible
            && (
            <DeleteDataset
              {...deleteData}
              {...this.props}
              sectionType="dataset"
              handleClose={() => { this._toggleDeleteModal(); }}
              remoteConnection="RemoteDatasets_remoteDatasets"
              toggleModal={this._toggleDeleteModal}
              owner={deleteData.remoteOwner}
              name={deleteData.remoteDatasetName}
              remoteDelete
            />
            )
          }
        </div>
      );
    }

    return (<div />);
  }
}

export default createPaginationContainer(
  RemoteDatasets,
  {
    remoteDatasets: graphql`
      fragment RemoteDatasets_remoteDatasets on DatasetList{
        remoteDatasets(first: $first, after: $cursor, orderBy: $orderBy, sort: $sort)@connection(key: "RemoteDatasets_remoteDatasets", filters: []){
          edges {
            node {
              name
              description
              visibility
              owner
              id
              isLocal
              creationDateUtc
              modifiedDateUtc
              importUrl
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
      return props.remoteDatasets.remoteDatasets;
    },
    getFragmentVariables(prevVars, first, cursor) {
      return {
        ...prevVars,
        first,
      };
    },
    getVariables(props, {
      first, cursor, orderBy, sort,
    }, fragmentVariables) {
      first = 10;
      cursor = props.remoteDatasets.remoteDatasets.pageInfo.endCursor;
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
      query RemoteDatasetsPaginationQuery(
        $first: Int!
        $cursor: String
        $orderBy: String
        $sort: String
      ) {
        datasetList{
          ...RemoteDatasets_remoteDatasets
        }
      }
    `,
  },
);
