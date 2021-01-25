// @flow
// vendor
import React from 'react';
// components
import Modal from 'Components/modal/Modal';
// css
import './PublishSyncErrorModal.scss';


type Props = {
  closeModal: Function,
  data: {
    header: string,
    message: string,
  },
  isVisible: boolean,
};


const PublishSyncErrorModal = ({
  closeModal,
  data,
  isVisible,
}: Props) => {
  if (!isVisible) {
    return null;
  }

  const {
    header,
    message,
  } = data;

  return (
    <Modal
      header="Sync Error"
      handleClose={closeModal}
      icon="sync"
      size="large"
    >
      <div className="PublishSyncErrorModal">
        <div className="PublishSyncErrorModal__text">
          <h5>{header}</h5>
          <p className="PublishSyncErrorModal__p PublishSyncErrorModal__p--error">{message}</p>
        </div>

        <div className="PublishSyncErrorModal__buttons">
          <button
            onClick={closeModal}
            type="button"
          >
            Dismiss
          </button>
        </div>
      </div>
    </Modal>
  );
};


export default PublishSyncErrorModal;
