// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
import { boundMethod } from 'autobind-decorator';
// store
import { setInfoMessage } from 'JS/redux/actions/footer';
// mutations
import MigrateProjectMutation from 'Mutations/MigrateProjectMutation';
// components
import Modal from 'Components/common/Modal';
import ButtonLoader from 'Components/common/ButtonLoader';

class Migration extends Component {
  state = {
    migrationModalVisible: false,
    migrationInProgress: false,
    migrateComplete: false,
  }

  /**
    @param {}
    updates branchOpen state
  */
  _toggleMigrationModal() {
    this.setState((state) => {
      const migrationModalVisible = !state.migrationModalVisible;
      return { migrationModalVisible };
    });
  }

  /**
    migrates project
  */
  @boundMethod
  _migrateProject() {
    const { props, state } = this;
    const { owner, name } = props.labbook;

    this.setState({ buttonState: 'loading' });
    MigrateProjectMutation(owner, name, (response, error) => {
      if (error) {
        console.log(error);
        this.setState({ buttonState: 'error' });
        setTimeout(() => {
          this.setState({ buttonState: '' });
        }, 2000);
      } else {
        this.setState({
          isDeprecated: false,
          shouldMigrate: false,
        });
        const oldBranches = props.labbook.branches.filter((branch => branch.branchName.startsWith('gm.workspace')));
        oldBranches.forEach(({ branchName }, index) => {
          const data = {
            branchName,
            deleteLocal: true,
            deleteRemote: true,
          };

          state.branchMutations.deleteBranch(data, (deleteResponse, delteError) => {
            if (delteError) {
              this.setState({ buttonState: 'error' });

              setTimeout(() => {
                this.setState({ buttonState: '' });
              }, 2000);
            }

            if (index === oldBranches.length - 1) {
              this.setState({
                migrateComplete: true,
                buttonState: 'finished',
              });
              setInfoMessage('Project migrated successfully');
              setTimeout(() => {
                this.setState({ buttonState: '' });
              }, 2000);
            }
          });
        });
      }
    });
  }

  /**
    scrolls to top of window
    @return {boolean, string}
  */
  _getMigrationInfo() {
    const { props, state } = this;
    const isOwner = (localStorage.getItem('username') === props.labbook.owner);
    const {
      isDeprecated,
      shouldMigrate,
    } = state;
    const isPublished = typeof props.labbook.defaultRemote === 'string';

    let migrationText = '';
    let showMigrationButton = false;

    if ((isOwner && isDeprecated && shouldMigrate && isPublished)
        || (isDeprecated && !isPublished && shouldMigrate)) {
      migrationText = 'This Project needs to be migrated to the latest Project format';
      showMigrationButton = true;
    } else if (!isOwner && isDeprecated && shouldMigrate && isPublished) {
      migrationText = 'This Project needs to be migrated to the latest Project format. The project owner must migrate and sync this project to update.';
    } else if ((isDeprecated && !isPublished && !shouldMigrate)
      || (isDeprecated && isPublished && !shouldMigrate)) {
      migrationText = 'This project has been migrated. Master is the new primary branch. Old branches should be removed.';
    }
    props.showMigrationButtonCallback(showMigrationButton);
    return { showMigrationButton, migrationText };
  }

  render() {
    const { props, state } = this;
    const { migrationText, showMigrationButton } = this._getMigrationInfo();
    const { labbook } = props;
    const oldBranches = labbook.branches.filter((branch => branch.branchName.startsWith('gm.workspace') && branch.branchName !== labbook.activeBranchName));
    const migrationModalType = props.migrateComplete ? 'large' : 'large-long';
    // declare css here
    const deprecatedCSS = classNames({
      Labbook__deprecated: true,
      'Labbook__deprecated--demo': props.isDemo,
    });
    const migrationButtonCSS = classNames({
      'Tooltip-data': props.isLocked,
    });

    return (
      <div>
        { props.isDeprecated
          && (
          <div className={deprecatedCSS}>
            {migrationText}
            <a
              target="_blank"
              href="https://docs.gigantum.com/docs/project-migration"
              rel="noopener noreferrer"
            >
              Learn More.
            </a>
            { showMigrationButton
              && (
              <div
                className={migrationButtonCSS}
                data-tooltip="To migrate the project container must be Stopped."
              >
                <button
                  type="button"
                  className="Button Labbook__deprecated-action"
                  onClick={() => this._toggleMigrationModal()}
                  disabled={state.migrationInProgress || state.isLocked}
                >
                Migrate
                </button>
              </div>
              )
            }
          </div>
          )
        }
        { (state.migrationModalVisible)
          && (
          <Modal
            header="Project Migration"
            handleClose={() => this._toggleMigrationModal()}
            size={migrationModalType}
            renderContent={() => (
              <div className="Labbook__migration-modal">
                { !state.migrateComplete
                  ? (
                    <div className="Labbook__migration-container">
                      <div className="Labbook__migration-content">
                        <p className="Labbook__migration-p"><b>Migration will rename the current branch to 'master' and delete all other branches.</b></p>
                        <p>Before migrating, you should:</p>
                        <ul>
                          <li>
                            Make sure you are on the branch with your latest changes. This is most likely
                            <b style={{ whiteSpace: 'nowrap' }}>
                              {` gm.workspace-${localStorage.getItem('username')}`}
                            </b>
                            . If you just imported this project from a zip file, you should migrate from
                            <b style={{ whiteSpace: 'nowrap' }}> gm.workspace</b>
                            .
                          </li>
                          <li>Export the project to a zip file as a backup, if desired.</li>
                        </ul>
                        <p>
                          <b>Branch to be migrated:</b>
                          {` ${labbook.activeBranchName}`}
                        </p>
                        <b>Branches to be deleted:</b>
                        { oldBranches.length
                          ? (
                            <ul>
                              { oldBranches.map(({ branchName }) => (
                                <li key={branchName}>{branchName}</li>
                                ))
                              }
                              </ul>
                            )
                            : (
                              <ul>
                                <li>No other branches to delete.</li>
                              </ul>
                            )
                         }
                      </div>
                      <div className="Labbook__migration-buttons">
                        <button
                          type="button"
                          onClick={() => this._toggleMigrationModal()}
                          className="Btn--flat"
                        >
                        Cancel
                        </button>
                        <ButtonLoader
                          buttonState={this.state.buttonState}
                          buttonText="Migrate Project"
                          className=""
                          params={{}}
                          buttonDisabled={false}
                          clicked={() => this._migrateProject()}
                        />
                      </div>
                    </div>
                  )
                  : (
                    <div className="Labbook__migration-container">
                      <div className="Labbook__migration-content">
                        <div className="Labbook__migration-center">
                          { labbook.defaultRemote
                            ? (
                              <p>
                                You should now click
                                <b> sync </b>
                                to push the new
                                <b> master </b>
                                branch to the cloud. This is the new primary branch to work from.
                              </p>
                            )
                            : (
                              <p>
                                Your work has been migrated to the
                                <b> master </b>
                                branch. This is the new primary branch to work from.
                              </p>
                            )
                          }
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
                            onClick={() => this._toggleMigrationModal()}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }
              </div>
            )
            }
          />
        )
      }
      </div>
    );
  }
}


export default Migration
