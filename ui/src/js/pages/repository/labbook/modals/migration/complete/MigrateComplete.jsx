// @flow
// vendor
import React from 'react';
// components
import UpdateText from './text/UpdateText';

type Props = {
  labbook: {
    defaultRemote: string,
  },
  migrateComplete: Boolean,
  toggleMigrationModal: Function,
}

const MigrateComplete = (props: Props) => {
  const {
    labbook,
    migrateComplete,
    toggleMigrationModal,
  } = props;

  if (migrateComplete) {
    return (
      <div className="Labbook__migration-container">
        <div className="Labbook__migration-content">
          <div className="Labbook__migration-center">
            <UpdateText defaultRemote={labbook.defaultRemote} />
            <a
              target="_blank"
              href="https://docs.gigantum.com/docs/project-migration"
              rel="noopener noreferrer"
            >
              Learn More.
            </a>
            <p>Remember to notify collaborators that this project has been migrated. They may need to re-import the project.</p>
          </div>
          <div className="Labbook__migration-buttons">
            <button
              type="button"
              className="Labbook__migration--dismiss"
              onClick={() => toggleMigrationModal()}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MigrateComplete;
