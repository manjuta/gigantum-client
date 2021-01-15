// vendor
import React from 'react';
import classNames from 'classnames';
// componenets
import BranchDropdown from './dropdown/BranchDropdown';
import BranchButtons from './buttons/BranchButtons';

// assets
import './BranchMenu.scss';


const defaultDatasetMessage = 'Datasets currently does not support branching features';


type Props = {
  action: String,
  activeBranch: {
    name: string,
  },
  allowSync: boolean,
  allowSyncPull: boolean,
  branches: string,
  branchMutations: {
    syncDataset: Function,
    syncLabbook: Function,
  },
  currentServer: Object,
  defaultRemote: string,
  disableDropdown: boolean,
  handleSyncButton: Function,
  isLocked: boolean,
  isSticky: boolean,
  section: {
    name: string,
    owner: string,
    description: string,
  },
  sectionType: string,
  setBranchUptodate: Function,
  setModalState: Function,
  showLoginPrompt: boolean,
  showPullOnly: boolean,
  syncTooltip: string,
  toggleCover: Function,
  toggleSidePanel: Function,
  updateMigationState: Function,
  upToDate: boolean,
};

const BranchMenu = (
  {
    action,
    activeBranch,
    allowSync,
    allowSyncPull,
    branches,
    branchMutations,
    currentServer,
    defaultRemote,
    disableDropdown,
    handleSyncButton,
    isLocked,
    isSticky,
    section,
    sectionType,
    setBranchUptodate,
    setModalState,
    showLoginPrompt,
    showPullOnly,
    syncTooltip,
    toggleCover,
    toggleSidePanel,
    updateMigationState,
    upToDate,
  }: Props,
) => {
  // declare css here
  const branchMenuCSS = classNames({
    BranchMenu: true,
    hidden: isSticky,
  });

  return (
    <div className={branchMenuCSS}>
      <BranchDropdown
        branches={branches}
        branchMutations={branchMutations}
        currentServer={currentServer}
        defaultDatasetMessage={defaultDatasetMessage}
        isLocked={isLocked}
        section={section}
        sectionType={sectionType}
        setModalState={setModalState}
        showLoginPrompt={showLoginPrompt}
        toggleCover={toggleCover}
        toggleSidePanel={toggleSidePanel}
        updateMigrationState={updateMigationState}
      />

      <BranchButtons
        action={action}
        activeBranch={activeBranch}
        allowSync={allowSync}
        allowSyncPull={allowSyncPull}
        branchMutations={branchMutations}
        branches={branches}
        currentServer={currentServer}
        defaultDatasetMessage={defaultDatasetMessage}
        defaultRemote={defaultRemote}
        disableDropdown={disableDropdown}
        handleSyncButton={handleSyncButton}
        isLocked={isLocked}
        section={section}
        sectionType={sectionType}
        setBranchUptodate={setBranchUptodate}
        showLoginPrompt={showLoginPrompt}
        showPullOnly={showPullOnly}
        syncTooltip={syncTooltip}
        toggleCover={toggleCover}
        toggleSidePanel={toggleSidePanel}
        upToDate={upToDate}
      />
    </div>
  );
};

export default BranchMenu;
