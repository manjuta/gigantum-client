// vendor
import React, { Component } from 'react';
import { boundMethod } from 'autobind-decorator';
// components
import Modal from 'Components/common/Modal';
import AddPackages from './AddPackages';
import InstallProgress from './InstallProgress';
// assets
// import './PackageBody.scss';

export default class PackageModal extends Component {
  state = {
    buildId: null,
  }

  /**
    @param {String} buildId
    updates buildId in state
  */
  @boundMethod
  _setBuildId(buildId) {
    this.setState({ buildId });
  }

  render() {
    const { props } = this;
    return (
      <Modal
        size="large-full"
        handleClose={() => props.togglePackageModal(false)}
        renderContent={() => {
          const { state } = this;
          if (!state.buildId) {
            return (
              <AddPackages
                toggleModal={props.togglePackageModal}
                base={props.base}
                packages={props.packages}
                packageMutations={props.packageMutations}
                buildCallback={props.buildCallback}
                setBuildingState={props.setBuildingState}
                setBuildId={this._setBuildId}
                name={props.name}
                owner={props.owner}
              />
            )
          }
          return (
            <InstallProgress
              toggleModal={props.togglePackageModal}
              buildId={state.buildId}
            />
          )
        }}
      />
    );
  }
}
