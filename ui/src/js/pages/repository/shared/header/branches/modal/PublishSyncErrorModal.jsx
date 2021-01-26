// @flow
// vendor
import React from 'react';
// components
import Modal from 'Components/modal/Modal';
import OutputMessage from 'Components/output/OutputMessage';
// css
import './PublishSyncErrorModal.scss';


type Props = {
  closeModal: Function,
  data: {
    header: string,
    message: string,
  },
  isVisible: boolean,
  remoteOperationPerformed: string
};


const PublishSyncErrorModal = ({
  closeModal,
  data,
  isVisible,
  remoteOperationPerformed,
}: Props) => {
  if (!isVisible) {
    return null;
  }
  const {
    header,
    message,
  } = data;

  const headerModalText = `${remoteOperationPerformed} Error`;

  return (
    <Modal
      header={headerModalText}
      handleClose={closeModal}
      icon="sync-warning"
      size="large"
    >
      <div className="PublishSyncErrorModal">
        <div className="PublishSyncErrorModal__text">
          <h5>
            An error occured during
            {' '}
            {remoteOperationPerformed}
            . Please check your internet connection and try again.
          </h5>
        </div>


        <div className="PublishSyncErrorModal__error-details">
          <h6 className="PublishSyncErrorModal__h6 PublishSyncErrorModal__h6--error">{header}</h6>
          <OutputMessage message={message.feedback} />
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
