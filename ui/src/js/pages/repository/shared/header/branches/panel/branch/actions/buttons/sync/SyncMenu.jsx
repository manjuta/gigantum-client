// @flow
// vendor
import React, { useState } from 'react';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';
// css
import './SyncMenu.scss';

type Props = {
  allowSync: boolean,
  allowSyncPull: boolean,
  currentServer: {
    backupInProgress: boolean,
  },
  defaultRemote: string,
  disableDropdown: boolean,
  handleSyncButton: Function,
  showPullOnly: boolean,
  syncTooltip: string,
};

const SyncMenu = ({
  allowSync,
  allowSyncPull,
  currentServer,
  defaultRemote,
  disableDropdown,
  handleSyncButton,
  showPullOnly,
  syncTooltip,
}: Props) => {
  const [syncMenuVisible, setSyncMenuVisible] = useState(false);


  const { backupInProgress } = currentServer;

  const syncDisabled = (showPullOnly && !allowSyncPull)
    || (!allowSync && !showPullOnly)
    || (!defaultRemote && !allowSync)
    || backupInProgress;
  // declare css here
  const syncButtonCSS = classNames({
    BranchActions__btn: true,
    'BranchActions__btn--sync': defaultRemote,
    'BranchActions__btn--push': !defaultRemote,
    'BranchActions__btn--pull': showPullOnly,
  });
  const syncMenuDropdownButtonCSS = classNames({
    'BranchActions__btn BranchActions__btn--sync-dropdown': true,
    'BranchActions__btn--sync-open': syncMenuVisible,
  });
  const syncMenuDropdownCSS = classNames({
    'SyncMenu__dropdown--menu': syncMenuVisible && !disableDropdown,
    hidden: !syncMenuVisible,
  });

  return (
    <div className="SyncMenu">
      <button
        type="button"
        className={syncButtonCSS}
        data-tip={syncTooltip}
        data-for="Tooltip--sync"
        disabled={syncDisabled}
        onClick={() => handleSyncButton(showPullOnly, allowSync, allowSyncPull)}
      />
      <ReactTooltip
        id="Tooltip--sync"
        place="bottom"
        effect="solid"
      />
      <button
        type="button"
        className={syncMenuDropdownButtonCSS}
        disabled={disableDropdown || backupInProgress}
        data-tip="You do not have the appropriate permissions to sync"
        data-for="Tooltip--syncDropdown"
        onClick={() => { setSyncMenuVisible(!syncMenuVisible); }}
      />
      <ReactTooltip
        id="Tooltip--syncDropdown"
        place="bottom"
        effect="solid"
      />
      <div className={syncMenuDropdownCSS}>
        <h5 className="SyncMenu__h5">Remote Action</h5>
        <ul className="SyncMenu__list">
          { allowSync
            && (
              <li
                className="SyncMenu__item"
                onClick={() => handleSyncButton(false, allowSync, allowSyncPull)}
                role="presentation"
              >
                Sync (Pull then Push)
              </li>
            )}

          <li
            className="SyncMenu__item"
            onClick={() => handleSyncButton(true, allowSync, allowSyncPull)}
            role="presentation"
          >
            Pull (Pull-only)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SyncMenu;
