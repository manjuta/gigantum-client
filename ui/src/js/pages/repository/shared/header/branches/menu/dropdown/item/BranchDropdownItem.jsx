// @flow
// vendor
import React from 'react';
import classNames from 'classnames';

type Props = {
  branch: {
    branchName: string,
    isLocal: boolean,
    isRemote: boolean,
  },
  switchBranch: Function,
}

const BranchDropdownItem = (props: Props) => {
  const { branch, switchBranch } = props;
  // declare css jere
  const cloudIconCSS = classNames({
    BranchDropdownItem__icon: true,
    'BranchDropdownItem__icon--cloud': branch.isRemote,
    'BranchDropdownItem__icon--empty': !branch.isRemote,
  });
  const localIconCSS = classNames({
    BranchDropdownItem__icon: true,
    'BranchDropdownItem__icon--local': branch.isLocal,
    'BranchDropdownItem__icon--empty': !branch.isLocal,
  });

  return (
    <li
      onClick={() => switchBranch(branch)}
      key={branch.branchName}
      className="BranchMenu__list-item"
      role="presentation"
    >
      <div className="BranchMenu__text">{branch.branchName}</div>
      <div className="BranchDropdownItem__icons">
        <div className={cloudIconCSS} />
        <div className={localIconCSS} />
      </div>
    </li>
  );
};

export default BranchDropdownItem;
