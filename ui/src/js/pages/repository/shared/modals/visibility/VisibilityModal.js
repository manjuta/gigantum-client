// @flow
// vendor
import React, { Component } from 'react';
// context
import ServerContext from 'Pages/ServerContext';
// component
import Modal from 'Components/modal/Modal';
import Complete from './status/Complete';
import Error from './status/Error';
import Publishing from './status/Publishing';
import VisibilityModalConent from './content/Content';
// utilities
import { publish, changeVisibility } from './utils/PublishMutations';
// Machine
import stateMachine from './machine/StateMachine';
import {
  CONTENT,
  PUBLISHING,
  ERROR,
  COMPLETE,
} from './machine/MachineConstants';
// assets
import './VisibilityModal.scss';

type Props = {
  buttonText: string,
  header: string,
  modalStateValue: Object,
  toggleModal: Function,
  visibility: bool,
}

class VisibilityModal extends Component<Props> {
  state = {
    isPublic: (this.props.visibility === 'public'),
    machine: stateMachine.initialState,
  }


  /**
    @param {object} state
    runs actions for the state machine on transition
  */
  _runActions = (state) => {
    if (state.actions.length > 0) {
      state.actions.forEach(f => this[f]());
    }
  };

  /**
    @param {string} eventType
    @param {object} nextState
    sets transition of the state machine
  */
  _transition = (eventType, nextState) => {
    const { state } = this;

    const newState = stateMachine.transition(
      state.machine.value,
      eventType,
      {
        state,
      },
    );

    this._runActions(newState);
    // TODO use category / installNeeded

    this.setState({
      machine: newState,
      message: nextState && nextState.message ? nextState.message : '',
    });
  };

  /**
  *  @param {boolean}
  *  sets public state
  *  @return {string}
  */
  _setPublic = (isPublic) => {
    this.setState({
      isPublic,
    });
  }

  /**
  *  @param {} -
  *  triggers publish or change visibility
  *  @return {}
  */
  _modifyVisibility = () => {
    const { header } = this.props;
    const { isPublic } = this.state;

    const callback = (success, error) => {
      if (success) {
        this._transition(
          COMPLETE,
          {},
        );
      } else {
        this._transition(
          ERROR,
          {},
        );
      }

      setPublishingState(owner, name, false);
      resetPublishState(false);
    };

    if (header === 'Publish') {
      const { currentServer } = this.context;
      const { baseUrl } = currentServer;
      this._transition(
        PUBLISHING,
        {},
      );
      // publish(baseUrl, this.props, isPublic, callback);
    } else {
      this._transition(
        PUBLISHING,
        {},
      );
      // changeVisibility(this.props, isPublic, callback);
    }
  }

  static contextType = ServerContext;

  render() {
    const {
      buttonText,
      header,
      modalStateValue,
      toggleModal,
      visibility,
    } = this.props;
    const { isPublic, machine } = this.state;
    const { currentServer } = this.context;
    const icon = header === 'Publish' ? 'publish' : 'sync';


    const renderMap = {
      [CONTENT]: (
        <VisibilityModalConent
          buttonText={buttonText}
          currentServer={currentServer}
          header={header}
          isPublic={isPublic}
          modalStateValue={modalStateValue}
          modifyVisibility={this._modifyVisibility}
          setPublic={this._setPublic}
          toggleModal={this._toggleModal}
          visibility={visibility}
        />
      ),
      [PUBLISHING]: (
        <Publishing
          {...this.props}
          {...this.state}
        />
      ),
      [ERROR]: (
        <Error
          {...this.props}
          {...this.state}
        />
      ),
      [COMPLETE]: (
        <Complete
          {...this.props}
          {...this.state}
        />
      ),
    };

    if (stateMachine) {
      return (
        <Modal
          header={header}
          handleClose={() => toggleModal(modalStateValue)}
          size="large"
          icon={icon}
        >
          {renderMap[machine.value]}
        </Modal>
      );
    }

    return null;
  }
}

export default VisibilityModal;
