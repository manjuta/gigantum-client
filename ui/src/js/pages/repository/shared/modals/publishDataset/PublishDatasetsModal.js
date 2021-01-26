// @flow
// vendor
import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
import classNames from 'classnames';
// store
import { setErrorMessage, setMultiInfoMessage } from 'JS/redux/actions/footer';
import store from 'JS/redux/store';
// query
import LocalDatasetsQuery from 'Pages/repository/shared/header/actionsSection/queries/LocalDatasetsQuery';
// context
import ServerContext from 'Pages/ServerContext';
// component
import Modal from 'Components/modal/Modal';
import DatasetPublish from './DatasetPublish';
import ProjectPublish from './ProjectPublish';
import WarningInfoPrompt from './WarningInfoPrompt';
// Mutations
import PublishMutations from './mutations/PublishMutations';
// assets
import './PublishDatasetsModal.scss';

type Props = {
  buttonText: string,
  checkSessionIsValid: Function,
  handleSync: Function,
  header: string,
  isVisible: boolean,
  localDatasets: Array,
  name: string,
  owner: string,
  resetPublishState: Function,
  resetState: Function,
  setPublishErrorState: Function,
  setPublishingState: Function,
  setRemoteSession: Function,
  setSyncingState: Function,
  toggleModal: Function,
  toggleSyncModal: Function,
};

class PublishDatasetsModal extends Component<Props> {
  state = {
    showPrompt: true,
    isProcessing: false,
    visibilityStatus: {
      project: null,
    },
    mutations: new PublishMutations(this.props),
    progress: {},
    datasetsToPublish: 0,
  }

  /**
    @param {object} nextProps
    @param {object} nextState
    handles new localDatasets from props
  */
  static getDerivedStateFromProps(nextProps, nextState) {
    const NewVisibilityStatus = Object.assign({}, nextState.visibilityStatus);
    nextProps.localDatasets.forEach(({ owner, name }) => {
      if (NewVisibilityStatus[`${owner}/${name}`] === undefined) {
        NewVisibilityStatus[`${owner}/${name}`] = null;
      }
      if (nextProps.header === 'Sync') {
        delete NewVisibilityStatus.project;
      }
    });

    return {
      ...nextState,
      visibilityStatus: NewVisibilityStatus,
      datasetsToPublish: nextProps.localDatasets.length,
    };
  }

  /**
  *  @param {} -
  *  sets public state
  *  @return {}
  */
  _passedSuccessCall = () => {
    const { progress } = this.state;
    const { toggleModal } = this.props;
    const successProgress = Object.assign({}, progress);

    successProgress.project = { step: 3 };
    this.setState({ progress: successProgress });

    setTimeout(() => toggleModal(false, true), 2000);
  }

  /**
  *  @param {}
  *  sets public state
  *  @return {}
  */
  _successCall = () => {
    const { progress } = this.state;
    const {
      header,
      name,
      owner,
      resetPublishState,
      setPublishingState,
      setRemoteSession,
      toggleModal,
    } = this.props;
    const { currentServer } = this.context;
    const { baseUrl } = currentServer;
    const isPublishing = header === 'Publish';
    const id = uuidv4();
    const successProgress = Object.assign({}, progress);

    successProgress.project = { step: 3 };
    this.setState({ progress: successProgress });

    setTimeout(() => toggleModal(false, true), 2000);

    if (isPublishing) {
      setPublishingState(owner, name, false);
      resetPublishState(false);
      const messageData = {
        id,
        message: `Added remote ${baseUrl}${owner}/${name}`,
        isLast: true,
        error: false,
      };
      setMultiInfoMessage(owner, name, messageData);

      setRemoteSession();
    } else {
      this._buildImage(id);
    }
  }

  /**
  *  @param {string} errorMessage
  *  sets public state
  *  @return {}
  */
  _failureCall = (errorMessage, jobQueryData) => {
    const {
      header,
      owner,
      name,
      resetPublishState,
      setPublishErrorState,
      setPublishingState,
      setSyncingState,
      toggleModal,
      toggleSyncModal,
    } = this.props;
    const isPublishing = (header === 'Publish');

    setPublishErrorState(errorMessage, jobQueryData);
    setTimeout(() => toggleModal(false, true), 2000);

    if (isPublishing) {
      setPublishingState(owner, name, false);
      resetPublishState(false);
    } else {
      setSyncingState(false);
      if (errorMessage && errorMessage.indexOf('Merge conflict') > -1) {
        toggleSyncModal();
      }
    }
  }

  /**
  *  @param {} -
  *  triggers publish labbook mutation
  *  @return {}
  */
  _publishLabbookMutation = () => {
    const { mutations, visibilityStatus } = this.state;
    const data = {
      setPublic: visibilityStatus.project,
      successCall: this._successCall,
      failureCall: this._failureCall,
    };

    mutations._publishLabbook(
      data,
      (publishResponse, error) => {
        if (error) {
          this._failureCall();
        }
      },
    );
  }

  /**
  *  @param {string} owner
  *  @param {string} datasetName
  *  loops through local datasets and triggers mutatiob to relink and publish
  *  @return {}
  */
  _relinkDataset = (owner, name) => {
    const { state } = this;
    const { mutations, progress } = this.state;
    const { handleSync, header } = this.props;
    const isPublishing = header === 'Publish';

    LocalDatasetsQuery.getLocalDatasets(
      {
        owner,
        name,
      },
    ).then((result) => {
      const linkData = {
        datasetOwner: owner,
        datasetName: name,
        linkType: 'link',
        remote: result.data.dataset.defaultRemote,
      };

      mutations._modifyDatasetLink(
        linkData,
        (localResponse, error) => {
          if (error) {
            setErrorMessage(owner, name, 'Unable to relink dataset', error);
          } else {
            const datasetsToPublish = (state.datasetsToPublish - 1);
            const finalProgress = Object.assign({}, progress);

            finalProgress[`${owner}/${name}`] = { step: 4 };

            if (datasetsToPublish === 0) {
              finalProgress.project = { step: 2 };
            }
            this.setState({ progress: finalProgress });

            if (datasetsToPublish === 0) {
              if (isPublishing) {
                this._publishLabbookMutation();
              } else {
                handleSync(false, true, true, this._passedSuccessCall);
              }
            } else {
              this.setState({ datasetsToPublish });
            }
          }
        },
      );
    });
  }

  /**
  *  @param {string} owner
  *  @param {string} datasetName
  *  gets a list of local datasets to publish
  *  @return {}
  */
  _unlinkDataset = (owner, name) => {
    const { mutations, progress } = this.state;
    const newProgress = Object.assign({}, progress);
    newProgress[`${owner}/${name}`] = { step: 2 };

    this.setState({ progress: newProgress });


    const linkData = {
      datasetOwner: owner,
      datasetName: name,
      linkType: 'unlink',
      remote: null,
    };

    mutations._modifyDatasetLink(
      linkData,
      (modifyResponse, error) => {
        if (error) {
          setErrorMessage(owner, name, 'Unable to unlink dataset', error);
        } else {
          const updatedProgress = Object.assign({}, progress);
          updatedProgress[`${owner}/${name}`] = { step: 3 };
          this.setState({ progress: updatedProgress });

          this._relinkDataset(owner, name);
        }
      },
    );
  }

  /**
  *  @param {string} name
  *  @param {boolean} isPublic
  *  sets public state
  *  @return {string}
  */
  _setPublic = (name, isPublic) => {
    const { visibilityStatus } = this.state;
    const NewVisibilityStatus = Object.assign({}, visibilityStatus);

    NewVisibilityStatus[name] = isPublic;
    this.setState({ visibilityStatus: NewVisibilityStatus });
  }

  /**
  *  @param {string} owner
  *  @param {string} name
  *  sets public state
  *  @return {string}
  */
  _publishDataset = (owner, name) => {
    const { mutations, visibilityStatus } = this.state;
    const data = {
      datasetName: name,
      datasetOwner: owner,
      setPublic: visibilityStatus[`${owner}/${name}`],
      successCall: this._unlinkDataset,
      failureCall: this._failureCall,
    };

    mutations._publishDataset(
      data,
      (publishDatasetResponse, error) => {
        if (error) {
          this._failureCall();
        }
      },
    );
  }

  /**
  *  @param {}
  *  adds remote url to labbook
  *  @return {string}
  */
  _publishLabbook = () => {
    const {
      checkSessionIsValid,
      header,
      localDatasets,
      resetState,
      resetPublishState,
      setPublishingState,
      setSyncingState,
    } = this.props;
    const { progress } = this.state;
    const conatinerStatus = store.getState().containerStatus.status;
    const isPublishing = header === 'Publish';

    checkSessionIsValid().then((response) => {
      if (navigator.onLine) {
        if (response.data) {
          if (response.data.userIdentity.isSessionValid) {
            if (conatinerStatus !== 'Running') {
              resetPublishState(true);

              if (isPublishing) {
                const { owner, name } = this.props;
                setPublishingState(owner, name, true);
              } else {
                setSyncingState(true);
              }

              this.setState({ isProcessing: true });

              localDatasets.forEach(({ owner, name }) => {
                const initialProgress = Object.assign({}, progress);
                initialProgress[`${owner}/${name}`] = { step: 1 };
                initialProgress.project = { step: 1 };
                this.setState({ progress: initialProgress });

                LocalDatasetsQuery.getLocalDatasets({ owner, name }).then(
                  (datasetQueryResponse) => {
                    const datasetOwner = datasetQueryResponse.data.dataset.owner;
                    const datasetName = datasetQueryResponse.data.dataset.name;
                    if (datasetQueryResponse.data.dataset.defaultRemote) {
                      this._unlinkDataset(datasetOwner, datasetName);
                    } else {
                      this._publishDataset(datasetOwner, datasetName);
                    }
                  },
                );
              });
            }
          } else {
            resetState();
          }
        }
      } else {
        resetState();
      }
    });
  }

  /**
  *  @param {string} id
  *  triggers build mutation
  *  updates sync state
  *  @return {}
  */
  _buildImage = (id) => {
    const { mutations } = this.state;
    const { owner, name, setSyncingState } = this.props;
    const data = { noCache: false };

    mutations._buildImage(data, (response, error) => {
      if (error) {
        console.error(error);
        const messageData = {
          owner,
          name,
          id,
          message: `ERROR: Failed to build ${name}`,
          isLast: null,
          error: true,
          messageBody: error,
        };
        setMultiInfoMessage(owner, name, messageData);
      }
    });

    setSyncingState(false);
  }

  /**
  *  @param {} -
  *  set visibility
  *  @return {string}
  */
  _modifyVisibility = () => {
    const { header } = this.props;
    if (header === 'Publish') {
      this._publishLabbook();
    } else {
      this._changeVisibility();
    }
  }

  /**
  *  @param {} -
  *  sets prompt state to false
  *  @return {}
  */
  _hidePrompt = () => {
    this.setState({ showPrompt: false });
  }

  /**
  *  @param {} -
  *  handgles model closing
  *  @return {}
  */
  _handleClose = () => {
    const { isProcessing } = this.state;
    const { toggleModal } = this.props;

    if (!isProcessing) {
      toggleModal(false, true);
    }
  }

  static contextType = ServerContext;

  render() {
    const {
      buttonText,
      header,
      isVisible,
      localDatasets,
      name,
      owner,
      toggleModal,
    } = this.props;
    const {
      isProcessing,
      progress,
      showPrompt,
      visibilityStatus,
    } = this.state;
    // Declare Variables here
    const keys = Object.keys(visibilityStatus);
    const isDisabled = keys.filter(key => visibilityStatus[key] === null).length;
    // Declare CSS classNames here
    const containerCSS = classNames({
      PublishDatasetsModal__container: true,
      'PublishDatasetsModal__container--processing': isProcessing,
    });


    if (!isVisible) {
      return null;
    }

    return (
      <Modal
        header={header}
        handleClose={this._handleClose}
        size="large"
        icon="dataset"
      >
        <div className="PublishDatasetsModal">
          { showPrompt
            ? (
              <WarningInfoPrompt
                localDatasets={localDatasets}
                toggleModal={toggleModal}
                hidePrompt={this._hidePrompt}
              />
            )
            : (
              <div>
                <div className={containerCSS}>
                  { (header === 'Publish') || isProcessing
                    ? (
                      <ProjectPublish
                        isProcessing={isProcessing}
                        owner={owner}
                        name={name}
                        setPublic={this._setPublic}
                        header={header}
                        progress={progress}
                      />
                    )
                    : <p>Select the visibility for the datasets to be published.</p>}
                  <h5 className="PublishDatasetsModal__Label">
                    Datasets
                  </h5>
                  <ul>
                    { localDatasets.map(localDataset => (
                      <DatasetPublish
                        localDataset={localDataset}
                        setPublic={this._setPublic}
                        progress={progress}
                        isProcessing={isProcessing}
                      />
                    ))}
                  </ul>

                </div>
                { (!isProcessing)
                    && (
                    <div className="PublishDatasetsModal__buttons">
                      <button
                        type="button"
                        className="Btn--flat"
                        onClick={() => { toggleModal(false, true); }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="Btn Btn--last"
                        disabled={isDisabled}
                        onClick={() => { this._publishLabbook(); }}
                      >
                        {buttonText}
                        {header === 'Sync' && ' And Sync'}
                      </button>
                    </div>
                    )}
              </div>
            )}
        </div>
      </Modal>
    );
  }
}

export default PublishDatasetsModal;
