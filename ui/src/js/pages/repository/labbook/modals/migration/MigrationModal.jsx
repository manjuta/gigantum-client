// @flow
// vendor
import React, { Component } from 'react';
// store
import { setInfoMessage } from 'JS/redux/actions/footer';
// mutations
import MigrateProjectMutation from 'Mutations/repository/migrate/MigrateProjectMutation';
// components
import Modal from 'Components/modal/Modal';
import MigrateInstructions from './instructions/MigrateInstructions';
import MigrateComplete from './complete/MigrateComplete';

type Props = {
  branchMutations: {
    deleteBranch: Function,
  },
  labbook: {
    activeBranchName: string,
    branches: Array<Object>,
    name: string,
    owner: string,
  },
  migrateComplete: Boolean,
  migrationModalVisible: Boolean,
  setParentState: Function,
  toggleMigrationModal: Function,
}

class MigrationModal extends Component<Props> {
  state = {
    buttonState: '',
  }

  /**
    migrates project
  */
  _migrateProject = () => {
    const { branchMutations, labbook, setParentState } = this.props;
    const { owner, name } = labbook;

    this.setState({ buttonState: 'loading' });

    MigrateProjectMutation(owner, name, (response, error) => {
      if (error) {
        this.setState({ buttonState: 'error' });
        setTimeout(() => {
          this.setState({ buttonState: '' });
        }, 2000);
      } else {
        setParentState({
          isDeprecated: false,
          shouldMigrate: false,
        });
        const oldBranches = labbook.branches.filter((branch => branch.branchName.startsWith('gm.workspace')));
        oldBranches.forEach(({ branchName }, index) => {
          const data = {
            branchName,
            deleteLocal: true,
            deleteRemote: true,
          };

          branchMutations.deleteBranch(data, (deleteResponse, delteError) => {
            if (delteError) {
              this.setState({ buttonState: 'error' });

              setTimeout(() => {
                this.setState({ buttonState: '' });
              }, 2000);
            }

            if (index === oldBranches.length - 1) {
              setParentState({
                migrateComplete: true,
                buttonState: 'finished',
              });
              setInfoMessage(owner, name, 'Project migrated successfully');
              setTimeout(() => {
                this.setState({ buttonState: '' });
              }, 2000);
            }
          });
        });
      }
    });
  }

  render() {
    const { buttonState } = this.state;
    const {
      labbook,
      migrateComplete,
      migrationModalVisible,
      toggleMigrationModal,
    } = this.props;
    const migrationModalType = migrateComplete ? 'large' : 'large-long';

    if (migrationModalVisible) {
      return (
        <Modal
          header="Project Migration"
          handleClose={() => toggleMigrationModal()}
          size={migrationModalType}
        >
          <div className="Labbook__migration-modal">
            <MigrateInstructions
              buttonState={buttonState}
              labbook={labbook}
              migrateComplete={migrateComplete}
              toggleMigrationModal={toggleMigrationModal}
            />

            <MigrateComplete
              labbook={labbook}
              migrateComplete={migrateComplete}
              toggleMigrationModal={toggleMigrationModal}
            />
          </div>
        </Modal>
      );
    }

    return null;
  }
}

export default MigrationModal;
