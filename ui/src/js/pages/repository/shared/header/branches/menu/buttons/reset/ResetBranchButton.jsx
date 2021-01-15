// @flow
// vendor
import React, { useState } from 'react';
import classNames from 'classnames';
// store
import {
  setErrorMessage,
} from 'JS/redux/actions/footer';
// css
import './ResetBranchButton.scss';


const getResetTooltip = (
  activeBranch,
  backupInProgress,
  defaultDatasetMessage,
  isDataset,
  isLocked,
  upToDate,
) => {
  let resetTooltip = 'Reset Branch to Remote';
  resetTooltip = upToDate ? 'Branch up to date' : resetTooltip;
  resetTooltip = activeBranch.commitsAhead === undefined ? 'Please wait while branch data is being fetched' : resetTooltip;
  resetTooltip = !activeBranch.isRemote ? 'Cannot reset a branch until it has been published' : resetTooltip;
  resetTooltip = (!activeBranch.isRemote && (activeBranch.branchName !== 'master')) ? 'The master branch must be published first' : resetTooltip;
  resetTooltip = isLocked ? 'Cannot Reset Branch while Project is in use' : resetTooltip;
  resetTooltip = backupInProgress ? 'Cannot Reset Branch while backup is in progress' : resetTooltip;
  resetTooltip = isDataset ? defaultDatasetMessage : resetTooltip;

  return resetTooltip;
};

/**
    @param {}
    calls reset branch on activebranch
  */

const resetBranch = (props, togglePopup) => {
  const {
    branchMutations,
    setBranchUptodate,
    section,
    toggleCover,
  } = props;
  const { owner, name } = section;

  toggleCover('Resetting Branch');
  branchMutations.resetBranch((response, error) => {
    if (error) {
      setErrorMessage(owner, name, 'Failed to reset branch.', error);
    }
    toggleCover(null);
    setBranchUptodate();
  });
  togglePopup(false);
};


type Props = {
  activeBranch: {
    branchName: string,
    commitsAhead: Number,
    isRemote: boolean,
  },
  backupInProgress: boolean,
  branchMutations: {
    resetBranch: Function,
  },
  currentServer: {
    backupInProgress: boolean,
  },
  defaultDatasetMessage: string,
  isDataset: boolean,
  isLocked: boolean,
  upToDate: boolean,
}

const ResetBranchButton = (props: Props) => {
  const {
    activeBranch,
    currentServer,
    defaultDatasetMessage,
    isDataset,
    isLocked,
    upToDate,
  } = props;
  const { backupInProgress } = currentServer;
  const [popupVisible, setPopupVisible] = useState(false);

  const allowReset = (
    !isLocked
     && !upToDate
     && activeBranch.isRemote
     && (activeBranch.commitsAhead !== undefined)
  )
  || isDataset;

  const resetTooltip = getResetTooltip(
    activeBranch,
    backupInProgress,
    defaultDatasetMessage,
    isDataset,
    isLocked,
    upToDate,
  );
  // declare css here
  const popupCSS = classNames({
    ResetBranchButton__popup: true,
    hidden: !popupVisible || backupInProgress,
  });

  return (
    <div className="ResetBranchButton">
      <button
        className="Btn--branch Btn--action ResetBranchButton__btn Tooltip-data"
        type="button"
        disabled={!allowReset || backupInProgress || backupInProgress}
        data-tooltip={resetTooltip}
        onClick={() => setPopupVisible(allowReset)}
      />

      <div className={popupCSS}>
        <p>You are about to reset this branch. Resetting a branch will get rid of local changes. Click 'Confirm' to proceed.</p>
        <div className="flex justify--space-around">
          <button
            type="button"
            className="Btn--flat"
            onClick={() => { setPopupVisible(!popupVisible); }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => resetBranch(props, setPopupVisible)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};


export default ResetBranchButton;
