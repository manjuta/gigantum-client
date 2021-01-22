// vendor
import React from 'react';
// component
import Modal from 'Components/modal/Modal';
// css
import './SyncWarning.scss';

type Props = {
  handleSync: Function,
  toggleSyncWarningModal: Function,
  warningAction: string,
}

const SyncWarning = ({
  handleSync,
  toggleSyncWarningModal,
  warningAction,
}: Props) => {
  const capitalWarningAction = warningAction.charAt(0).toUpperCase() + warningAction.slice(1);

  return (
    <Modal
      handleClose={toggleSyncWarningModal}
      size="large-full"
    >
      <div className="SyncWarning flex flex--column align-items--center">
        <div className="SyncWarning__header">
          <h3 className="SyncWarning__header-text">
            Project Is Running
          </h3>
        </div>
        <div className="SyncWarning__subheader flex justify--space-between">
          <div className="flex flex--column align-items--center justify--center">
            <div className="SyncWarning__subheader-text">
              <p>
                <b>Warning:</b>
                {' '}
                You are attempting to
                {` ${capitalWarningAction} `}
                while this Project is still running!
              </p>
              <p>
                If your code is modifying files during the
                {` ${warningAction} `}
                process it may cause unncessary versioning, bloat, and in some cases corruption of the Project.
              </p>
            </div>
          </div>
        </div>
        <div className="SyncWarning__flex flex justify--center flex--column">
          <div className="SyncWarning__text align-self--center">
            If you know what you are doing and wish to proceed select 'Continue'.
          </div>
          <div className="SyncWarning__text SyncWarning__text--small align-self--center">
            Note: If you continue, sync again after stopping the Project to ensure all server-side environment changes are detected.
          </div>
          <p className="SyncWarning__text align-self--center">
            To
            {` ${warningAction} `}
            the Project safely, select 'Cancel' and stop the Project before
            {` ${warningAction}`}
            ing.
          </p>
        </div>
        <div className="SyncWarning__buttonContainer flex justify--right">
          <button
            className="Btn Btn--flat"
            onClick={toggleSyncWarningModal}
            type="button"
          >
            Cancel
          </button>
          <button
            className="Btn Btn--primary"
            onClick={handleSync}
            type="button"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SyncWarning;
