// @flow
// vendor
import React, { Component, Fragment } from 'react';
// components
import Modal from 'Components/modal/Modal';
// Mutations
import DeleteExperimentalBranchMutation from 'Mutations/branches/DeleteExperimentalBranchMutation';
// store
import { setErrorMessage, setInfoMessage } from 'JS/redux/actions/footer';
// assets
import './DeleteBranch.scss';

type Props = {
  branchName: string,
  cleanBranchName: string,
  labbookName: string,
  labbookId: string,
  owner: string,
  toggleModal: Function,
}

class DeleteBranch extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      eneteredBranchName: '',
    };
  }

  /**
  *  @param {object} event
  *  updates state of eneteredBranchName
  *  @return {}
  */
  _updateBranchText(evt) {
    this.setState({
      eneteredBranchName: evt.target.value,
    });
  }

  /**
  *  @param {}
  *  triggers DeleteExperimentalBranchMutation
  *  @return {}
  */
  _deleteBranch() {
    const {
      owner,
      labbookName,
      labbookId,
      branchName,
      cleanBranchName,
      toggleModal,
    } = this.props;

    toggleModal('deleteModalVisible');

    DeleteExperimentalBranchMutation(
      owner,
      labbookName,
      branchName,
      labbookId,
      (response, error) => {
        if (error) {
          setErrorMessage(owner, labbookName, `There was a problem deleting ${cleanBranchName}`, error);
        } else {
          setInfoMessage(owner, labbookName, `Deleted ${cleanBranchName} successfully`);
        }
      },
    );
  }

  render() {
    const {
      owner,
      cleanBranchName,
      toggleModal,
    } = this.props;
    const { eneteredBranchName } = this.state;
    const deleteDisabled = cleanBranchName !== eneteredBranchName;

    return (
      <Modal
        handleClose={() => toggleModal('deleteModalVisible')}
        size="medium"
        header="Delete Branch"
        icon="delete"
      >
        <>
          <p className="DeleteBranch__text DeleteBranch__text--red">
            {`You are going to delete ${owner}/${cleanBranchName}. Deleted branches cannot be restored. Are you sure?`}
          </p>

          <p className="DeleteBranch__text">
            This action can lead to data loss. Please type
            <b>{cleanBranchName}</b>
            to proceed.
          </p>

          <input
            onChange={(evt) => { this._updateBranchText(evt); }}
            onKeyUp={(evt) => { this._updateBranchText(evt); }}
            className="DeleteBranch__text"
            type="text"
            placeholder="Enter branch name here"
          />
          <div className="DeleteBranch__buttonContainer">
            <button
              type="button"
              disabled={deleteDisabled}
              onClick={() => this._deleteBranch()}
            >
              Confirm
            </button>
          </div>
        </>
      </Modal>
    );
  }
}

export default DeleteBranch;
