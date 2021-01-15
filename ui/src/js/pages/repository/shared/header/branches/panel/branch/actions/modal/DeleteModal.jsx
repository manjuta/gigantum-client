// @flow
// vendor
import React, { useState } from 'react';
import classNames from 'classnames';
// store
import { setErrorMessage } from 'JS/redux/actions/footer';
// components
import ActionModal from './ActionModal';

type Props = {
  branch: {
    branchName: string,
    isLocal: boolean,
    isRemote: boolean,
  },
  branchMutations: {
    deleteBranch: Function,
  },
  modalVisible: boolean,
  section: {
    name: string,
    owner: string,
  },
  toggleCover: Function,
  toggleModal: Function,
};

const DeleteModal = ({
  branch,
  branchMutations,
  modalVisible,
  section,
  toggleCover,
  toggleModal,
}: Props) => {
  const [localSelected, setLocalSelected] = useState(false);
  const [remoteSelected, setRemoteSelected] = useState(false);


  /**
    @param {Object} branch
    calls delete branch mutation
  */
  const deleteBranch = () => {
    const { name, owner } = section;
    const data = {
      branchName: branch.branchName,
      deleteLocal: localSelected,
      deleteRemote: remoteSelected,
    };
    toggleCover('Deleting Branch');
    branchMutations.deleteBranch(data, (response, error) => {
      if (error) {
        setErrorMessage(owner, name, 'Failed to delete branch', error);
      }
      toggleModal(false);
      toggleCover(null);
    });
  };


  const disableConfirm = !localSelected && !remoteSelected;

  // declare css here
  const localCheckboxCSS = classNames({
    'Tooltip-data': !branch.isLocal,
    Branches__label: true,
    'Branches__label--local': true,
    'Branches__label--disabled': !branch.isLocal,
  });
  const remoteCheckboxCSS = classNames({
    'Tooltip-data': !branch.isRemote,
    Branches__label: true,
    'Branches__label--remote': true,
    'Branches__label--disabled': !branch.isRemote,
  });

  if (modalVisible) {
    return (
      <ActionModal
        branch={branch}
        disableConfirm={disableConfirm}
        header="Delete Branch"
        modalType="delete"
        handleConfirm={deleteBranch}
        toggleModal={toggleModal}
      >
        <>
          You are about to delete
          <b>{` ${branch.branchName}. `}</b>
          This action can lead to data loss.
        </>
        <div className="Branches__input-container">
          <label
            data-tooltip="Branch does not exist Locally"
            htmlFor="delete_local"
            className={localCheckboxCSS}
          >
            <input
              defaultChecked={!branch.isLocal}
              disabled={!branch.isLocal}
              id="delete_local"
              name="delete_local"
              onClick={() => setLocalSelected(!localSelected)}
              type="checkbox"
            />
            Local
          </label>
          <label
            htmlFor="delete_remote"
            className={remoteCheckboxCSS}
            data-tooltip="Branch does not exist Remotely"
          >
            <input
              disabled={!branch.isRemote}
              id="delete_remote"
              name="delete_remote"
              onClick={() => setRemoteSelected(!remoteSelected)}
              type="checkbox"
            />
            Remote
          </label>
        </div>

      </ActionModal>
    );
  }

  return null;
};

export default DeleteModal;
