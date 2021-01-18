// @flow
// vendor
import React, { useState } from 'react';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';
// context
import ServerContext from 'Pages/ServerContext';
// components
import CreateBranch from 'Pages/repository/shared/modals/createBranch/CreateBranch';
import SwitchButton from './buttons/SwitchButton';
import SyncMenu from './buttons/sync/SyncMenu';
import DeleteModal from './modal/DeleteModal';
import MergeModal from './modal/MergeModal';
import ResetModal from './modal/ResetModal';
// css
import './BranchActions.scss';


/**
  *  @param {Object} branch
  *  @param {Boolean} upToDate
  *  returns tooltip
  *  @return {Object}
  */
const getTooltip = (branch, upToDate) => {
  let resetTooltip = upToDate ? 'Branch up to date' : 'Reset Branch to Remote';
  resetTooltip = branch.isRemote ? 'Cannot reset a branch until it has been published' : resetTooltip;
  resetTooltip = (branch.isRemote && branch.branchName !== 'master') ? 'The master branch must be published first' : resetTooltip;
  const mergeTooltip = branch.isActive ? 'Cannot merge active branch with itself' : 'Merge into active branch';
  let deleteTooltip = branch.isActive ? 'Cannot delete Active branch' : 'Delete Branch';
  deleteTooltip = branch.branchName === 'master' ? 'Cannot delete master branch' : deleteTooltip;

  return {
    resetTooltip,
    mergeTooltip,
    deleteTooltip,
  };
};

type Props = {
  activeBranch: Object,
  allowSync: boolean,
  allowSyncPull: boolean,
  branch: {
    branchName: string,
    commitsAhead: Number,
    commitsBehind: Number,
    isActive: boolean,
    isRemote: boolean,
  },
  branchMutations: Object,
  defaultRemote: string,
  disableDropdown: boolean,
  handleSyncButton: Function,
  isOver: boolean,
  section: {
    description: string,
    name: string,
    owner: string,
  },
  setBranchUptodate: Function,
  showPullOnly: boolean,
  syncTooltip: string,
  toggleCover: Function,
  updateMigrationState: Function,
};

const BranchActions = ({
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
  setBranchUptodate,
  showPullOnly,
  syncTooltip,
  toggleCover,
  updateMigrationState,
}: Props) => {
  const [mergeModalVisible, setMergeModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const {
    description,
    name,
    owner,
  } = section;
  const upToDate = (branch.commitsAhead === 0) && (branch.commitsBehind === 0);
  const {
    resetTooltip,
    mergeTooltip,
    deleteTooltip,
  } = getTooltip(branch, upToDate);

  // declare css
  const mergeButtonCSS = classNames({
    BranchActions__btn: true,
    'Tooltip-data BranchActions__btn--merge': true,
    'BranchActions__btn--merge--selected': mergeModalVisible,
  });
  const deleteButtonCSS = classNames({
    BranchActions__btn: true,
    'Tooltip-data BranchActions__btn--delete': true,
    'BranchActions__btn--delete--selected': deleteModalVisible,
  });


  if (branch.isActive) {
    return (
      <ServerContext.Consumer>
        {value => (
          <div className="BranchActions">
            <button
              type="button"
              className="BranchActions__btn BranchActions__btn--create"
              disabled={!branch.isActive}
              data-tip="Create Branch"
              data-for="Tooltip--createBranch"
              onClick={() => setCreateModalVisible(!createModalVisible)}
            />
            <ReactTooltip
              id="Tooltip--createBranch"
              place="bottom"
              effect="solid"
            />
            <button
              type="button"
              className="BranchActions__btn BranchActions__btn--reset"
              data-tip={resetTooltip}
              data-for="Tooltip--reset"
              disabled={!branch.isRemote || upToDate || value.currentServer.backupInProgress}
              onClick={() => setResetModalVisible(!resetModalVisible)}
            />
            <ReactTooltip
              id="Tooltip--reset"
              place="bottom"
              effect="solid"
            />

            <SyncMenu
              allowSync={allowSync}
              allowSyncPull={allowSyncPull}
              currentServer={value.currentServer}
              defaultRemote={defaultRemote}
              disableDropdown={disableDropdown}
              handleSyncButton={handleSyncButton}
              showPullOnly={showPullOnly}
              syncTooltip={syncTooltip}
            />

            <ResetModal
              action="reset"
              branch={branch}
              branchMutations={branchMutations}
              modalVisible={resetModalVisible}
              section={section}
              setBranchUptodate={setBranchUptodate}
              toggleCover={toggleCover}
              toggleModal={setResetModalVisible}
            />

            <CreateBranch
              owner={owner}
              name={name}
              modalVisible={createModalVisible}
              description={description}
              toggleModal={setCreateModalVisible}
            />
          </div>
        )}
      </ServerContext.Consumer>
    );
  }
  // declare css here
  const branchActionsCSS = classNames({
    BranchActions: true,
    hidden: !isOver,
  });
  return (
    <ServerContext.Consumer>
      {(currentServer) => (
        <div className={branchActionsCSS}>
          <SwitchButton
            branch={branch}
            branchMutations={branchMutations}
            section={section}
            toggleCover={toggleCover}
            updateMigrationState={updateMigrationState}
          />
          <button
            type="button"
            className={mergeButtonCSS}
            data-tooltip={mergeTooltip}
            onClick={() => setMergeModalVisible(!mergeModalVisible)}
          />
          <button
            type="button"
            className={deleteButtonCSS}
            data-tooltip={deleteTooltip}
            disabled={branch.branchName === 'master'}
            onClick={() => setDeleteModalVisible(!deleteModalVisible)}
          />
          <DeleteModal
            branch={branch}
            branchMutations={branchMutations}
            currentServer={currentServer}
            modalVisible={deleteModalVisible}
            section={section}
            toggleCover={toggleCover}
            toggleModal={setDeleteModalVisible}
          />

          <MergeModal
            activeBranch={activeBranch}
            branch={branch}
            branchMutations={branchMutations}
            section={section}
            modalVisible={mergeModalVisible}
            toggleCover={toggleCover}
            toggleModal={setMergeModalVisible}
          />
        </div>
      )}
    </ServerContext.Consumer>
  );
};

export default BranchActions;
