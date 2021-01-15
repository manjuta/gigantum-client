// @flow
// vendor
import React from 'react';
// css
import './BranchCommits.scss';

type Props = {
  commitsAhead: Boolean,
  commitsBehind: Boolean,
}

const BranchCommits = ({
  commitsAhead,
  commitsBehind,
}: Props) => {
  const commitsText = `${commitsBehind ? `${commitsBehind} Commits Behind, ` : ''} ${commitsAhead ? `${commitsAhead} Commits Ahead` : ''}`;

  const upToDate = !((commitsAhead === 0) && (commitsBehind === 0))
    && (commitsAhead !== undefined) && (commitsAhead !== null);

  if (upToDate) {
    return (
      <div
        className="BranchesCommits Tooltip-data Tooltip-data--left"
        data-tooltip={commitsText}
      >
        { (commitsBehind !== 0)
           && (
           <div className="BranchesCommits__commits-behind">
             { commitsBehind }
           </div>
           )}
        { (commitsAhead !== 0)
            && (
            <div className="BranchesCommits__commits-ahead">
              { commitsAhead }
            </div>
            )}
      </div>
    );
  }

  return null;
};


export default BranchCommits;
