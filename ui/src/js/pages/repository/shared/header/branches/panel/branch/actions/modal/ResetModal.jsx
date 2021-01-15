// @flow
// vendor
import React from 'react';
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
    resetBranch: Function,
  },
  modalVisible: boolean,
  section: {
    name: string,
    owner: string,
  },
  setBranchUptodate: Function,
  toggleCover: Function,
  toggleModal: Function,
};

const MergeModal = ({
  branch,
  branchMutations,
  modalVisible,
  toggleModal,
  toggleCover,
  section,
  setBranchUptodate,
}: Props) => {
  const resetBranch = () => {
    const {
      name,
      owner,
    } = section;

    toggleCover('Resetting Branch');

    branchMutations.resetBranch((response, error) => {
      if (error) {
        setErrorMessage(owner, name, 'Failed to reset branch', error);
      }
      setBranchUptodate();
      toggleModal(false);
      toggleCover(null);
    });
  };

  if (modalVisible) {
    return (
      <ActionModal
        branch={branch}
        disableConfirm={false}
        handleConfirm={resetBranch}
        header="Reset Branch"
        modalType="reset"
        toggleModal={toggleModal}
      >
        <>
          You are about to reset this branch. Resetting a branch will get rid of local changes. Click 'Confirm' to proceed.
        </>
      </ActionModal>
    );
  }

  return null;
};

export default MergeModal;
