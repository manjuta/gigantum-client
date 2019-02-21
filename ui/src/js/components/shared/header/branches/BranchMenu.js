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
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// store
import { setContainerMenuWarningMessage } from 'JS/redux/reducers/labbook/environment/environment';
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
      parentId: this.props.labbook.id,
      name: this.props.labbook.name,
      owner: this.props.labbook.owner,
    }),
    switchingBranch: false,
    sidePanelVisible: false,
    forceSyncModalVisible: false,
    publishModalVisible: false,
    publishDatasetsModalVisible: false,
    publishDatasetsModalAction: 'Publish',
    syncMenuVisible: false,
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
     this.setState({ [key]: value });
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
  *  @param {string, boolean} action, containerRunning
  *  displays container menu message
  *  @return {}
  */
  @boundMethod
  _showContainerMenuMessage(action, containerRunning) {
    const dispatchMessage = containerRunning ? `Stop Project before ${action}. \n Be sure to save your changes.` : `Project is ${action}. \n Please do not refresh the page.`;

    this.setState({ menuOpen: false });

    setContainerMenuWarningMessage(dispatchMessage);
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
     const { state } = this;
     this.setState({ switchMenuVisible: !state.switchMenuVisible });
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
      this.setState({ sidePanelVisible, switchMenuVisible: false });
  }

  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _sync() {
    const { props, state } = this;
    this.setState({ syncMenuVisible: false });
    if ((props.visibility !== 'public') || (props.visibility !== 'private')) {

    } else {

    }
  }

  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _pull() {
    const { props, state } = this;
    this.setState({ syncMenuVisible: false });
    if ((props.visibility !== 'public') || (props.visibility !== 'private')) {

    } else {

    }
  }

  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _publish() {
    const { props, state } = this;
    const data = {
      labbookId: props.labbook.id,
      setPublic: false,
      successCall: () => {},
      failureCall: () => {},
    };
    state.branchMutations.publishLabbook(data, (response, error) => {
      console.log(response, error)
    });
  }

  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _toggleSyncDropdown() {
    const { state } = this;
    this.setState({ syncMenuVisible: !state.syncMenuVisible });
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
  *  @param {}
  *  handles syncing or publishing the project
  *  @return {}
  */
  @boundMethod
  _handleSyncButton() {
    if (!this.props.defaultRemote) {
      this._togglePublishModal();
    } else {
      const data = {
          successCall: () => {
          },
          failureCall: () => {
          },
        };
      this.state.branchMutations.syncLabbook(data, (response, error) => {
        if (error) {
          console.log(error);
        }
      });
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
          switchDropdownCSS = classNames({
            'BranchMenu__dropdown-menu': true,
            hidden: !state.switchMenuVisible,
          }),
          drodownButtonCSS = classNames({
            'BranchMenu__dropdown-btn': true,
            'BranchMenu__dropdown-btn--open': state.switchMenuVisible,
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
            'BranchMenu__dropdown-menu': state.syncMenuVisible,
            hidden: !state.syncMenuVisible,
          }),
          syncMenuDropdownButtonCSS = classNames({
            'BranchMenu__btn BranchMenu__btn--sync-dropdown': true,
            'BranchMenu__btn--sync-open': state.syncMenuVisible,
          }),
          {
            activeBranch,
            filteredBranches,
            branchMenuList,
            otherBranchCount,
          } = extraxtActiveBranch(branches);
    return (
      <div className={branchMenuCSS}>
          <div className="BranchMenu__dropdown">
                <div
                onClick={() => this._toggleBranchSwitch() }
                className={drodownButtonCSS}>
                  <div className={branchNameCSS}>
                    <div className="BranchMenu__dropdown-label">Branch:</div>
                    <div className="BranchMenu__dropdown-text">{activeBranch.branchName}</div>
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
              className="BranchMenu__btn BranchMenu__btn--manage"
              type="Submit">
              Manage
            </button>
            <button
              className="BranchMenu__btn BranchMenu__btn--create"
              type="Submit"
              onClick={() => this._setModalState('createBranchVisible') }>
              Create
            </button>
            <div className="BranchMenu__sync-container">
              <button
                className="BranchMenu__btn BranchMenu__btn--sync"
                onClick={() => { this._sync(); }}
                type="Submit">
                <div className="BranchMenu__sync-status">
                  <div className="BranchMenu__sync-status--commits-behind">{ activeBranch.commitsBehind }</div>
                  <div className="BranchMenu__sync-status--commits-ahead">{ activeBranch.commitsAhead }</div>
                </div>
                <div className="BranchMenu__btn--text">Sync</div>
              </button>

              <button
                className={syncMenuDropdownButtonCSS}
                onClick={() => { this._toggleSyncDropdown(); }}
                type="Submit">
              </button>

              <div className={syncMenuDropdownCSS}>
                <h5 className="BranchMenu__h5">Sync</h5>
                <ul className="BranchMenu__ul">
                  <li
                     className="BranchMenu__list-item"
                     onClick={() => this._sync()}>
                     Push & Pull
                  </li>
                  <li
                     className="BranchMenu__list-item"
                     onClick={() => this._pull()}>
                      Pull-only
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <CreateBranch
            modalVisible={state.createBranchVisible}
            description={props.labbook.description}
            toggleModal={this._setModalState}
          />

          <Branches
            sidePanelVisible={state.sidePanelVisible}
            toggleSidePanel={this._toggleSidePanel}
            branches={props.labbook.branches}
            activeBranch={activeBranch}
            toggleModal={this._setModalState}
            isSticky={props.isSticky}
            branchMutations={state.branchMutations}
          />
          {
          state.publishModalVisible &&

          <VisibilityModal
            owner={props.labbook.owner}
            labbookName={props.labbook.name}
            labbookId={props.labbookId}
            remoteUrl={props.defaultRemote}
            auth={props.auth}
            buttonText="Publish"
            header="Publish"
            modalStateValue="visibilityModalVisible"
            sectionType={props.sectionType}
            setPublishingState={props.setPublishingState}
            checkSessionIsValid={this._checkSessionIsValid}
            toggleModal={this._togglePublishModal}
            showContainerMenuMessage={this._showContainerMenuMessage}
            resetState={this._resetState}
            resetPublishState={this._resetPublishState}
            setRemoteSession={this._setRemoteSession}
          />

        }
        {
          state.publishDatasetsModalVisible &&

          <PublishDatasetsModal
            owner={state.owner}
            labbookName={state.labbookName}
            labbookId={this.props.labbookId}
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
            showContainerMenuMessage={this._showContainerMenuMessage}
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
      </div>
    );
  }
}


export default BranchMenu;
