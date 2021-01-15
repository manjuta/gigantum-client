// @flow
// vendor
import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
// css
import './SyncBranchButtons.scss';

/**
* Method gets sync button text for the given state.
* @param {string} defaultRemote
* @param {boolean} showPullOnly
* @return {string}
*/
const getSyncButtonText = (defaultRemote, showPullOnly) => {
  if (!defaultRemote) {
    return 'Publish';
  }

  if (showPullOnly) {
    return 'Pull';
  }

  return 'Sync';
};

/**
* Method gets tooltip for commits ahead behind
* @param {string} activeBranch
* @return {string}
*/
const getCommitsTooltip = (activeBranch) => {
  const commitsBehindText = activeBranch.commitsBehind ? `${activeBranch.commitsBehind} Commits Behind, ` : '';
  const commitsAheadText = activeBranch.commitsAhead ? `${activeBranch.commitsAhead} Commits Ahead` : '';
  const commitTooltip = `${commitsBehindText} ${commitsAheadText}`;

  return commitTooltip;
};


type Props = {
  activeBranch: {
    commitsAhead: Number,
    commitsBehind: Number,
  },
  allowSync: boolean,
  allowSyncPull: boolean,
  currentServer: {
    backupInProgress: boolean,
  },
  defaultRemote: string,
  disableDropdown: boolean,
  handleSyncButton: Function,
  isLocked: boolean,
  showPullOnly: boolean,
  syncTooltip: string,
  upToDate: boolean,
};

const SyncBranchButtons = (props: Props) => {
  const {
    activeBranch,
    allowSync,
    allowSyncPull,
    currentServer,
    defaultRemote,
    disableDropdown,
    handleSyncButton,
    isLocked,
    showPullOnly,
    syncTooltip,
    upToDate,
  } = props;
  const { backupInProgress } = currentServer;
  const [menuVisible, updateMenuVisible] = useState(false);
  const [commitsHovered, updateCommitsHovered] = useState(false);

  const syncMenu = useRef();

  const syncButtonText = getSyncButtonText(defaultRemote, showPullOnly);
  const commitsTooltip = getCommitsTooltip(activeBranch);
  const syncButtonDisabled = (showPullOnly && !allowSyncPull)
   || (!defaultRemote && !allowSync)
   || (defaultRemote && !allowSync && !showPullOnly)
   || backupInProgress;
  const isCommitsOutOfSync = !upToDate && allowSync
    && (activeBranch.commitsAhead !== undefined)
    && (activeBranch.commitsAhead !== null);

  // declare functions here
  /**
  * Method triggers sync and closes menu
  * @param {boolean} isPullOnly
  */
  const handleSync = (isPullOnly) => {
    handleSyncButton(isPullOnly, allowSync, allowSyncPull);
    updateMenuVisible(false);
  };

  /**
  * Method closes modal if target is not contained in the component
  * @param {Object} evt
  */
  const closeModal = (evt) => {
    if (syncMenu && !syncMenu.current.contains(evt.target)) {
      updateMenuVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', closeModal);

    // returned function will be called on component unmount
    return () => {
      window.removeEventListener('click', closeModal);
    };
  }, []);

  // declare css here
  const syncMenuDropdownCSS = classNames({
    SyncBranchButtons__menu: true,
    hidden: !menuVisible || disableDropdown,
  });
  const syncMenuDropdownButtonCSS = classNames({
    'Btn--branch Btn--action SyncBranchButtons__dropdown': true,
    'SyncBranchButtons__dropdown--open': menuVisible,
  });
  const syncCSS = classNames({
    'Btn--branch Btn--action SyncBranchButtons__btn': true,
    'SyncBranchButtons__btn--publish': !defaultRemote,
    'SyncBranchButtons__btn--pull': showPullOnly,
    'SyncBranchButtons__btn--upToDate': defaultRemote
      && (upToDate || (activeBranch.commitsAhead === undefined) || isLocked)
      && !showPullOnly,
    'Tooltip-data': !commitsHovered,
  });
  return (
    <div
      className="SyncBranchButtons"
      ref={syncMenu}
    >
      <button
        className={syncCSS}
        onClick={() => { handleSyncButton(showPullOnly, allowSync, allowSyncPull); }}
        disabled={syncButtonDisabled}
        data-tooltip={syncTooltip}
        type="button"
      >
        { isCommitsOutOfSync
         && (
           <div
             className="SyncBranchButtons__sync-status Tooltip-data Tooltip-data--small"
             data-tooltip={commitsTooltip}
             onMouseEnter={() => updateCommitsHovered(true)}
             onMouseLeave={() => updateCommitsHovered(false)}
           >
             { ((activeBranch.commitsBehind !== 0)
               && (activeBranch.commitsBehind !== null))
               && (
                 <div className="SyncBranchButtons__commits-behind">
                   { activeBranch.commitsBehind }
                 </div>
               )}
             { ((activeBranch.commitsAhead !== 0)
               && (activeBranch.commitsAhead !== null))
               && (
                 <div className="SyncBranchButtons__commits-ahead">
                   { activeBranch.commitsAhead }
                 </div>
               )}
           </div>
         )}
        <div className="Btn--branch--text">{syncButtonText}</div>
      </button>

      <button
        className={syncMenuDropdownButtonCSS}
        disabled={disableDropdown}
        onClick={() => { updateMenuVisible(!menuVisible); }}
        type="submit"
      />

      <div className={syncMenuDropdownCSS}>
        <h5 className="BranchMenu__h5">Remote Action</h5>
        <ul className="BranchMenu__ul">
          { allowSync
             && (
             <li
               className="BranchMenu__list-item"
               onClick={() => handleSync(false)}
               role="presentation"
             >
               Sync (Pull then Push)
             </li>
             )}
          <li
            className="BranchMenu__list-item"
            onClick={() => handleSync(true)}
            role="presentation"
          >
            Pull (Pull-only)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SyncBranchButtons;
