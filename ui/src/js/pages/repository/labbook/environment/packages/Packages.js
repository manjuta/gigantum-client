// vendor
import React, { Component } from 'react';
import { createPaginationContainer, graphql } from 'react-relay';
// store
import { setBuildingState } from 'JS/redux/actions/labbook/labbook';
// components
import Tooltip from 'Components/tooltip/Tooltip';
import PackageCard from './packageCard/PackageCard';
import PackageModal from './packageModal/PackageModal';
// utils
import PackageMutations from './utils/PackageMutations';

class Packages extends Component {
  state = {
    packageMutations: new PackageMutations({
      environmentId: this.props.environmentId,
      name: this.props.name,
      owner: this.props.owner,
    }),
    packageModalVisible: false,
  }

  componentDidMount() {
    this._loadMore();
  }

  componentWillUnmount = () => {
    const { props } = this;
    props.cancelRefetch();
  }

  /**
  *  @param{}
  *  triggers relay pagination function loadMore
  */
  _loadMore = () => {
    const { props } = this;
    const self = this;
    if (props.environment.packageDependencies
      && props.environment.packageDependencies.pageInfo.hasNextPage) {
      props.relay.loadMore(
        10, // Fetch the next 10 items
        (response, error) => {
          if (error) {
            console.error(error);
          }
          if (props.environment.packageDependencies
            && props.environment.packageDependencies.pageInfo.hasNextPage) {
            self._loadMore();
          } else {
            props.packageLatestRefetch();
          }
        },
        {
          cursor: props.environment.packageDependencies.pageInfo.endCursor,
        },
      );
    } else {
      props.packageLatestRefetch();
    }
  }


  /**
  *  @param {Boolean} packageModalVisible
  *  toggles package modal visibility
  */
  _togglePackageModalVisibility = (packageModalVisible) => {
    this.setState({ packageModalVisible });
  }

  render() {
    const { props, state } = this;
    const packages = props.environment.packageDependencies;
    const flatPackages = packages ? packages.edges.map(({ node }) => node) : [];
    return (
      <div className="Packages">
        <div className="Environment__headerContainer">
          <h4>
            Packages
            <Tooltip section="packagesEnvironment" />
          </h4>
        </div>
        {
          state.packageModalVisible && (
            <PackageModal
              base={props.base}
              togglePackageModal={this._togglePackageModalVisibility}
              packages={flatPackages}
              packageMutations={state.packageMutations}
              buildCallback={props.buildCallback}
              setBuildingState={setBuildingState}
              name={props.name}
              owner={props.owner}
            />
          )
        }

        <div className="grid">
          <PackageCard
            base={props.base}
            togglePackageModal={this._togglePackageModalVisibility}
            packages={flatPackages}
            name={props.name}
            owner={props.owner}
            packageMutations={state.packageMutations}
            buildCallback={props.buildCallback}
            setBuildingState={setBuildingState}
            isLocked={props.isLocked}
          />
        </div>
      </div>
    );
  }
}

export default createPaginationContainer(
  Packages,
  {
    environment: graphql`fragment Packages_environment on Environment {
    packageDependencies(first: $first, after: $cursor) @connection(key: "Packages_packageDependencies", filters: []){
        edges{
          node {
            id
            schema
            manager
            package
            latestVersion @skip(if: $skipPackages)
            version
            fromBase
            docsUrl @skip(if: $skipPackages)
            description @skip(if: $skipPackages)
          }
          cursor
        }
        pageInfo{
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }`,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.environment && props.environment.packageDependencies;
    },
    getFragmentVariables(prevVars, first) {
      return {
        ...prevVars,
        first,
      };
    },
    getVariables(props, { count }) {
      const { length } = props.environment.packageDependencies.edges;
      const { name, owner } = props;
      const lastEdge = props.environment.packageDependencies.edges[length - 1];
      const cursor = lastEdge ? lastEdge.cursor : null;
      const hasNext = !props.environment.packageDependencies.pageInfo.hasNextPage;
      const first = count;

      return {
        first,
        cursor,
        name,
        owner,
        hasNext,
        skipPackages: true,
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
        // orderBy: fragmentVariables.orderBy,
      };
    },
    query: graphql`
    query PackagesPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String, $skipPackages: Boolean!){
     labbook(name: $name, owner: $owner){
       environment{
         ...Packages_environment
       }
     }
   }`,
  },
);
