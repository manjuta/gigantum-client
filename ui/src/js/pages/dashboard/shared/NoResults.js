// @flow
// vendor
import React, { PureComponent } from 'react';
// assets
import './NoResults.scss';

type Props = {
  setFilterValue: Function,
}

class NoResults extends PureComponent<Props> {
  render() {
    const { setFilterValue } = this.props;
    return (
      <div className="NoResults">

        <h3>No Results Found</h3>

        <p>
          Edit your filters above or
          {' '}
          <button
            type="button"
            className="Btn Btn--flat Btn--noPadding Btn--noMargin"
            onClick={() => setFilterValue({ target: { value: '' } })}
          >
           clear
          </button>
          {' '}
          to try again.
        </p>

      </div>
    );
  }
}

export default NoResults;
