// @flow
// vendor
import React from 'react';
// store
import {
  setErrorMessage,
} from 'JS/redux/actions/footer';

/**
  @param {Array} branches
  filters array branhces and return the active branch node
  @return {Object} activeBranch
*/
const switchBranch = (
  branch,
  branchMutations,
  section,
  toggleCover,
  updateMigrationState,
) => {
  const { owner, name } = section;
  const self = this;
  const data = {
    branchName: branch.branchName,
  };

  toggleCover('Switching Branches');

  branchMutations.switchBranch(data, (response, error) => {
    if (error) {
      setErrorMessage(owner, name, 'Failed to switch branches.', error);
    }
    // self.setState({ switchingBranch: false });
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
};


const SwitchButton = ({
  branch,
  branchMutations,
  section,
  toggleCover,
  updateMigrationState,
}) => (
  <button
    type="button"
    className="BranchActions__btn Tooltip-data BranchActions__btn--switch"
    data-tooltip="Switch to Branch"
    onClick={() => switchBranch(
      branch,
      branchMutations,
      section,
      toggleCover,
      updateMigrationState,
    )}
  />
);


export default SwitchButton;
