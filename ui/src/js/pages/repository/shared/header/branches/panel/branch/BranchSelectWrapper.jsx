// @flow
// vendor
import React, { useState } from 'react';
import classNames from 'classnames';
// components
import Branch from './Branch';

type Props = {
  activeBranch: Object,
  branch: {
    branchName: string,
  },
  isOver: boolean,
}

const BranchSelectWrapper = (props: Props) => {
  const [isMouseOver, setMouseOver] = useState(false);
  const {
    activeBranch,
    branch,
    isOver,
  } = props;

  // declare css here
  const branchContainerCSS = classNames({
    Branches__branch: true,
    'Branches__branch--selected Branches__branch--active': isMouseOver,
  });

  return (
    <div
      className={branchContainerCSS}
      key={branch.branchName}
      onMouseEnter={(evt) => setMouseOver(true)}
      onMouseLeave={(evt) => setMouseOver(false)}
    >
      <Branch
        {...props}
        activeBranch={activeBranch}
        branch={branch}
        isOver={isMouseOver}
      />
    </div>
  );
};

export default BranchSelectWrapper;
