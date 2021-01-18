// @flow
// vendor
import React from 'react';
// context
import ServerContext from 'Pages/ServerContext';
// components
import ManageBranchesButton from './manage/ManageBranchesButton';
import CreateBranchButton from './create/CreateBranchButton';
import ResetBranchButton from './reset/ResetBranchButton';
import SyncBranchButtons from './sync/SyncBranchButtons';
// css
import './BranchButtons.scss';


type Props = {
  action: string,
  activeBranch: Object,
  allowSync: boolean,
  allowSyncPull: boolean,
  branchMutations: Object,
  defaultDatasetMessage: string,
  defaultRemote: string,
  disableDropdown: boolean,
  handleSyncButton: Function,
  isLocked: boolean,
  name: string,
  owner: string,
  section: Object,
  sectionType: string,
  setBranchUptodate: Function,
  showPullOnly: boolean,
  syncTooltip: string,
  toggleCover: Function,
  toggleSidePanel: Function,
  upToDate: boolean,
}

const BranchButtons = (props: Props) => {
  const {
    action,
    activeBranch,
    allowSync,
    allowSyncPull,
    branchMutations,
    defaultDatasetMessage,
    defaultRemote,
    disableDropdown,
    handleSyncButton,
    isLocked,
    name,
    owner,
    section,
    sectionType,
    setBranchUptodate,
    showPullOnly,
    syncTooltip,
    toggleCover,
    toggleSidePanel,
    upToDate,
  } = props;
  const isDataset = (sectionType !== 'labbook');
  if (action) {
    return (
      <div className="BranchButtons__action">
        {action}
      </div>
    );
  }

  return (
    <ServerContext.Consumer>
      {value => (
        <div className="BranchButtons">
          <ManageBranchesButton
            defaultDatasetMessage={defaultDatasetMessage}
            isDataset={isDataset}
            isLocked={isLocked}
            toggleSidePanel={toggleSidePanel}
          />

          <CreateBranchButton
            defaultDatasetMessage={defaultDatasetMessage}
            isDataset={isDataset}
            isLocked={isLocked}
            name={name}
            owner={owner}
            section={section}
          />

          <ResetBranchButton
            activeBranch={activeBranch}
            branchMutations={branchMutations}
            currentServer={value.currentServer}
            defaultDatasetMessage={defaultDatasetMessage}
            isDataset={isDataset}
            isLocked={isLocked}
            name={name}
            owner={owner}
            section={section}
            setBranchUptodate={setBranchUptodate}
            toggleCover={toggleCover}
          />

          <SyncBranchButtons
            activeBranch={activeBranch}
            allowSync={allowSync}
            allowSyncPull={allowSyncPull}
            currentServer={value.currentServer}
            defaultRemote={defaultRemote}
            disableDropdown={disableDropdown}
            handleSyncButton={handleSyncButton}
            isLocked={isLocked}
            showPullOnly={showPullOnly}
            syncTooltip={syncTooltip}
            upToDate={upToDate}
          />
        </div>
      )}
    </ServerContext.Consumer>
  );
};

export default BranchButtons;
