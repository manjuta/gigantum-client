// @flow
// vendor
import React from 'react';
import classNames from 'classnames';
// Components
import BranchStatus from 'Pages/repository/shared/header/branches/shared/status/BranchStatus';
import BranchActions from './actions/BranchActions';
import BranchCommits from './details/BranchCommits';
// css
import './Branch.scss';



type Props = {
  activeBranch: {
    branchName: string,
  },
  allowSync: boolean,
  allowSyncPull: boolean,
  branch: {
    branchName: string,
    commitsAhead: string,
    commitsBehind: string,
    isLocal: boolean,
    isRemote: boolean,
  },
  branchMutations: Object,
  defaultRemote: string,
  disableDropdown: boolean,
  handleSyncButton: Function,
  section: Object,
  sectionType: string,
  setBranchUptodate: Function,
  showPullOnly: boolean,
  syncTooltip: string,
  toggleCover: Function,
  updateMigrationState: Function,
};

const Branch = ({
  activeBranch,
  allowSync,
  allowSyncPull,
  branch,
  branchMutations,
  defaultRemote,
  disableDropdown,
  handleSyncButton,
  isOver,
  section,
  sectionType,
  setBranchUptodate,
  showPullOnly,
  syncTooltip,
  toggleCover,
  updateMigrationState,
}: Props) => {
  const {
    branchName,
    commitsAhead,
    commitsBehind,
    isLocal,
    isRemote,
  } = branch;

  const isActiveBranch = activeBranch.branchName === branch.branchName;

  // declare css here
  const branchCSS = classNames({
    Branch: true,
    'Branch--current': isActiveBranch,
    'Branch--selected': isOver,
  });

  return (
    <div className={branchCSS}>
      <div className="Branch__header">
        <div className="Branch__branchname">{branchName}</div>
        <div className="Branch__details">
          <BranchCommits
            commitsAhead={commitsAhead}
            commitsBehind={commitsBehind}
          />

          <BranchStatus
            isLocal={isLocal}
            isRemote={isRemote}
          />
        </div>
      </div>

      <BranchActions
        allowSync={allowSync}
        allowSyncPull={allowSyncPull}
        activeBranch={activeBranch}
        branch={branch}
        branchMutations={branchMutations}
        defaultRemote={defaultRemote}
        disableDropdown={disableDropdown}
        handleSyncButton={handleSyncButton}
        isOver={isOver}
        section={section}
        sectionType={sectionType}
        showPullOnly={showPullOnly}
        syncTooltip={syncTooltip}
        toggleCover={toggleCover}
        updateMigrationState={updateMigrationState}
      />

    </div>
  );
};

export default Branch;
