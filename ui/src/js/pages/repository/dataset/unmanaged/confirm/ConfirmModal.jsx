// @flow
import React from 'react';
// component
import Modal from 'Components/modal/Modal';

type Props = {
  confirmCancelConfigure: Function,
  configureDataset: Function,
  confirmMessage: string,
}

const ConfirmModal = (props: Props) => {
  const {
    confirmCancelConfigure,
    configureDataset,
    confirmMessage,
  } = props;

  if (confirmMessage) {
    return (
      <Modal
        size="small"
      >
        <div>
          {confirmMessage}
          <div className="Dataset__confirm-buttons">
            <button
              type="button"
              onClick={() => confirmCancelConfigure()}
              className="Btn--flat"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => configureDataset(true)}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return null;
};


export default ConfirmModal;
