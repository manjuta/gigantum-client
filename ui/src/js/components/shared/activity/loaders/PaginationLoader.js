// vendor
import React, { PureComponent } from 'react';
import classNames from 'classnames';

class PaginationLoader extends PureComponent {
  render() {
    const { props } = this;
    const PaginationLoaderCSS = classNames({
      [`ActivityCard ActivityCard__loader ActivityCard__loader--${props.index} card`]: props.isLoadingMore,
      'ActivityCard ActivityCard__loader-hidden': !props.isLoadingMore,
      'column-1-span-9': true,
    });

    return (
      <div
        key={`Activity-loader-card-${props.index}`}
        className={PaginationLoaderCSS}
      />
    );
  }
}

export default PaginationLoader;
