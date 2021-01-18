// @flow
// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// store
import {
  setErrorMessage,
} from 'JS/redux/actions/footer';
// components
import BranchStatus from 'Pages/repository/shared/header/branches/shared/status/BranchStatus';
import BranchDropdownItem from './item/BranchDropdownItem';
import NoOtherBranches from './create/NoOtherBranches';
// css
import './BranchDropdown.scss';


/**
  @param {Array} branches
  filters array branhces and return the active branch node
  @return {Object} activeBranch
*/
const extractActiveBranch = (branches) => {
  const activeBranch = branches.filter(branch => branch.isActive)[0] || {};
  const filteredBranches = branches.filter(branch => !branch.isActive);
  const branchMenuList = (filteredBranches.length > 3)
    ? filteredBranches.slice(0, 3) : filteredBranches;
  const otherBranchCount = filteredBranches.length - branchMenuList.length;

  return ({
    activeBranch,
    filteredBranches,
    branchMenuList,
    otherBranchCount,
  });
};

/**
  @param {booleam} isLocked
  @param {boolean} isDataset
  Method returns swith tooltip text for a given state
  @return {String} switchTooltip
*/
const getSwitchTooltip = (isLocked, isDataset, defaultDatasetMessage) => {
  const switchTooltipLocked = isLocked ? 'Cannot switch branches while Project is in use' : 'Switch Branches';
  const switchTooltip = isDataset ? defaultDatasetMessage : switchTooltipLocked;

  return switchTooltip;
};


type Props = {
  branches: Array,
  branchMutations: {
    buildImage: Function,
    switchBranch: Function,
  },
  defaultDatasetMessage: string,
  isLocked: boolean,
  section: {
    name: string,
    owner: string,
  },
  sectionType: string,
  toggleCover: Function,
  toggleSidePanel: Function,
  updateMigrationState: Function,
};

class BranchDropdown extends Component<Props> {
  state = {
    switchMenuVisible: false,
    switchingBranch: false,
  }

  componentDidMount() {
    window.addEventListener('click', this._closeDropdown);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this._closeDropdown);
  }

  /**
    Method closes dropdown when clicked off
  */
  _closeDropdown = (evt) => {
    if (this.branchDropdownRef && !this.branchDropdownRef.contains(evt.target)) {
      this.setState({ switchMenuVisible: false });
    }
  }

  /**
    @param {Array} branches
    filters array branhces and return the active branch node
    @return {Object} activeBranch
  */
  _switchBranch = (branch) => {
    const {
      branchMutations,
      section,
      toggleCover,
      updateMigrationState,
    } = this.props;
    const { owner, name } = section;
    const self = this;
    const data = {
      branchName: branch.branchName,
    };

    this.setState({
      switchingBranch: branch.branchName,
      switchMenuVisible: false,
    });

    toggleCover('Switching Branches');

    branchMutations.switchBranch(data, (response, error) => {
      if (error) {
        setErrorMessage(owner, name, 'Failed to switch branches.', error);
      }
      self.setState({ switchingBranch: false });
      updateMigrationState(response);

      branchMutations.buildImage((buildResponse, buildError) => {
        setTimeout(() => {
          toggleCover(null);
        }, 3000);
        if (buildError) {
          setErrorMessage(owner, name, 'Failed to switch branches.', buildError);
        }
      });
    });
  }

  /**
    @param {} -
    sets state to toggle the switch dropdown
    @return {}
  */
  _toggleBranchSwitch = () => {
    const { isLocked } = this.props;
    const { isDataset } = this.state;

    if (!isLocked && !isDataset) {
      this.setState((state) => {
        const switchMenuVisible = !state.switchMenuVisible;
        return { switchMenuVisible };
      });
    }
  }

  render() {
    const {
      branches,
      defaultDatasetMessage,
      isLocked,
      section,
      sectionType,
      toggleSidePanel,
    } = this.props;
    const { switchingBranch, switchMenuVisible } = this.state;
    const {
      activeBranch,
      filteredBranches,
      branchMenuList,
      otherBranchCount,
    } = extractActiveBranch(branches);
    const isDataset = (sectionType !== 'labbook');
    const switchTooltip = getSwitchTooltip(
      isDataset,
      isLocked,
      defaultDatasetMessage,
    );
    // declare css here
    const switchDropdownCSS = classNames({
      BranchDropdown__menu: true,
      hidden: !switchMenuVisible,
    });
    const drodownButtonCSS = classNames({
      BranchDropdown__btn: true,
      'BranchDropdown__btn--disabled': isLocked || isDataset,
      'BranchDropdown__btn--open': switchMenuVisible,
      'Tooltip-data Tooltip-data': isLocked || isDataset,
    });
    const branchNameCSS = classNames({
      BranchDropdown__name: !switchingBranch,
      hidden: switchingBranch,
    });
    const branchSwitchingNameCSS = classNames({
      'BranchDropdown__name BranchDropdown__name--switching': switchingBranch,
      hidden: !switchingBranch,
    });

    return (
      <div
        className="BranchDropdown"
        ref={(ref) => { this.branchDropdownRef = ref; }}
      >
        <div
          onClick={() => this._toggleBranchSwitch()}
          data-tooltip={switchTooltip}
          className={drodownButtonCSS}
          role="presentation"
        >
          <div className={branchNameCSS}>
            <div className="BranchDropdown__label">Branch:</div>
            <div className="BranchDropdown__text">{activeBranch.branchName}</div>
          </div>

          <div className={branchSwitchingNameCSS}>
            <span className="BranchDropdown__label">Branch:</span>
            <span className="BranchDropdown__text ">
              {`switching to ${switchingBranch}...`}
            </span>
          </div>
          <BranchStatus
            hasMargin
            isLocal={activeBranch.isLocal}
            isRemote={activeBranch.isRemote}
          />
        </div>
        <div className={switchDropdownCSS}>
          <h5 className="BranchMenu__h5">Quick Switch</h5>
          <ul className="BranchMenu__ul">
            { branchMenuList.map((branch) => (
              <BranchDropdownItem
                branch={branch}
                key={branch.id}
                switchBranch={this._switchBranch}
              />
            ))}

            { (otherBranchCount > 0)
              && (
                <div className="BranchDropdown__other-text">
                  {`+${otherBranchCount} others`}
                </div>
              )}

            <NoOtherBranches
              filteredBranches={filteredBranches}
              section={section}
            />
          </ul>
          <div className="BranchDropdown__container">
            <button
              type="button"
              onClick={() => toggleSidePanel(true)}
              className="BranchDropdown__button--manage Btn--flat"
            >
              Manage Branches
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default BranchDropdown;
