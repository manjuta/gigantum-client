// @flow
// vendor
import React from 'react';
import Converter from 'ansi-to-html';
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
  console.log(data);
  const {
    header,
    message,
  } = data;

  const headerModalText = `${remoteOperationPerformed} Error`;
  const convert = new Converter();
  const html = convert.toHtml(message.feedback);

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
          </h5>
          <p className="PublishSyncErrorModal__p">Remote operations usually fail because of network issues. Check to see if you have a stable internet connection and try again.</p>
        </div>


        <div className="PublishSyncErrorModal__error-details">
          <h6 className="PublishSyncErrorModal__h6 PublishSyncErrorModal__h6--error">{header}</h6>
          <div dangerouslySetInnerHTML={{ __html: html }} />
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
