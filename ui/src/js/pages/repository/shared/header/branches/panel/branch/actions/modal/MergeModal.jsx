// @flow
// vendor
import React, { useState } from 'react';
// store
import { setErrorMessage } from 'JS/redux/actions/footer';
// components
import ForceMerge from 'Pages/repository/shared/modals/merge/ForceMerge';
import ActionModal from './ActionModal';

type Props = {
  activeBranch: {
    branchName: string,
  },
  branch: {
    branchName: string,
    isLocal: boolean,
    isRemote: boolean,
  },
  branchMutations: {
    mergeBranch: Function,
  },
  modalVisible: boolean,
  section: {
    name: string,
    owner: string,
  },
  sectionType: string,
  toggleCover: Function,
  toggleModal: Function,
}

const MergeModal = ({
  activeBranch,
  branch,
  branchMutations,
  modalVisible,
  section,
  sectionType,
  toggleCover,
  toggleModal,
}: Props) => {
  const [forceMergeVisible, setForceMergeVisible] = useState(false);
  /**
    @param {Object} branchName
    @param {String} overrideMethod
    filters array branhces and return the active branch node
  */
  const mergeBranch = (branch) => {
    const { branchName } = branch;
    const data = {
      branchName,
    };
    const {
      name,
      owner,
    } = section;

    toggleCover('Merging Branches');
    branchMutations.mergeBranch(data, (response, error) => {
      if (error) {
        const errorMessage = error[0].message;
        if (errorMessage.indexOf('Merge conflict') > -1) {
          setForceMergeVisible(true);
        } else {
          toggleModal(false);
          toggleCover(false);
        }
        setErrorMessage(owner, name, 'Failed to merge branch', error);
      } else {
        toggleModal(false);
        toggleCover(null);
        branchMutations.buildImage((response, error) => {
          if (error) {
            setErrorMessage(owner, name, `${name} failed to build`, error);
            toggleModal(false);
          }
        });
      }

    });
  };

  if (modalVisible) {
    return (
      <ActionModal
        branch={branch}
        disableConfirm={false}
        header="Merge Branches"
        handleConfirm={mergeBranch}
        modalType="merge"
        toggleModal={toggleModal}
      >
        <>
          You are about to merge the branch
          <b>{` ${branch.branchName} `}</b>
          with the current branch
          <b>{` ${activeBranch.branchName}`}</b>
          . Click 'Confirm' to proceed.
        </>

        <ForceMerge
          branchName={branch.branchName}
          branchMutaions={branchMutations}
          modalVisible={forceMergeVisible}
          toggleModal={setForceMergeVisible}
          togglePopup={toggleModal}
          sectionType={sectionType}
        />
      </ActionModal>
    );
  }

  return null;
};

export default MergeModal;
