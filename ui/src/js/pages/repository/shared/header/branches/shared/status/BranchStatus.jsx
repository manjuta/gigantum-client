// @flow
// vendor
import React from 'react';
import classNames from 'classnames';
// css
import './BranchStatus.scss';

/**
* Method returns status text
* @param {Boolean} isLocal
* @param {Boolean} isRemote
* @return {string}
*/
const getStatusText = (isLocal, isRemote) => {
  if (isLocal && isRemote) {
    return 'Local & Remote';
  }

  if (isLocal) {
    return 'Local only';
  }

  if (isRemote) {
    return 'Remote only';
  }

  return 'Error Fetching Branch State';
};

type Props = {
  hasMargin: Boolean,
  isLocal: Boolean,
  isRemote: Boolean,
}

const BranchStatus = ({
  hasMargin,
  isLocal,
  isRemote,
}: Props) => {
  const statusText = getStatusText(isLocal, isRemote);
  // declare css here
  const branchStatusCSS = classNames({
    'BranchStatus Tooltip-data Tooltip-data--small': true,
    'BranchStatus--margin': hasMargin,
  });
  return (
    <div
      className={branchStatusCSS}
      data-tooltip={statusText}
    >
      { isLocal
        ? <div className="BranchStatus__icon BranchStatus__icon--local" />
        : <div />}
      { isRemote
        ? <div className="BranchStatus__icon BranchStatus__icon--remote" />
        : <div />}
    </div>
  );
};


export default BranchStatus;
