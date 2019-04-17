// vendor
import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import { boundMethod } from 'autobind-decorator';
import shallowCompare from 'react-addons-shallow-compare';
// store
import { setErrorMessage } from 'JS/redux/actions/footer';
// components
import ForceMerge from 'Components/shared/modals/ForceMerge';
import SidePanel from './SidePanel';
// assets
import './Branches.scss';

/**
  @param {String} action
  returns headr text for the modal
  @return {string}
*/
const getHeaderText = (action) => {
  let headerText = action === 'merge' ? 'Merge Branches' : '';
  headerText = action === 'delete' ? 'Delete Branch' : headerText;
  headerText = action === 'reset' ? 'Reset Branch' : headerText;

  return headerText;
};

class Branches extends Component {
  state = {
    sidePanelVisible: false,
    selectedBranchname: null,
    action: null,
    mergeModalVisible: false,
    deleteModalVisible: false,
    resetModalVisible: false,
    localSelected: false,
    remoteSelected: false,
    currentIndex: 0,
    forceMergeModalVisible: false,
  }

  static getDerivedStateFromProps(nextProps, state) {
    return ({
      sidePanelVisible: nextProps.sidePanelVisible,
      ...state,
    });
  }

  componentDidMount() {
    window.addEventListener('click', this._closePopups);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._closePopups);
  }

  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _closePopups(evt) {
    if (evt.target.className.indexOf('Branches__btn--sync-dropdown') < 0) {
      this.setState({
        syncMenuVisible: false,
      });
    }
  }

  /**
    @param {String} modalName
    reverts state of passed in modalname
    @return {}
  */
  _toggleModal(modalName, branch) {
    const { props, state } = this;

    if ((modalName === 'mergeModal') && (props.activeBranch.branchName !== branch)) {
      const mergeModalVisible = branch || !state.mergeModalVisible;
      this.setState({ mergeModalVisible });
    } else if ((modalName === 'deleteModal')
      && (props.activeBranch.branchName !== branch)
      && (branch !== 'master')) {
      const deleteModalVisible = branch || !state.deleteModalVisible;
      this.setState({
        deleteModalVisible,
        localSelected: false,
        remoteSelected: false,
      });
    } else if ((modalName === 'resetModal')
      && (!branch || (props.activeBranch.branchName === branch))) {
      const upToDate = (props.activeBranch.commitsAhead === 0)
        && (props.activeBranch.commitsBehind === 0);

      if (props.activeBranch.isRemote && !upToDate) {
        const resetModalVisible = branch || !state.resetModalVisible;
        this.setState({ resetModalVisible });
      }
    }
  }

  /**
    @param {Object} branch
    @param {String} action
    Handles confirm button by doing appropriate action
    @return {}
  */
  _handleConfirm(branch, action) {
    if (action === 'merge') {
      this._mergeBranch(branch.branchName);
    } else if (action === 'delete') {
      this._deleteBranch(branch);
    } else if (action === 'reset') {
      this._resetBranch(branch);
    }
  }

  /**
    @param {Event} evt
    @param {String} selectedBranchname
    sets selected branch in state
    @return {}
  */
  _selectBranchname(evt, selectedBranchname) {
    const { state } = this;
    if (state.selectedBranchname !== selectedBranchname) {
      this.setState({ selectedBranchname });
    }
  }

  /**
    @param {Boolean} - isDown
    sets current index for viewing branches
  */
  _setIndex(isDown) {
    const { props, state } = this;
    const branchCount = props.branches.length - 1;
    const { currentIndex } = state;
    if (isDown) {
      const newIndex = ((currentIndex + 5) > branchCount - 5) ? branchCount - 5 : currentIndex + 5;
      this.setState({ currentIndex: newIndex });
    } else {
      const newIndex = ((currentIndex - 5) < 0) ? 0 : (currentIndex - 5);
      this.setState({ currentIndex: newIndex });
    }
  }

  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  @boundMethod
  _toggleSyncDropdown() {
    const { props } = this;
    if (!props.disableDropdown) {
      this.setState((state) => {
        const syncMenuVisible = !state.syncMenuVisible;
        return { syncMenuVisible };
      });
    }
  }

  /**
    @param {Object} branchName
    @param {String} overrideMethod
    filters array branhces and return the active branch node
  */
  @boundMethod
  _mergeBranch(branchName, overrideMethod) {
    const { props } = this;
    const self = this;
    const data = {
      branchName,
      overrideMethod,
    };

    props.toggleCover('Merging Branches');
    props.branchMutations.mergeBranch(data, (response, error) => {
      if (error) {
        const errorMessage = error[0].message;
        if (errorMessage.indexOf('Merge conflict') > -1) {
          self._toggleMergeModal();
        }
        setErrorMessage('Failed to merge branch', error);
      } else {
        self.setState({ action: null, mergeModalVisible: null });
      }
      props.toggleCover(null);
      props.branchMutations.buildImage((response, error) => {
        if (error) {
          setErrorMessage(`${props.labbookName} failed to build`, error);
        }
      });
    });
  }

  /**
    *  @param {}
    *  toggles merge modal
    *  @return {string}
    */
   @boundMethod
  _toggleMergeModal() {
    this.setState((state) => {
      const forceMergeModalVisible = !state.forceMergeModalVisible;
      return { forceMergeModalVisible };
    });
  }

  /**
    calls reset branch mutation
  */
  @boundMethod
   _resetBranch() {
     const { props } = this;
     const self = this;
     props.toggleCover('Resetting Branch');
     props.branchMutations.resetBranch((response, error) => {
       if (error) {
         setErrorMessage('Failed to reset branch', error);
       }
       props.setBranchUptodate();
       self.setState({ resetModalVisible: null });
       props.toggleCover(null);
     });
   }

  /**
    @param {Object} branch
    calls delete branch mutation
  */
  @boundMethod
  _deleteBranch(branch) {
    const { props, state } = this;
    const self = this;
    props.toggleCover('Deleting Branch');
    const data = {
      branchName: branch.branchName,
      deleteLocal: state.localSelected,
      deleteRemote: state.remoteSelected,
    };
    props.branchMutations.deleteBranch(data, (response, error) => {
      if (error) {
        setErrorMessage('Failed to delete branch', error);
      }
      self.setState({ deleteModalVisible: null });
      props.toggleCover(null);
    });
  }

  /**
    @param {Object} branch
    @param {String} action
    renders JSX for modal
    @return {JSX}
  */
  _renderModal(branch, action) {
    const { props, state } = this;
    const headerText = getHeaderText(action);
    const disableSubmit = (action === 'delete') && !state.localSelected && !state.remoteSelected;

    const localCheckboxCSS = classNames({
      'Tooltip-data': !branch.isLocal,
      Branches__label: true,
      'Branches__label--local': true,
      'Branches__label--disabled': !branch.isLocal,
    });
    const remoteCheckboxCSS = classNames({
      'Tooltip-data': !branch.isRemote,
      Branches__label: true,
      'Branches__label--remote': true,
      'Branches__label--disabled': !branch.isRemote,
    });
    return (
      <div className={`Branches__Modal Branches__Modal--${action}`}>
        <button
          type="button"
          className="Btn Btn--flat Branches__close"
          onClick={() => this._toggleModal(`${action}Modal`)}
        />
        <div className="Branches__Modal-header">
          {headerText}
        </div>
        <div className="Branches__Modal-text">
          { (action === 'merge')
            && (
            <p>
              You are about to merge the branch
              <b>{` ${branch.branchName} `}</b>
              with the current branch
              <b>{` ${props.activeBranch.branchName}`}</b>
              . Click 'Confirm' to proceed.
            </p>
            )
          }
          { (action === 'delete')
            && (
            <p>
              You are about to delete this branch. This action can lead to data loss. Please type
              <b>{` ${branch.branchName} `}</b>
              and click 'Confirm' to proceed.
            </p>
            )
          }
          { (action === 'reset')
            && (
            <p>
              You are about to reset this branch. Resetting a branch will get rid of local changes. Click 'Confirm' to proceed.
            </p>
            )
          }
        </div>
        { (action === 'delete')
          && (
          <div className="Branches__input-container">
            <label
              htmlFor="delete_local"
              className={localCheckboxCSS}
              data-tooltip="Branch does not exist Locally"
            >
              <input
                type="checkbox"
                name="delete_local"
                id="delete_local"
                defaultChecked={!branch.isLocal}
                disabled={!branch.isLocal}
                onClick={() => this.setState({ localSelected: !state.localSelected })}
              />
            Local
            </label>
            <label
              htmlFor="delete_remote"
              className={remoteCheckboxCSS}
              data-tooltip="Branch does not exist Remotely"
            >
              <input
                type="checkbox"
                name="delete_remote"
                id="delete_remote"
                disabled={!branch.isRemote}
                onClick={() => this.setState({ remoteSelected: !state.remoteSelected })}
              />
            Remote
            </label>
          </div>
          )
        }
        <div className="Branches__Modal-buttons">
          <button
            type="button"
            onClick={() => this._toggleModal(`${action}Modal`)}
            className="Btn--flat"
          >
            Cancel
          </button>
          <button
            type="button"
            className="Branches__Modal-confirm"
            disabled={disableSubmit}
            onClick={() => this._handleConfirm(branch, action)}
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }

  /**
    @param {Object} branch
    renders JSX for actions section
    @return {JSX}
  */
  _renderActions(branch) {
    const { props, state } = this;
    const mergeModalVisible = state.mergeModalVisible === branch.branchName;
    const deleteModalVisible = state.deleteModalVisible === branch.branchName;
    const resetModalVisible = state.resetModalVisible === branch.branchName;
    const upToDate = (branch.commitsAhead === 0) && (branch.commitsBehind === 0);
    const syncDisabled = (props.showPullOnly && !props.allowSyncPull) || (!props.allowSync && !props.showPullOnly) || (!props.defaultRemote && !props.allowSync);
    const resetTooltip = branch.isRemote ? upToDate ? 'Branch up to date' : 'Reset Branch to Remote' : 'Branch must be remote';
    const syncTooltip = props.syncTooltip;
    const mergeTooltip = branch.isActive ? 'Cannot merge active branch with itself' : 'Merge into active branch';
    const deleteTooltip = branch.branchName === 'master' ? 'Cannot delete master branch' : branch.isActive ? 'Cannot delete Active branch' : 'Delete Branch';
    // declare css
    const mergeButtonCSS = classNames({
      Branches__btn: true,
      'Tooltip-data Branches__btn--merge': true,
      'Branches__btn--merge--selected': mergeModalVisible,
    });
    const deleteButtonCSS = classNames({
      Branches__btn: true,
      'Tooltip-data Branches__btn--delete': true,
      'Branches__btn--delete--selected': deleteModalVisible,
    });
    const syncButtonCSS = classNames({
      'Branches__btn Tooltip-data': true,
      'Branches__btn--sync': props.defaultRemote,
      'Branches__btn--push': !props.defaultRemote,
      'Branches__btn--pull': props.showPullOnly,
    });
    const syncMenuDropdownButtonCSS = classNames({
      'Branches__btn Branches__btn--sync-dropdown': true,
      'Branches__btn--sync-open': state.syncMenuVisible,
      'Tooltip-data': props.disableDropdown && props.showPullOnly,
    });
    const syncMenuDropdownCSS = classNames({
      'Branches__dropdown-menu': state.syncMenuVisible && !props.disableDropdown,
      hidden: !state.syncMenuVisible,
    });

    return (
      <div className="Branches__actions-section">
        {
          branch.isActive
            ? (
              <Fragment>
                <button
                  type="button"
                  className="Branches__btn Branches__btn--create Tooltip-data"
                  disabled={!branch.isActive}
                  data-tooltip="Create Branch"
                  onClick={() => props.toggleModal('createBranchVisible')}
                />
                <button
                  type="button"
                  className="Branches__btn Tooltip-data Branches__btn--reset"
                  data-tooltip={resetTooltip}
                  disabled={!branch.isRemote || upToDate}
                  onClick={() => this._toggleModal('resetModal', branch.branchName)}
                />
                <button
                  type="button"
                  className={syncButtonCSS}
                  data-tooltip={syncTooltip}
                  disabled={syncDisabled}
                  onClick={() => props.handleSyncButton(props.showPullOnly, props.allowSync, props.allowSyncPull)}
                />
                <button
                  type="button"
                  className={syncMenuDropdownButtonCSS}
                  disabled={props.disableDropdown}
                  data-tooltip="You do not have the appropriate permissions to sync"
                  onClick={() => { this._toggleSyncDropdown(); }}
                />
                <div className={syncMenuDropdownCSS}>
                  <h5 className="Branches__h5">Remote Action</h5>
                  <ul className="Branches__ul">
                    {
                  props.allowSync
                  && (
                  <li
                    className="Branches__list-item"
                    onClick={() => props.handleSyncButton(false, props.allowSync, props.allowSyncPull)}
                  >
                      Sync (Pull then Push)
                  </li>
                  )
                }
                    <li
                      className="Branches__list-item"
                      onClick={() => props.handleSyncButton(true, props.allowSync, props.allowSyncPull)}
                    >
                    Pull (Pull-only)
                    </li>
                  </ul>
                </div>
              </Fragment>
            )
            : (
              <Fragment>
                <button
                  type="button"
                  className="Branches__btn Tooltip-data Branches__btn--switch"
                  data-tooltip="Switch to Branch"
                  onClick={() => props.switchBranch(branch)}
                />
                <button
                  type="button"
                  className={mergeButtonCSS}
                  data-tooltip={mergeTooltip}
                  onClick={() => this._toggleModal('mergeModal', branch.branchName)}
                />
                <button
                  type="button"
                  className={deleteButtonCSS}
                  data-tooltip={deleteTooltip}
                  disabled={branch.branchName === 'master'}
                  onClick={() => this._toggleModal('deleteModal', branch.branchName)}
                />
              </Fragment>
            )
        }
        {mergeModalVisible && this._renderModal(branch, 'merge')}
        {deleteModalVisible && this._renderModal(branch, 'delete')}
        {resetModalVisible && this._renderModal(branch, 'reset')}
      </div>
    );
  }

  render() {
    const { props, state } = this;

    const filteredBranches = props.branches.filter(branch => branch.branchName !== props.activeBranch.branchName).slice(state.currentIndex, state.currentIndex + 5);
    const activeUpToDate = props.activeBranch.commitsAhead === 0 && props.activeBranch.commitsBehind === 0;
    const statusText = props.activeBranch.isLocal ? props.activeBranch.isRemote ? 'Local & Remote' : 'Local only' : 'Remote only';
    const activeCommitsText = `${props.activeBranch.commitsBehind ? `${props.activeBranch.commitsBehind} Commits Behind, ` : ''} ${props.activeBranch.commitsAhead ? `${props.activeBranch.commitsAhead} Commits Ahead` : ''}`;

    // declare css here
    const currentBranchNameCSS = classNames({
      'Branches__current-branchname': true,
      // TODO change based on commits ahead & behind
      'Branches__current-branchname--changed': false,
    });
    const currentBranchContainerCSS = classNames({
      'Branches__branch--current': true,
      'Branches__branch--current--selected': state.mergeModalVisible || state.resetModalVisible,
    });
    const modalCoverCSS = classNames({
      'Branches__Modal-cover': true,
      'Branches__Modal-cover--coverall': state.action,
    });
    const bottomIndexSelectorCSS = classNames({
      'Btn Btn__loadMore Btn__loadMore--down': true,
      hidden: props.branches.length - 1 <= 5,
    });
    const topIndexSelectorCSS = classNames({
      'Btn Btn__loadMore Btn__loadMore--up': true,
      hidden: props.branches.length - 1 <= 5,
    });
    return (
      <div>
        { state.forceMergeModalVisible
          && (
          <ForceMerge
            toggleModal={this._toggleMergeModal}
            sectionType={props.sectionType}
            merge={this._mergeBranch}
            branchName={state.mergeModalVisible}
          />
          )
      }
        { props.sidePanelVisible
        && (
        <SidePanel
          toggleSidePanel={props.toggleSidePanel}
          isSticky={props.isSticky}
          isDeprecated={props.isDeprecated}
          renderContent={() => (
            <div className="Branches">
              {
                  (state.mergeModalVisible || state.deleteModalVisible || state.resetModalVisible || state.action)
                  && (
                  <div className={modalCoverCSS}>
                    { state.action
                        && <div>{`${state.action}...`}</div>
                      }
                  </div>
                  )
                }
              <div className="Branches__header">
                <div className="Branches__title">Manage Branches</div>
              </div>
              <div className="Branches__label">Current Branch:</div>
              <div className={currentBranchContainerCSS}>
                <div className="Branches__base-section">
                  <div className="Branches__branchname-container">
                    <div className="Branches__branchname">{props.activeBranch.branchName}</div>
                    <div className="Branches__details">
                      {
                         !activeUpToDate && (props.activeBranch.commitsAhead !== undefined) && (props.activeBranch.commitsAhead !== null)
                        && (
                        <div
                          className="Branches__commits Tooltip-data"
                          data-tooltip={activeCommitsText}
                        >
                          { (props.activeBranch.commitsBehind !== 0)
                           && (
                           <div className="Branches__commits--commits-behind">
                             { props.activeBranch.commitsBehind }
                           </div>
                           )
                          }
                          { (props.activeBranch.commitsAhead !== 0)
                            && (
                            <div className="Branches__commits--commits-ahead">
                              { props.activeBranch.commitsAhead }
                            </div>
                            )
                          }
                        </div>
                        )
                      }
                      <div
                        className="Branches__status Tooltip-data Tooltip-data--small"
                        data-tooltip={statusText}
                      >
                        { props.activeBranch.isLocal
                          ? <div className="Branches__status--local" />
                          : <div />
                        }
                        { props.activeBranch.isRemote
                          ? <div className="Branches__status--remote" />
                          : <div />
                        }
                      </div>
                    </div>
                  </div>
                </div>
                { this._renderActions(props.activeBranch) }
              </div>
              { (filteredBranches.length !== 0)
                && <div className="Branches__label">Other Branches:</div>
              }
              <button
                className={topIndexSelectorCSS}
                onClick={() => this._setIndex()}
                disabled={state.currentIndex === 0}
              />
              { filteredBranches.map((branch) => {
                const mergeModalVisible = (state.mergeModalVisible === branch.branchName);
                const deleteModalVisible = (state.deleteModalVisible === branch.branchName);
                const branchUpToDate = branch.commitsAhead === 0 && branch.commitsBehind === 0;
                const branchStatusText = branch.isLocal ? branch.isRemote ? 'Local & Remote' : 'Local only' : 'Remote only';


                const branchContainerCSS = classNames({
                  Branches__branch: true,
                  'Branches__branch--selected': (branch.branchName === state.mergeModalVisible) || (branch.branchName === state.deleteModalVisible),
                  'Branches__branch--active': ((state.selectedBranchname === branch.branchName) || mergeModalVisible || deleteModalVisible),
                });
                const branchBaseSectionCSS = classNames({
                  'Branches__base-section': true,
                });
                const commitsText = `${branch.commitsBehind ? `${branch.commitsBehind} Commits Behind, ` : ''} ${branch.commitsAhead ? `${branch.commitsAhead} Commits Ahead` : ''}`;
                return (
                  <div
                    key={branch.branchName}
                    className={branchContainerCSS}
                    onMouseEnter={evt => this._selectBranchname(evt, branch.branchName)}
                    onMouseLeave={evt => this._selectBranchname(evt, null)}
                  >
                    <div className={branchBaseSectionCSS}>
                      <div className="Branches__branchname-container">
                        <div className="Branches__branchname">{branch.branchName}</div>
                        <div className="Branches__details">
                          { !branchUpToDate && (branch.commitsAhead !== undefined) && (branch.commitsAhead !== null) && (
                          <div
                            className="Branches__commits Tooltip-data"
                            data-tooltip={commitsText}
                          >
                            { (branch.commitsBehind !== 0)
                                  && <div className="Branches__commits--commits-behind">{ branch.commitsBehind }</div>
                                }
                            { (branch.commitsAhead !== 0)
                                  && <div className="Branches__commits--commits-ahead">{ branch.commitsAhead }</div>
                                }
                          </div>
                          )
                            }
                          <div
                            className="Branches__status Tooltip-data Tooltip-data--small"
                            data-tooltip={branchStatusText}
                          >
                            { branch.isLocal
                              ? <div className="Branches__status--local" />
                              : <div />
                            }
                            { branch.isRemote
                              ? <div className="Branches__status--remote" />
                              : <div />
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    { ((state.selectedBranchname === branch.branchName) || mergeModalVisible || deleteModalVisible)
                        && this._renderActions(branch)
                    }
                  </div>
                );
              })
              }
              <button
                type="button"
                className={bottomIndexSelectorCSS}
                onClick={() => this._setIndex(true)}
                disabled={(state.currentIndex + 5) >= (props.branches.length - 1)}
              />
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

export default Branches;
