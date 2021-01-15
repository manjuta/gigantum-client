// @flow
// vendor
import React, { Component } from 'react';
// store
import {
  setErrorMessage,
} from 'JS/redux/actions/footer';
// component
import Modal from 'Components/modal/Modal';
// assets
import './ForceMerge.scss';


type Props = {
  branch: string,
  branchMutations: {
    mergeBranch: Function,
    buildImage: Function,
  },
  modalVisible: boolean,
  name: string,
  owner: string,
  toggleCover: Function,
  toggleModal: Function,
};

class ForceMergeModal extends Component<Props> {
  /**
    @param {Object} branchName
    @param {String} overrideMethod
    filters array branhces and return the active branch node
  */
  _mergeBranch = (branchName, overrideMethod) => {
    const {
      branchMutations,
      name,
      owner,
      toggleCover,
      toggleModal,
    } = this.props;
    const data = {
      branchName,
      overrideMethod,
    };

    toggleCover('Merging Branches');

    branchMutations.mergeBranch(data, (response, error) => {
      if (error) {
        const errorMessage = error[0].message;
        if (errorMessage.indexOf('Merge conflict') > -1) {
          toggleModal();
        }
        setErrorMessage(owner, name, 'Failed to merge branch', error);
      } else {
        toggleModal();
      }
      toggleCover(null);
      branchMutations.buildImage((response, error) => {
        if (error) {
          setErrorMessage(owner, name, `${name} failed to build`, error);
        }
      });
    });
  }

  /**
  *  @param {}
  *  triggers merge with force set top True
  *  hides modal
  *  @return {}
  */
  _forceMerge(method) {
    const { branch } = this.props;
    this._mergeBranch(branch, method);
  }

  render() {
    const { modalVisible, toggleModal } = this.props;

    if (modalVisible) {
      return (
        <Modal
          handleClose={() => toggleModal()}
          header="Merge Conflict"
          size="medium"
          icon="merge"
        >
          <p className="ForceMege__text">Merge failed due to conflicts. Which changes would you like to use?</p>

          <div className="ForceMege__buttonContainer">
            <button
              onClick={() => this._forceMerge('ours')}
              type="button"
            >
              Use Mine
            </button>

            <button
              onClick={() => this._forceMerge('theirs')}
              type="button"
            >
              Use Theirs
            </button>

            <button
              onClick={() => toggleModal(false)}
              type="button"
            >
              Abort
            </button>
          </div>
        </Modal>
      );
    }

    return false;
  }
}


export default ForceMergeModal;
