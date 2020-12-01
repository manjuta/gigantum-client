// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import queryString from 'querystring';
// mutations
import CreateLabbookMutation from 'Mutations/repository/create/CreateLabbookMutation';
import CreateDatasetMutation from 'Mutations/repository/create/CreateDatasetMutation';
import BuildImageMutation from 'Mutations/container/BuildImageMutation';
// history
import history from 'JS/history';
// store
import { setErrorMessage } from 'JS/redux/actions/footer';
// components
import Loader from 'Components/loader/Loader';
import Modal from 'Components/modal/Modal';
import CreateLabbook from './CreateLabbook';
import SelectBase from './SelectBase';
import CreateNav from './CreateNav';
// assets
import './CreateModal.scss';

/**
  @param {string} name
  @param {string} owner
  builds docker iamge of labbook
*/
const buildImage = (name, owner) => {
  BuildImageMutation(
    owner,
    name,
    false,
    (response, error) => {
      if (error) {
        console.error(error);
        setErrorMessage(owner, name, `ERROR: Failed to build ${name}`, error);
      }
    },
  );
};


/**
  @param {Object} currentComponent
  builds docker iamge of labbook
  @return {string}
*/
const getModalSize = (currentComponent) => {
  const modalSize = ((currentComponent.header === 'Select A Type')
    || (currentComponent.header === 'Select A Base'))
    ? 'large-long'
    : 'large';

  return modalSize;
};


type Props = {
  auth: Object,
  datasets: {
    name: string,
    owner: string,
  },
  hash: {
    createNew: string,
  },
  history: {
    location: {
      hash: string,
      pathname: string,
    },
    replace: Function,
  }
}

/**
* Method checks hash arg create new and makes sure it is set to true.
* @param {string} hash
*
* @return {boolean}
*/
const getModalVisible = (hash) => {
  const { createNew } = queryString.parse(hash);
  if ((createNew === 'true') || createNew === true) {
    return true;
  }
  return false;
};

class CreateModal extends Component<Props> {
  state = {
    owner: localStorage.getItem('username'),
    name: '',
    description: '',
    repository: '',
    componentId: '',
    revision: '',
    modalVisible: getModalVisible(history.location.hash.slice(1)),
    selectedComponentId: 'createLabbook',
    continueDisabled: true,
    modalBlur: false,
    createLabbookButtonState: '',
  };

  componentDidMount = () => {
    const hash = queryString.parse(history.location.hash.slice(1));
    if (hash.createNew) {
      delete hash.createNew;
      const stringifiedValues = queryString.stringify(hash);

      const path = hash.path ? decodeURI(hash.path) : history.location.pathname;

      history.replace(`${path}#${stringifiedValues}`);
    }
  }


  /**
    @param {Object, string} evt,field
    updates text in a state object and passes object to setState method
  */
  _updateTextState = (evt, field) => {
    const state = {};
    state[field] = evt.target.value;
    this.setState(state);
  }


  /**
    @param {}
    shows modal window by update component state
  */
  _showModal = () => {
    this.setState({
      modalVisible: true,
      selectedComponentId: 'createLabbook',
    });
  }

  /**
    @param {}
    hides modal window by update component state
  */
  _hideModal = () => {
    this.setState({ modalVisible: false });
  }

  /**
    @param {string} componentId
    sets view for child components using and id
  */
  _setComponent = (componentId) => {
    this.setState({ selectedComponentId: componentId });
  }

  /**
    @param {boolean} isDisabled
    setsContinueDisabled value to true or false
  */
  _toggleDisabledContinue = (isDisabled) => {
    this.setState({ continueDisabled: isDisabled });
  }

  /**
    @param { boolean} isSkip
    gets selected id and triggers continueSave function using refs
  */
  _continueSave = ({ isSkip, text }) => {
    const { datasets } = this.props;
    const { selectedComponentId } = this.state;

    if (datasets) {
      this[selectedComponentId].continueSave(isSkip);
    } else {
      this[selectedComponentId].continueSave(isSkip);

      if (text === 'Create Labbook') {
        this.setState({
          modalBlur: true,
          continueDisabled: true,
        });
      } else {
        this.setState({ continueDisabled: true });
      }
    }
  }

  /**
    @param {string} name
    @param {string} description
    sets name and description to state for create labbook mutation
  */
  _createLabbookCallback = (name, description) => {
    const { datasets } = this.props;

    this.setState({
      name,
      description,
    }, () => {
      if (datasets) {
        this._toggleDisabledContinue(true);
        this._createDatasetMutation();
      }
    });

    if (!datasets) {
      this._setComponent('selectBase');
    }
  }

  /**
    @param {Object} node
    @param {Object:String} node.componentId
    @param {Object:Int} node.revision
    @param {Object:String} node.repository,
    @param {Object:String} node.storageType,
    sets (repository, componentId and revision to state for create labbook mutation
  */
  _selectBaseCallback = (node) => {
    const { props } = this;
    const {
      repository,
      componentId,
      revision,
      storageType,
    } = node;
    const selectedType = props.datasets ? storageType : componentId;

    this.setState({
      repository,
      componentId: selectedType,
      revision,
    });
  }

  /**
    @param {String} createLabbookButtonState
    sets button state
  */
  _setButtonState = (createLabbookButtonState) => {
    this.setState({ createLabbookButtonState });
  }

  /**
      @param {}
      sets name and description to state for create labbook mutation
  */
  _createLabbookMutation = () => {
    const self = this;
    const {
      owner,
      name,
      description,
      repository,
      componentId,
      revision,
    } = this.state;

    this.setState({
      createLabbookButtonState: 'loading',
      modalVisible: false,
    });

    document.getElementById('modal__cover').classList.remove('hidden');
    document.getElementById('loader').classList.remove('hidden');

    CreateLabbookMutation(
      name,
      description,
      repository,
      componentId,
      revision,
      (response, error) => {
        if (error) {
          setErrorMessage(owner, name, `An error occured while trying to create Project '${name}'.`, error);
          document.getElementById('modal__cover').classList.add('hidden');
          document.getElementById('loader').classList.add('hidden');
          this.setState({
            modalBlur: false,
            createLabbookButtonState: 'error',
          });

          setTimeout(() => {
            this.setState({
              createLabbookButtonState: '',
            });
          }, 2000);
        } else {
          localStorage.setItem('latest_base', componentId);
          this.setState({ createLabbookButtonState: 'finished' });

          setTimeout(() => {
            buildImage(name, owner);

            this.setState({
              createLabbookButtonState: '',
            }, () => {
              self.props.history.push(`../projects/${owner}/${name}`);
              document.getElementById('modal__cover').classList.add('hidden');
              document.getElementById('loader').classList.add('hidden');
            });
          }, 2000);
        }
      },
    );
  }

  /**
      @param {}
      sets name and description to state for create labbook mutation
  */
  _createDatasetMutation = () => {
    const self = this;
    const {
      owner,
      name,
      description,
    } = this.state;

    this.setState({
      createLabbookButtonState: 'loading',
    });

    CreateDatasetMutation(
      name,
      description,
      'gigantum_object_v1',
      (response, error) => {
        if (error) {
          setErrorMessage(owner, name, `An error occured while trying to create Dataset '${name}'.`, error);
          this.setState({
            modalBlur: false,
            createLabbookButtonState: 'error',
          });

          setTimeout(() => {
            this.setState({ createLabbookButtonState: '' });
          }, 2000);
        } else {
          this.setState({
            createLabbookButtonState: 'finished',
          });

          setTimeout(() => {
            this.setState({ createLabbookButtonState: '' }, () => {
              self.props.history.push(`../datasets/${owner}/${name}`);
            });
          }, 2000);
        }
      },
    );
  }

  /**
   * @param {} -
   * selects current component to display in the create modal
   * @return {}
   */
  _currentComponent = () => {
    const { props } = this;
    const { selectedComponentId } = this.state;
    const {
      auth,
      datasets,
      history,
    } = this.props;

    switch (selectedComponentId) {
      case 'createLabbook':
        return {
          component:
            (<CreateLabbook
              ref={(ref) => { this.createLabbook = ref; }}
              createLabbookCallback={this._createLabbookCallback}
              toggleDisabledContinue={this._toggleDisabledContinue}
              setButtonState={this._setButtonState}
              history={history}
              hideModal={this._hideModal}
              auth={auth}
              datasets={datasets}
            />),
          header: datasets ? 'Create Dataset' : 'Create Project',
        };

      case 'selectBase':
        return {
          component:
          (<SelectBase
            ref={(ref) => { this.selectBase = ref; }}
            selectBaseCallback={this._selectBaseCallback}
            toggleDisabledContinue={this._toggleDisabledContinue}
            createLabbookMutation={this._createLabbookMutation}
            createDatasetMutation={this._createDatasetMutation}
            datasets={datasets}
          />),
          header: datasets ? 'Select A Type' : 'Select A Base',
          preHeader: datasets ? 'Create Dataset' : 'Create Project',
        };
      default:
        return {
          component:
          (<CreateLabbook
            ref={(ref) => { this.createLabbook = ref; }}
            createLabbookCallback={this._createLabbookCallback}
            toggleDisabledContinue={this._toggleDisabledContinue}
            setButtonState={this._setButtonState}
            history={history}
            hideModal={this._hideModal}
            auth={auth}
          />),
          header: 'Create Project',
        };
    }
  }

  render() {
    // destructuring here
    const { datasets } = this.props;
    const {
      modalBlur,
      modalVisible,
      createLabbookButtonState,
      selectedComponentId,
      continueDisabled,
    } = this.state;
    // other variables
    const currentComponent = this._currentComponent();
    const modalBody = currentComponent.component;
    const modalSize = getModalSize(currentComponent);
    // declare css
    const loaderCSS = classNames({
      hidden: !modalBlur,
    });

    return (
      <div>
        { modalVisible && (
          <Modal
            size={modalSize}
            icon="add"
            handleClose={() => this._hideModal()}
            header={currentComponent.header}
            preHeader={currentComponent.preHeader}
            noPadding
          >
              <div className="CreateModal">

                { modalBody }

                <CreateNav
                  self={this}
                  createLabbookButtonState={createLabbookButtonState}
                  selectedComponentId={selectedComponentId}
                  continueDisabled={continueDisabled}
                  setComponent={this._setComponent}
                  hideModal={this._hideModal}
                  continueSave={this._continueSave}
                  isDataset={datasets}
                />
              </div>

          </Modal>
        )}

        { modalBlur && <Loader className={loaderCSS} /> }
      </div>
    );
  }
}

export default CreateModal;
