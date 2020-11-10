// @flow
// vendor
import React, { Component } from 'react';
// component
import Modal from 'Components/modal/Modal';
// context
import ServerContext from 'Pages/ServerContext';
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
    const publishStatement = header === 'Publish' ? `Once published, the Project will be visible in the '${currentServer.name}' tab on the Projects listing Page.` : '';
    const message = `You are about to change the visibility of the Project. ${publishStatement}`;

    return (
      <Modal
        header={header}
        handleClose={() => toggleModal(modalStateValue)}
        size="large"
        icon={visibility}
      >
        <div className="VisibilityModal">
          <div>
            <p>{message}</p>
          </div>

          <div>
            <div className="VisibilityModal__private">
              <label
                className="Radio"
                htmlFor="publish_private"
              >
                <input
                  defaultChecked={(visibility === 'private') || !isPublic}
                  type="radio"
                  name="publish"
                  id="publish_private"
                  onClick={() => { this._setPublic(false); }}
                />
                <span><b>Private</b></span>
              </label>

              <p className="VisibilityModal__paragraph">Private projects are only visible to collaborators. Users that are added as a collaborator will be able to view and edit.</p>

            </div>

            <div className="VisibilityModal__public">

              <label
                className="Radio"
                htmlFor="publish_public"
              >
                <input
                  defaultChecked={visibility === 'public'}
                  name="publish"
                  type="radio"
                  id="publish_public"
                  onClick={() => { this._setPublic(true); }}
                />
                <span><b>Public</b></span>
              </label>

              <p className="VisibilityModal__paragraph">Public projects are visible to everyone. Users will be able to import a copy. Only users that are added as a collaborator will be able to edit.</p>

            </div>

          </div>

          <div className="VisibilityModal__buttons">
            <button
              type="submit"
              className="Btn--flat"
              onClick={() => { toggleModal(modalStateValue); }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="Btn--last"
              onClick={() => { this._modifyVisibility(); }}
            >
              {buttonText}
            </button>
          </div>

        </div>
      </Modal>
    );
  }
}

export default VisibilityModal;
