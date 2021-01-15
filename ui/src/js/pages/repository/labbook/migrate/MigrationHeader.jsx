// flow
import React from 'react';
import classNames from 'classnames';

type Props = {
  defaultRemote: string,
  diskLow: boolean,
  isDeprecated: boolean,
  isLocked: boolean,
  migrationInProgress: boolean,
  owner: string,
  shouldMigrate: boolean,
  toggleMigrationModal: Function,
}


/**
  @param {string} defaultRemote
  @param {boolean} isDeprecated
  @param {string} owner
  @param {boolean} shouldMigrate
  scrolls to top of window
  @return {boolean, string}
*/
const getMigrationInfo = (
  defaultRemote,
  isDeprecated,
  owner,
  shouldMigrate,
) => {
  const isOwner = (localStorage.getItem('username') === owner);
  const isPublished = typeof defaultRemote === 'string';

  let migrationText = '';
  let showMigrationButton = false;

  if (
    (isOwner && isDeprecated && shouldMigrate && isPublished)
      || (isDeprecated && !isPublished && shouldMigrate)
    ) {
    migrationText = 'This Project needs to be migrated to the latest Project format';
    showMigrationButton = true;
  } else if (!isOwner && isDeprecated && shouldMigrate && isPublished) {
    migrationText = 'This Project needs to be migrated to the latest Project format. The project owner must migrate and sync this project to update.';
  } else if ((isDeprecated && !isPublished && !shouldMigrate)
    || (isDeprecated && isPublished && !shouldMigrate)) {
    migrationText = 'This project has been migrated. Master is the new primary branch. Old branches should be removed.';
  }

  return { showMigrationButton, migrationText };
};

const MigrationHeader = (props: Props) => {
  const {
    defaultRemote,
    diskLow,
    isDeprecated,
    isLocked,
    migrationInProgress,
    owner,
    shouldMigrate,
    toggleMigrationModal,
  } = props;

  if (isDeprecated) {
    const { migrationText, showMigrationButton } = getMigrationInfo(
      defaultRemote,
      isDeprecated,
      owner,
      shouldMigrate,
    );
    // declare css here
    const deprecatedCSS = classNames({
      Labbook__deprecated: true,
      'Labbook__deprecated--disk-low': diskLow,
    });
    const migrationButtonCSS = classNames({
      'Tooltip-data': isLocked,
    });
    return (
      <div className={deprecatedCSS}>
        {migrationText}
        <a
          target="_blank"
          href="https://docs.gigantum.com/docs/project-migration"
          rel="noopener noreferrer"
        >
          Learn More.
        </a>
        {
          showMigrationButton
          && (
          <div
            className={migrationButtonCSS}
            data-tooltip="To migrate the project container must be Stopped."
          >
            <button
              className="Button Labbook__deprecated-action"
              onClick={() => toggleMigrationModal()}
              disabled={migrationInProgress || isLocked}
              type="button"
            >
              Migrate
            </button>
          </div>
          )
        }
      </div>
    );
  }

  return null;
};


export default MigrationHeader;
