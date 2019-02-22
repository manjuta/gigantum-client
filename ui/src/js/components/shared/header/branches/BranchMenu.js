// vendor
import React, { Component } from 'react';
import { boundMethod } from 'autobind-decorator';
import classNames from 'classnames';
// componenets
import Loader from 'Components/common/Loader';
import CreateBranch from 'Components/shared/modals/CreateBranch';
import ForceSync from 'Components/shared/modals/ForceSync';
import Branches from 'Components/shared/sidePanel/Branches';
import VisibilityModal from 'Components/shared/modals/VisibilityModal';
import PublishDatasetsModal from 'Components/shared/modals/PublishDatasetsModal';
import LoginPrompt from 'Components/shared/modals/LoginPrompt';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
import LinkedLocalDatasetsQuery from 'Components/shared/header/actionsSection/queries/LinkedLocalDatasetsQuery';
// utils
import BranchMutations from '../../utils/BranchMutations';
// assets
import './BranchMenu.scss';


/**
  @param {Array} branches
  filters array branhces and return the active branch node
  @return {Object} activeBranch
*/
const extraxtActiveBranch = (branches) => {
   const activeBranch = branches.filter(branch => branch.isActive)[0],
         filteredBranches = branches.filter(branch => !branch.isActive),
         branchMenuList = (filteredBranches.length > 3) ? filteredBranches.slice(0, 3) : filteredBranches,
         otherBranchCount = filteredBranches.length - branchMenuList.length;
         console.log(activeBranch)
   return ({
     activeBranch,
     filteredBranches,
     branchMenuList,
     otherBranchCount,
   });
};

class BranchMenu extends Component {
  state = {
    switchMenuVisible: false,
    createBranchVisible: false,
    branchMutations: new BranchMutations({
      parentId: this.props.sectionId,
      name: this.props.section.name,
      owner: this.props.section.owner,
    }),
    switchingBranch: false,
    sidePanelVisible: false,
    forceSyncModalVisible: false,
    publishModalVisible: false,
    publishDatasetsModalVisible: false,
    publishDatasetsModalAction: 'Publish',
    syncMenuVisible: false,
    showLoginPrompt: false,
    isDataset: this.props.sectionType !== 'labbook',
  };

  componentDidMount() {
    window.addEventListener('click', this._closePopups);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._closePopups);
  }

  /**
    *  @param {}
    *  returns UserIdentityQeury promise
    *  @return {promise}
    */
   @boundMethod
   _checkSessionIsValid() {
    return (UserIdentity.getUserIdentity());
  }

  /**
    @param {Array} branches
    filters array branhces and return the active branch node
    @return {Object} activeBranch
  */
  @boundMethod
  _setModalState(key) {
     const { state } = this;
     const value = !state[key];
     if (!this.props.isLocked && !this.state.isDataset) {
      this.setState({ [key]: value });
     }
  }

  /**
    @param {Array} branches
    filters array branhces and return the active branch node
    @return {Object} activeBranch
  */
  @boundMethod
  _switchBranch(branch) {
    const { state } = this,
          self = this,
          data = {
            branchName: branch.branchName,
          };
      this.setState({
        switchingBranch: branch.branchName,
        switchMenuVisible: false,
      });
      state.branchMutations.switchBranch(data, (response, error) => {
        self.setState({ switchingBranch: false });
      });
  }
  /**
  *  @param {Boolean} queryForLocalDatasets
  *  @param {Boolean} closePublishDatasetsModal
  *  adds remote url to labbook
  *  @return {string}
  */
  @boundMethod
  _togglePublishModal(queryForLocalDatasets, closePublishDatasetsModal) {
    if (this.props.isExporting) {
      setWarningMessage('Publishing is currently only available on the main workspace branch.');
      this.setState({ publishWarningVisible: true });
    } else if (queryForLocalDatasets && typeof queryForLocalDatasets === 'boolean') {
      LinkedLocalDatasetsQuery.getLocalDatasets({ ownowner, name: this.state.labbookName }).then((res) => {
          const localDatasets = res.data && res.data.labbook.linkedDatasets.filter(linkedDataset => linkedDataset.defaultRemote && linkedDataset.defaultRemote.slice(0, 4) !== 'http');
          if (localDatasets.length === 0) {
            this.setState({ publishModalVisible: !this.state.publishModalVisible });
          } else {
            this.setState({ localDatasets, publishDatasetsModalVisible: !this.state.publishDatasetsModalVisible, publishDatasetsModalAction: 'Publish' });
          }
      });
    } else if (closePublishDatasetsModal) {
      this.setState({ publishDatasetsModalVisible: !this.state.publishDatasetsModalVisible });
    } else {
      this.setState({ publishModalVisible: !this.state.publishModalVisible });
    }
  }

  /**
  *  @param {}
  *  resets state after publish
  *  @return {}
  */
  @boundMethod
  _resetState() {
    this.setState({
      remoteUrl: '',
      showLoginPrompt: true,
    });
  }

  /**
  *  @param {}
  *  resets state after publish
  *  @return {}
  */
  @boundMethod
  _resetPublishState(publishDisabled) {
    this.setState({
      menuOpen: false,
      publishDisabled,
    });
  }
  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _toggleBranchSwitch() {
    if (!this.props.isLocked && !this.state.isDataset) {
      const { state } = this;
      this.setState({ switchMenuVisible: !state.switchMenuVisible });
    }
  }

  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _closePopups(evt) {
     const { state } = this;
     if (evt.target.className.indexOf('BranchMenu') < 0) {
       this.setState({
         switchMenuVisible: false,
         syncMenuVisible: false,
       });
     }
  }

  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _toggleSidePanel(sidePanelVisible) {
      if (!this.props.isLocked && !this.state.isDataset) {
        this.setState({ sidePanelVisible, switchMenuVisible: false });
      }
  }

  /**
  *  @param {}
  *  closes login prompt modal
  *  @return {}
  */
  @boundMethod
  _closeLoginPromptModal() {
    this.setState({ showLoginPrompt: false });
  }
  /**
    @param {Boolean} - allowSync
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _toggleSyncDropdown(allowSync) {
    if (allowSync && !this.state.isDataset) {
      const { state } = this;
      this.setState({ syncMenuVisible: !state.syncMenuVisible });
    }
  }
  /**
  *  @param {}
  *  resets state after publish
  *  @return {}
  */
  @boundMethod
  _setRemoteSession() {
    this.setState({
      addedRemoteThisSession: true,
      remoteUrl: `https://gigantum.com/${this.state.owner}/${this.state.labbookName}`,
    });
  }
  /**
  *  @param {Boolean} - pullOnly
  *  @param {Boolean} - allowSync
  *  handles syncing or publishing the project
  *  @return {}
  */
  @boundMethod
  _handleSyncButton(pullOnly, allowSync) {
    this.setState({ syncMenuVisible: false });
    if (allowSync) {
      if (!this.props.defaultRemote) {
        this._togglePublishModal();
      } else {
        const self = this;
        const data = {
            successCall: () => {
              this.props.setSyncingState(false);
              if (this.props.sectionType === 'labbook') {
                this.state.branchMutations.buildImage((response, error) => {
                  if (error) {
                    console.error(error);

                    setMultiInfoMessage(id, `ERROR: Failed to build ${this.props.section.name}`, null, true, error);
                  }
                });
              }
            },
            failureCall: () => {
              this.props.setSyncingState(false);
              if ((errorMessage.indexOf('MergeError') > -1) || (errorMessage.indexOf('Cannot merge') > -1) || (errorMessage.indexOf('Merge conflict') > -1)) {
                self._toggleSyncModal();
              }
            },
            force: false,
            pullOnly: pullOnly || false,
          };

        this._checkSessionIsValid().then((response) => {
          if (!navigator.onLine) {
            self.setState({ showLoginPrompt: true });
          } else if (!(response.data && response.data.userIdentity && response.data.userIdentity.isSessionValid)) {
            this.props.auth.renewToken(true, () => {
              self.setState({ showLoginPrompt: true });
            }, () => {
              self._sync(pullOnly);
            });
          } else if (this.props.sectionType !== 'labbook') {
            this.state.branchMutations.syncDataset(data, (response, error) => {
              if (error) {
                data.failureCall(error);
              }
            });
          } else {
            LinkedLocalDatasetsQuery.getLocalDatasets({ owner: this.props.section.owner, name: this.props.section.name }).then((res) => {
              const localDatasets = res.data && res.data.labbook.linkedDatasets.filter(linkedDataset => linkedDataset.defaultRemote && linkedDataset.defaultRemote.slice(0, 4) !== 'http');
              if (localDatasets.length === 0) {
                this.props.setSyncingState(true);

                this.state.branchMutations.syncLabbook(data, (response, error) => {
                  if (error) {
                    data.failureCall(error);
                  }
                });
              } else {
                this.setState({ localDatasets, publishDatasetsModalVisible: !this.state.publishDatasetsModalVisible, publishDatasetsModalAction: 'Sync' });
              }
          });
          }
        });
      }
    }
  }

    /**
    *  @param {}
    *  toggles sync modal
    *  @return {string}
    */
   @boundMethod
    _toggleSyncModal() {
      this.setState({ forceSyncModalVisible: !this.state.forceSyncModalVisible });
    }

  render() {
    const { props, state } = this,
          { branches } = props,
          branchMenuCSS = classNames({
            BranchMenu: true,
            hidden: props.isSticky,
          }),
          {
            activeBranch,
            filteredBranches,
            branchMenuList,
            otherBranchCount,
          } = extraxtActiveBranch(branches),
          upToDate = activeBranch.commitsAhead === 0 && activeBranch.commitsBehind === 0,
          defaultDatasetMessage = 'Datasets does not currently support branching features',
          allowSync = !(activeBranch.branchName !== 'master' && !this.props.defaultRemote) && !props.isLocked,
          allowReset = !props.isLocked && !upToDate && activeBranch.isRemote,
          syncTooltip = props.isLocked ? 'Cannot Sync while Project is in use' : (activeBranch.branchName !== 'master' && !this.props.defaultRemote) ? 'Must sync Master branch first' : 'Sync',
          manageTooltip = props.isLocked ? 'Cannot Manage Branches while Project is in use' : state.isDataset ? defaultDatasetMessage : 'Manage',
          createTooltip = props.isLocked ? 'Cannot Create Branch while Project is in use' : state.isDataset ? defaultDatasetMessage : 'Create',
          resetTooltip = state.isDataset ? defaultDatasetMessage : props.isLocked ? 'Cannot Reset Branch while Project is in use' : !activeBranch.isRemote ? 'Branch must be remote' : upToDate ? 'Branch up to date' : 'Reset',
          switchTooltip = props.isLocked ? 'Cannot switch branches while Project is in use' : state.isDataset ? defaultDatasetMessage : '',
          smallWidth = window.innerWidth <= 1180,
          statusText = activeBranch.isRemote ? 'Local & Remote' : 'Local only',
          switchDropdownCSS = classNames({
            'BranchMenu__dropdown-menu': true,
            hidden: !state.switchMenuVisible,
          }),
          drodownButtonCSS = classNames({
            'BranchMenu__dropdown-btn': true,
            'BranchMenu__dropdown-btn--disabled': props.isLocked || state.isDataset,
            'BranchMenu__dropdown-btn--open': state.switchMenuVisible,
            'Tooltip-data Tooltip-data': props.isLocked || state.isDataset,
          }),
          branchNameCSS = classNames({
            'BranchMenu__branch-name': !state.switchingBranch,
            hidden: state.switchingBranch,
          }),
          branchSwitchingNameCSS = classNames({
            'BranchMenu__branch-name': state.switchingBranch,
            hidden: !state.switchingBranch,
          }),
          syncMenuDropdownCSS = classNames({
            'BranchMenu__dropdown-menu': state.syncMenuVisible && !props.isLocked,
            hidden: !state.syncMenuVisible,
          }),
          syncMenuDropdownButtonCSS = classNames({
            'BranchMenu__btn BranchMenu__btn--sync-dropdown': true,
            'BranchMenu__btn--sync-dropdown--disabled': !allowSync || state.isDataset,
            'BranchMenu__btn--sync-open': state.syncMenuVisible,
          }),
          syncCSS = classNames({
            'BranchMenu__btn BranchMenu__btn--sync': true,
            'BranchMenu__btn--sync--upToDate': upToDate,
            'BranchMenu__btn--sync--disabled': !allowSync,
            'Tooltip-data Tooltip-data': !allowSync || smallWidth || state.isDataset,
          }),
          manageCSS = classNames({
            'BranchMenu__btn BranchMenu__btn--manage': true,
            'BranchMenu__btn--manage--disabled': props.isLocked || state.isDataset,
            'Tooltip-data Tooltip-data': props.isLocked || smallWidth || state.isDataset,
          }),
          resetCSS = classNames({
            'BranchMenu__btn BranchMenu__btn--reset': true,
            'BranchMenu__btn--reset--disabled': !allowReset || state.isDataset,
            'Tooltip-data Tooltip-data': !allowReset || smallWidth || state.isDataset,
          }),
          createCSS = classNames({
            'BranchMenu__btn BranchMenu__btn--create': true,
            'BranchMenu__btn--create--disabled': props.isLocked || state.isDataset,
            'Tooltip-data Tooltip-data': props.isLocked || smallWidth || state.isDataset,
          });
    return (
      <div className={branchMenuCSS}>
          <div className="BranchMenu__dropdown">
                <div
                onClick={() => this._toggleBranchSwitch() }
                data-tooltip={switchTooltip}
                className={drodownButtonCSS}>
                  <div className={branchNameCSS}>
                    <div className="BranchMenu__dropdown-label">Branch:</div>
                    <div className="BranchMenu__dropdown-text">{activeBranch.branchName}</div>
                  </div>
                  <div
                    className="BranchMenu__status Tooltip-data Tooltip-data--small"
                    data-tooltip={statusText}
                  >
                    {
                      activeBranch.isLocal ?
                      <div className="BranchMenu__status--local"></div>
                      :
                      <div></div>
                    }
                    {
                      activeBranch.isRemote ?
                      <div className="BranchMenu__status--remote"></div>
                      :
                      <div></div>
                    }
                  </div>

                  <div className={branchSwitchingNameCSS}>
                    <span className="BranchMenu__dropdown-label">Branch:</span>
                    <span className="BranchMenu__dropdown-text ">
                      {`switching to ${state.switchingBranch}...`}
                    </span>
                  </div>
                </div>
                <div className={switchDropdownCSS}>
                  <h5 className="BranchMenu__h5">Quick Switch</h5>
                  <ul className="BranchMenu__ul">
                    {
                      branchMenuList.map((branch) => {
                        const cloudIconCSS = classNames({
                            BranchMenu__icon: true,
                            'BranchMenu__icon--cloud': branch.isRemote,
                            'BranchMenu__icon--empty': !branch.isRemote,
                          }),
                          localIconCSS = classNames({
                            BranchMenu__icon: true,
                            'BranchMenu__icon--local': branch.isLocal,
                            'BranchMenu__icon--empty': !branch.isLocal,
                          });

                        return (<li
                            onClick={ () => this._switchBranch(branch) }
                            key={branch.branchName}
                            className="BranchMenu__list-item">
                            <div className="BranchMenu__text">{branch.branchName}</div>
                            <div className="BranchMenu__icons">
                              <div className={cloudIconCSS}></div>
                              <div className={localIconCSS}></div>
                            </div>
                          </li>);
                      })
                    }

                    {
                      (otherBranchCount > 0)
                      && <div className="BranchMenu__other-text">{`+${otherBranchCount} others` }</div>
                    }

                    { (filteredBranches.length === 0)
                      &&
                      <li className="BranchMenu__list-item">
                        There is only a master branch associacted with this project, would you like to
                        <button className="Btn--flat">create a new branch?</button>
                      </li>
                    }
                  </ul>
                  <div className="BranchMenu__menu-button">
                    <button
                      onClick={() => this._toggleSidePanel(true)}
                      className="BranchMenu__button Btn--flat">
                        Manage Branches
                    </button>
                  </div>
                </div>
          </div>
          <div className="BranchMenu__buttons">
            <button
              onClick={() => this._toggleSidePanel(true)}
              className={manageCSS}
              data-tooltip={manageTooltip}
              type="Submit">
              Manage
            </button>
            <button
              className={createCSS}
              type="Submit"
              data-tooltip={createTooltip}
              onClick={() => this._setModalState('createBranchVisible') }>
              Create
            </button>
            <button
              className={resetCSS}
              type="Submit"
              data-tooltip={resetTooltip}
              // onClick={() => this._setModalState('createBranchVisible') }
              >
              Reset
            </button>
            <div className="BranchMenu__sync-container">
              <button
                className={syncCSS}
                onClick={() => { this._handleSyncButton(false, allowSync); }}
                data-tooltip={syncTooltip}
                type="Submit">
                {
                  !upToDate && allowSync &&
                  <div className="BranchMenu__sync-status">
                    {
                      activeBranch.commitsBehind !== 0 &&
                      <div className="BranchMenu__sync-status--commits-behind">{ activeBranch.commitsBehind }</div>
                    }
                    {
                      activeBranch.commitsAhead !== 0 &&
                      <div className="BranchMenu__sync-status--commits-ahead">{ activeBranch.commitsAhead }</div>
                    }
                  </div>
                }
                <div
                  className="BranchMenu__btn--text"
                >
                  Sync
                </div>
              </button>

              <button
                className={syncMenuDropdownButtonCSS}
                onClick={() => { this._toggleSyncDropdown(allowSync); }}
                type="Submit">
              </button>

              <div className={syncMenuDropdownCSS}>
                <h5 className="BranchMenu__h5">Sync</h5>
                <ul className="BranchMenu__ul">
                  <li
                     className="BranchMenu__list-item"
                     onClick={() => this._handleSyncButton(false, allowSync)}>
                     Push & Pull
                  </li>
                  <li
                     className="BranchMenu__list-item"
                     onClick={() => this._handleSyncButton(true, allowSync)}>
                      Pull-only
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <CreateBranch
            modalVisible={state.createBranchVisible}
            description={props.section.description}
            toggleModal={this._setModalState}
          />

          <Branches
            sidePanelVisible={state.sidePanelVisible}
            toggleSidePanel={this._toggleSidePanel}
            branches={props.branches}
            activeBranch={activeBranch}
            toggleModal={this._setModalState}
            isSticky={props.isSticky}
            branchMutations={state.branchMutations}
            isLocked={props.isLocked}
            handleSyncButton={this._handleSyncButton}
            allowSync={allowSync}
          />
          {
          state.publishModalVisible &&

          <VisibilityModal
            owner={props.section.owner}
            labbookName={props.section.name}
            labbookId={props.sectionId}
            remoteUrl={props.defaultRemote}
            auth={props.auth}
            buttonText="Publish"
            header="Publish"
            modalStateValue="visibilityModalVisible"
            sectionType={props.sectionType}
            setPublishingState={props.setPublishingState}
            checkSessionIsValid={this._checkSessionIsValid}
            toggleModal={this._togglePublishModal}
            resetState={this._resetState}
            resetPublishState={this._resetPublishState}
            setRemoteSession={this._setRemoteSession}
          />

        }
        {
          state.publishDatasetsModalVisible &&

          <PublishDatasetsModal
            owner={this.props.section.owner}
            labbookName={this.props.section.name}
            labbookId={this.props.sectionId}
            remoteUrl={this.props.remoteUrl}
            auth={this.props.auth}
            buttonText="Publish All"
            header={state.publishDatasetsModalAction}
            pullOnly={state.pullOnly}
            modalStateValue="visibilityModalVisible"
            sectionType={this.props.sectionType}
            setPublishingState={this.props.setPublishingState}
            setSyncingState={this.props.setSyncingState}
            toggleSyncModal={this._toggleSyncModal}
            checkSessionIsValid={this._checkSessionIsValid}
            toggleModal={this._togglePublishModal}
            resetState={this._resetState}
            resetPublishState={this._resetPublishState}
            setRemoteSession={this._setRemoteSession}
            localDatasets={state.localDatasets || []}
          />

        }
        {
          state.forceSyncModalVisible &&

          <ForceSync
            toggleSyncModal={this._toggleSyncModal}
            sectionType={this.props.sectionType}
            pullOnly={state.pullOnly}
          />
        }
        {
          state.showLoginPrompt &&

          <LoginPrompt closeModal={this._closeLoginPromptModal} />
        }
      </div>
    );
  }
}


export default BranchMenu;
