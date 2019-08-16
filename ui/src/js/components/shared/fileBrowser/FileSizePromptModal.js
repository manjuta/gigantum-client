// @flow
import React, { PureComponent } from 'react';
// compontnents
import Modal from 'Components/common/Modal';


class FileSizePromptModal extends PureComponent {
  render() {
    const { props } = this;
    const {
      cancelUpload,
      userRejectsUpload,
      userAcceptsUpload,
      uploadPromptText,
    } = props;

    return (
      <Modal
        header="Large File Warning"
        handleClose={() => cancelUpload()}
        size="medium"
        renderContent={() => (
          <div className="FileBrowser__modal-body flex justify--space-between flex--column">

            <p>{ uploadPromptText }</p>

            <div className="FileBrowser__button-container flex justify--space-around">

              <button
                className="Btn--flat"
                onClick={() => cancelUpload()}
                type="button"
              >
              Cancel Upload
              </button>

              <button
                onClick={() => userRejectsUpload()}
                type="button"
              >
               Skip Large Files
              </button>

              <button
                onClick={() => userAcceptsUpload()}
                type="button"
              >
               Continue Upload
              </button>

            </div>

          </div>
        )
      }
      />
    );
  }
}

export default FileSizePromptModal;
