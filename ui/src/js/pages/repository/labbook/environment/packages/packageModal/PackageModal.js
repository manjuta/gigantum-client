// @flow
// vendor
import React, { Component } from 'react';
// components
import Modal from 'Components/modal/Modal';
import BuildProgress from 'Components/buildProgress/BuildProgress';
import AddPackages from './AddPackages';

type Props = {
  togglePackageModal: Function
}

class PackageModal extends Component<Props> {
  state = {
    buildId: null,
  }

  /**
    @param {String} buildId
    updates buildId in state
  */
  _setBuildId = (buildId) => {
    this.setState({ buildId });
  }

  render() {
    const { togglePackageModal } = this.props;
    const { buildId } = this.state;
    return (
      <Modal
        size="large-full"
        handleClose={() => togglePackageModal(false)}
      >
        {(!buildId) &&
          <AddPackages
            {...this.props}
            setBuildId={this._setBuildId}
          />
        }

        {(buildId) &&
          <BuildProgress
            {...this.props}
            toggleModal={togglePackageModal}
            headerText="Installing Packages"
            buildId={buildId}
          />
        }
      </Modal>
    );
  }
}

export default PackageModal;
