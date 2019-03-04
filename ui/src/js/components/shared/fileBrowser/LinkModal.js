// vendor
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import store from 'JS/redux/store';
import environment from 'JS/createRelayEnvironment';
import classNames from 'classnames';
import Moment from 'moment';
// mutations
import ModifyDatasetLinkMutation from 'Mutations/ModifyDatasetLinkMutation';
// component
import Modal from 'Components/common/Modal';
import Loader from 'Components/common/Loader';
import ButtonLoader from 'Components/common/ButtonLoader';
import AdvancedSearch from 'Components/common/AdvancedSearch';
// store
import { setErrorMessage, setInfoMessage } from 'JS/redux/reducers/footer';
// assets
import './LinkModal.scss';

export const LinkModalQuery = graphql`
  query LinkModalQuery($first: Int!, $cursor: String, $orderBy: String $sort: String){
      datasetList{
        localDatasets(first: $first, after: $cursor, orderBy: $orderBy, sort: $sort)@connection(key: "LocalDatasets_localDatasets", filters: []){
            edges {
              node {
                id
                name
                description
                owner
                createdOnUtc
                modifiedOnUtc
                defaultRemote
                datasetType {
                    name
                    isManaged
                    icon
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
  }`;

export default class LinkModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
        selectedDataset: null,
        buttonState: '',
        tags: [],
    };
    this._linkDataset = this._linkDataset.bind(this);
    this._setTags = this._setTags.bind(this);
  }
    /**
    @param {Array} tags
    sets component tags from child
    */
    _setTags(tags) {
        this.setState({ tags });
    }
    /**
        @param {object} datasets
        determines filter criteria for dataset types
        @return {object} filters
    */
    _createFilters(datasets) {
        const filters = {
        'Dataset Type': [],
        };

        const datasetTypes = new Set();
        datasets.forEach(({ node }) => {
            if (!datasetTypes.has(node.datasetType.name) && node.datasetType.name) {
                datasetTypes.add(node.datasetType.name);
              }
        });
        filters['Dataset Type'] = Array.from(datasetTypes);
        return filters;
    }
  /**
    * @param {}
    * triggers link datraset mutation
  */
  _linkDataset() {
    const { owner, labbookName } = store.getState().routes;
    this.setState({ buttonState: 'loading' });
    ModifyDatasetLinkMutation(
        owner,
        labbookName,
        this.state.selectedDataset.owner,
        this.state.selectedDataset.name,
        'link',
        this.state.selectedUrl || null,
        (response, error) => {
            if (error) {
                setErrorMessage('Unable to link dataset', error);
                this.setState({ buttonState: 'error' });
                setTimeout(() => {
                    this.setState({ buttonState: '' });
                }, 2000);
            } else {
                this.setState({ buttonState: 'finished' });
                setTimeout(() => {
                    this.props.closeLinkModal();
                }, 2000);
            }
        },
    );
  }
  /**
    * @param {object} edge
    * sets update selected state
  */
  _updateSelected(edge) {
    this.setState({
      selectedDataset: {
        owner: edge.node.owner,
        name: edge.node.name,
      },
      selectedUrl: edge.node.defaultRemote,
    });
  }

/**
    @param {Array} datasets
    filters datasets based on selected filters
  */
    _filterDatasets(datasets) {
        const tags = this.state.tags;
        return datasets.filter(({ node }) => {
        const lowercaseDescription = node.description.toLowerCase();
        const lowercaseName = node.name.toLowerCase();
        let isReturned = true;
        if (tags.indexOf('Managed') > -1 && !node.isManaged ||
            tags.indexOf('Unmanaged') > -1 && node.isManaged) {
            isReturned = false;
        }

        tags.forEach(({ text, className }) => {
            if (className === 'Dataset Type') {
                const isManaged = text === 'Managed';
                if (isManaged !== node.datasetType.isManaged) {
                    isReturned = false;
                }
            } else if (className === 'Base Type') {
                if (node.datasetType.name !== text) {
                    isReturned = false;
                }
            } else if ((lowercaseDescription.indexOf(text.toLowerCase()) === -1) && (lowercaseName.indexOf(text.toLowerCase()) === -1)) {
                isReturned = false;
            }
        });
        return isReturned;
        });
    }

  render() {
    const { props } = this;
    return (

      <Modal
        header="Link Dataset"
        handleClose={() => props.closeLinkModal()}
        size="large-long"
        noPadding
        renderContent={() =>

          (<div className="LinkModal">
            <div
                className="LinkModal__info Tooltip-data"
                data-tooltip="Linking a dataset will allow you to reference its files within the Project"
            >
            </div>
            <QueryRenderer
                environment={environment}
                query={LinkModalQuery}
                variables={{
                    first: 100,
                    cursor: null,
                    orderBy: 'modified_on',
                    sort: 'desc',
                }}
                render={({ error, props }) => {
                    if (error) {
                        console.log(error);
                    } else if (props) {
                        const existingDatasets = this.props.linkedDatasets.map(dataset => dataset.name);
                        const localDatasetEdges = this._filterDatasets(props.datasetList.localDatasets.edges.filter(dataset => existingDatasets.indexOf(dataset.node.name) === -1));
                        const filterCategories = this._createFilters(localDatasetEdges);
                        return (
                            <div className="LinkModal__flex flex flex--column justify--space-between">
                                <div className="LinkModal__container">
                                    <AdvancedSearch
                                        tags={this.state.tags}
                                        setTags={this._setTags}
                                        filterCategories={filterCategories}
                                        withoutContext
                                    />
                                    <div className="LinkModal__dataset-container">
                                        {
                                            localDatasetEdges.map((edge) => {
                                                    const node = edge.node;
                                                    const LinkModalCard = classNames({
                                                    'LinkModal__dataset--selected': this.state.selectedDataset && this.state.selectedDataset.owner === node.owner && this.state.selectedDataset.name === node.name,
                                                    LinkModal__dataset: true,
                                                    Card: true,
                                                    });
                                                    return (<div
                                                            key={node.id}
                                                            onClick={() => { this._updateSelected(edge); }}
                                                            className="LinkModal__wrapper"
                                                        >
                                                            <div className={LinkModalCard}>
                                                                    <img
                                                                        alt=""
                                                                        src={`data:image/jpeg;base64,${node.datasetType.icon}`}
                                                                        height="50"
                                                                        width="50"
                                                                    />
                                                                    <div className="LinkModal__details">
                                                                        <h6 className="LinkModal__name">{node.name}</h6>
                                                                        <h6 className="LinkModal__type">{node.isManaged ? 'Managed' : 'Unmanaged'}</h6>
                                                                        <h6>{`Created on ${Moment(edge.node.createdOnUtc).format('MM/DD/YY')}`}</h6>
                                                                        <h6>{`Modified ${Moment(edge.node.modifiedOnUtc).fromNow()}`}</h6>
                                                                    </div>
                                                                    <div className="LinkModal__text">
                                                                        <p className="LinkModal__description">
                                                                            {node.description}
                                                                        </p>
                                                                    </div>
                                                            </div>
                                                        </div>);
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="Link__buttonContainer">
                                    <button
                                        className="Btn--flat"
                                        onClick={() => this.props.closeLinkModal()}
                                    >
                                    Cancel
                                    </button>
                                    <ButtonLoader
                                        buttonState={this.state.buttonState}
                                        buttonText="Link Dataset"
                                        className=""
                                        params={{}}
                                        buttonDisabled={!this.state.selectedDataset}
                                        clicked={this._linkDataset}
                                    />
                                </div>
                            </div>
                        );
                    }
                    return <Loader/>;
                }}
            />

           </div>)
        }
      />
    );
  }
}
