// @flow
// Vendor
import React from 'react';
import classNames from 'classnames';
// css
import './ManageBranchButton.scss';

/**
  @param {Object} props
  @param {Object} data
  Gets managed tooltip
  @return {String}
*/
const getManagedToolip = (isLocked, isDataset, defaultDatasetMessage) => {
  let managedTooltip = isLocked ? 'Cannot Manage Branches while Project is in use' : 'Manage Branches';
  managedTooltip = isDataset ? defaultDatasetMessage : 'Manage Branches';

  return managedTooltip;
};

type Props = {
  defaultDatasetMessage: string,
  isDataset: boolean,
  isLocked: boolean,
  toggleSidePanel: Function,
};

const ManageBranchButton = (props: Props) => {
  const {
    defaultDatasetMessage,
    isDataset,
    isLocked,
    toggleSidePanel,
  } = props;
  const manageTooltip = getManagedToolip(isLocked, isDataset, defaultDatasetMessage);
  const manageCSS = classNames({
    'Btn--branch Btn--action ManageBranchButton': true,
    'Tooltip-data': true,
  });

  return (
    <button
      onClick={() => toggleSidePanel(true)}
      className={manageCSS}
      disabled={isLocked || isDataset}
      data-tooltip={manageTooltip}
      type="button"
    />
  );
};

export default ManageBranchButton;
