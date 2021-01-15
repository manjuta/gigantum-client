// @flow
// vendor
import React, { useState } from 'react';
// components
import CreateBranch from 'Pages/repository/shared/modals/createBranch/CreateBranch';

type Props = {
  filteredBranches: Array,
  section: {
    description: string,
    owner: string,
    name: string,
  }
}

const NoOtherBranches = (props: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const {
    filteredBranches,
    section,
  } = props;
  const {
    description,
    name,
    owner,
  } = section;

  if (filteredBranches.length === 0) {
    return (
      <>
        <li
          className="BranchMenu__list-item BranchMenu__list-item--create"
          onClick={() => setModalVisible(!modalVisible)}
          role="presentation"
        >
          No other branches.
          <button
            type="button"
            className="Btn--flat"
          >
            Create a new branch?
          </button>
          <CreateBranch
            owner={owner}
            name={name}
            modalVisible={modalVisible}
            description={description}
            toggleModal={setModalVisible}
          />
        </li>

      </>
    );
  }

  return null;
};

export default NoOtherBranches;
