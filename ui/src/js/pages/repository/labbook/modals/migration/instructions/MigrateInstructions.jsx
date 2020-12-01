// @flow
// vendor
import React from 'react';
// components
import ButtonLoader from 'Components/buttonLoader/ButtonLoader';

type Props = {
  buttonState: string,
  labbook: {
    activeBranchName: string,
    branches: Array<Object>,
  },
  migrateComplete: Boolean,
  migrateProject: Function,
  toggleMigrationModal: Function,
}

const MigrateInstructions = (props: Props) => {
  const workspaceName = ` gm.workspace-${localStorage.getItem('username')}`;
  const {
    buttonState,
    labbook,
    migrateComplete,
    migrateProject,
    toggleMigrationModal,
  } = props;

  const oldBranches = labbook.branches.filter((branch => branch.branchName.startsWith('gm.workspace') && branch.branchName !== labbook.activeBranchName));

  if (!migrateComplete) {
    return (
      <div className="Labbook__migration-container">
        <div className="Labbook__migration-content">
          <p className="Labbook__migration-p"><b>Migration will rename the current branch to 'master' and delete all other branches.</b></p>
          <p>Before migrating, you should:</p>
          <ul>
            <li>
              Make sure you are on the branch with your latest changes. This is most likely
              <b style={{ whiteSpace: 'nowrap' }}>
                {workspaceName}
              </b>
              . If you just imported this project from a zip file, you should migrate from
              <b style={{ whiteSpace: 'nowrap' }}>gm.workspace</b>
              .
            </li>
            <li>Export the project to a zip file as a backup, if desired.</li>
          </ul>
          <p>
            <b>Branch to be migrated:</b>
            {` ${labbook.activeBranchName}`}
          </p>
          <b>Branches to be deleted:</b>
          <ul>
            { oldBranches.length
              && oldBranches.map(({ branchname }) => (
                <li key={branchname}>{branchname}</li>
            ))}

            { (oldBranches.length === 0) &&
              <li>No other branches to delete.</li>
            }
          </ul>
        </div>
        <div className="Labbook__migration-buttons">
          <button
            onClick={() => toggleMigrationModal()}
            className="Btn--flat"
            type="button"
          >
            Cancel
          </button>
          <ButtonLoader
            buttonState={buttonState}
            buttonText="Migrate Project"
            className=""
            params={{}}
            buttonDisabled={false}
            clicked={() => migrateProject()}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default MigrateInstructions;
