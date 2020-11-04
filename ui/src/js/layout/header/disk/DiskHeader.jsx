// @flow
// vendor
import React, { Component } from 'react';
// config
import config from 'JS/config';
// css
import './DiskHeader.scss';

type Props = {
  available: Number,
  showDiskLow: boolean,
}

class DiskHeader extends Component<Props> {
  state = {
    showDiskWarning: this.props.showDiskLow,
  }

  hideDiskWarning = () => {
    this.setState({ showDiskLow: false });
  }

  render() {
    const {
      available,
    } = this.props;
    const {
      showDiskWarning,
    } = this.state;

    if (!showDiskWarning) {
      return null;
    }

    return (
      <div className="DiskHeader">
        Gigantum has only
        {` ${config.humanFileSize(available * 1000000000)} `}
        of remaining disk space.
        <a
          href="https://docs.gigantum.com/docs/manage-docker-disk-size"
          rel="noopener noreferrer"
          target="_blank"
        >
          Click here
        </a>
        {' '}
        to learn how to allocate more space to Docker, or free up existing storage in Gigantum.
        <button
          onClick={() => this.hideDiskWarning()}
          className="Btn__close Btn--round Btn--medium"
          type="button"
        />
      </div>
    );
  }
}


export default DiskHeader;
