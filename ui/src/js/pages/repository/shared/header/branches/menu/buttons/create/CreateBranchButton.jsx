// @flow
// Vendor
import React, { useState } from 'react';
import classNames from 'classnames';
// components
import CreateBranch from 'Pages/repository/shared/modals/createBranch/CreateBranch';
// css
import './CreateBranchButton.scss';

/**
  @param {Object} props
  @param {Object} data
  Gets managed tooltip
  @return {String}
*/
const getCreateTooltip = (isLocked, isDataset, defaultDatasetMessage) => {
  const createTooltipDataset = isDataset ? defaultDatasetMessage : 'Create Branch';
  const createTooltip = isLocked ? 'Cannot Create Branch while Project is in use' : createTooltipDataset;

  return createTooltip;
};

type Props = {
  defaultDatasetMessage: string,
  isDataset: boolean,
  isLocked: boolean,
  section: {
    description: string,
    name: string,
    owner: string,
  },
}

const CreateBranchButton = (props: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const {
    defaultDatasetMessage,
    isDataset,
    isLocked,
    section,
  } = props;
  const {
    description,
    name,
    owner,
  } = section;

  const createTooltip = getCreateTooltip(isLocked, isDataset, defaultDatasetMessage);
  // declare css here
  const createCSS = classNames({
    'Btn--branch Btn--action CreateBranchButton': true,
    'Tooltip-data': true,
  });
  return (
    <>
      <button
        className={createCSS}
        type="button"
        disabled={isLocked || isDataset}
        data-tooltip={createTooltip}
        onClick={() => setModalVisible(!modalVisible)}
      />

      <CreateBranch
        description={description}
        modalVisible={modalVisible}
        name={name}
        owner={owner}
        toggleModal={setModalVisible}
      />
    </>
  );
};

export default CreateBranchButton;
