// @flow
// vendor
import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import shallowCompare from 'react-addons-shallow-compare';
// store
import { setErrorMessage } from 'JS/redux/actions/footer';
// components
import SidePanel from 'Components/sidePanel/SidePanel';
import Branch from './branch/Branch';
import BranchSelectWrapper from './branch/BranchSelectWrapper';
// assets
import './BranchesSidePanel.scss';


type Props = {
  activeBranch: {
    branchName: string,
    commitsAhead: Number,
    commitsBehind: Number,
    isRemote: boolean,
  },
  branches: Array,
  branchMutations: {
    buildImage: Function,
    mergeBranch: Function,
  },
  disableDropdown: boolean,
  name: string,
  owner: string,
  sidePanelVisible: boolean,
  setBranchUptodate: Function,
  toggleCover: Function,
}

class BranchesSidePanel extends Component<Props> {
  state = {
    sidePanelVisible: this.props.sidePanelVisible,
    selectedBranchname: null,
    currentIndex: 0,
  }

  static getDerivedStateFromProps(nextProps, state) {
    return ({
      sidePanelVisible: nextProps.sidePanelVisible,
      ...state,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  /**
    @param {Boolean} - isDown
    sets current index for viewing branches
  */
  _setIndex = (isDown) => {
    const { branches } = this.props;
    const branchCount = branches.length - 1;
    const { currentIndex } = this.state;
    if (isDown) {
      const newIndex = ((currentIndex + 5) > branchCount - 5)
        ? branchCount - 5
        : currentIndex + 5;
      this.setState({ currentIndex: newIndex });
    } else {
      const newIndex = ((currentIndex - 5) < 0)
        ? 0
        : (currentIndex - 5);
      this.setState({ currentIndex: newIndex });
    }
  }

  render() {
    const {
      activeBranch,
      branches,
      diskLow,
      isSticky,
      isDeprecated,
      sectionType,
      sidePanelVisible,
      toggleSidePanel,
    } = this.props;
    const { state } = this;

    const filteredBranches = branches.filter(branch => branch.branchName !== activeBranch.branchName).slice(state.currentIndex, state.currentIndex + 5);

    // declare css here
    const currentBranchNameCSS = classNames({
      'BranchesSidePanel__current-branchname': true,
      // TODO change based on commits ahead & behind
      'BranchesSidePanel__current-branchname--changed': false,
    });
    const modalCoverCSS = classNames({
      'BranchesSidePanel__Modal-cover': true,
      'BranchesSidePanel__Modal-cover--coverall': state.action,
    });
    const nextPreviousButtonCSS = classNames({
      'Btn BranchesSidePanel__loadMore flex justify--center': true,
      hidden: branches.length - 1 <= 5,
    });

    if (sidePanelVisible) {
      return (
        <SidePanel
          diskLow={diskLow}
          isSticky={isSticky}
          isDeprecated={isDeprecated}
          toggleSidePanel={toggleSidePanel}
        >
          <div className="BranchesSidePanel">
            <div className="BranchesSidePanel__header">
              <div className="BranchesSidePanel__title">Manage Branches</div>
            </div>
            <div className="BranchesSidePanel__label">Current Branch:</div>

            <Branch
              {...this.props}
              branch={activeBranch}
              activeBranch={activeBranch}
            />

            { (filteredBranches.length !== 0)
              && <div className="BranchesSidePanel__label">Other Branches:</div>
            }

            <button
              className={nextPreviousButtonCSS}
              disabled={state.currentIndex === 0}
              onClick={() => this._setIndex()}
              type="button"
            >
              <p>Previous</p>
              <div className="BranchesSidePanel__icon BranchesSidePanel__icon--up" />
            </button>

            { filteredBranches.map((branch) => (
              <BranchSelectWrapper
                key={`${branch.branchName}__branch`}
                {...this.props}
                activeBranch={activeBranch}
                branch={branch}
              />
            ))}

            <button
              type="button"
              className={nextPreviousButtonCSS}
              onClick={() => this._setIndex(true)}
              disabled={(state.currentIndex + 5) >= (branches.length - 1)}
            >
              <p>Next</p>
              <div className="BranchesSidePanel__icon BranchesSidePanel__icon--down" />
            </button>
          </div>
          <div id="confirmation__popup" />
        </SidePanel>
      );
    }

    return (null);
  }
}

export default BranchesSidePanel;
