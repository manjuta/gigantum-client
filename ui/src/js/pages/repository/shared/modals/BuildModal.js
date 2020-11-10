// vendor
import React, { Component } from 'react';
// components
import Modal from 'Components/modal/Modal';
import BuildProgress from 'Components/buildProgress/BuildProgress';

export default props => (
  <Modal
    size="large-full"
    handleClose={() => props.setBuildId(null)}
  >
      <BuildProgress
        headerText="Building Project"
        toggleModal={props.setBuildId}
        buildId={props.buildId}
        keepOpen={props.keepOpen}
        owner={props.owner}
        name={props.name}
      />
  </Modal>
);
