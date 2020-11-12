// @flow
// vendor
import React, { Component } from 'react';
// context
import ServerContext from 'Pages/ServerContext';
// component
import Modal from 'Components/modal/Modal';
import VisibilityModalConent from './content/Content';
// utilities
import { publish, changeVisibility } from './utils/PublishMutations';
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
  }

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
    if (header === 'Publish') {
      const { currentServer } = this.context;
      const { baseUrl } = currentServer;
      publish(baseUrl, this.props, isPublic);
    } else {
      changeVisibility(this.props, isPublic);
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
    const { isPublic } = this.state;
    const { currentServer } = this.context;

    return (
      <Modal
        header={header}
        handleClose={() => toggleModal(modalStateValue)}
        size="large"
        icon={visibility}
      >
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
      </Modal>
    );
  }
}

export default VisibilityModal;
