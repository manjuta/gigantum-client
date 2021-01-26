// vendor
import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
// mutations
import SyncLabbookMutation from 'Mutations/branches/SyncLabbookMutation';
import SyncDatasetMutation from 'Mutations/branches/SyncDatasetMutation';
// component
import Modal from 'Components/modal/Modal';
// store
import { setMultiInfoMessage } from 'JS/redux/actions/footer';
// assets
import './ForceSync.scss';

type Props = {
  isVisible: boolean,
  name: string,
  owner: string,
  pullOnly: bool,
  sectionType: string,
  setPublishErrorState: Function,
  toggleSyncModal: Function,
};

export default class ForceSync extends Component<Props> {
  /**
  *  @param {}
  *  Triggers sync with the correct override method
  *  @return {}
  */
  _forceSync(method) {
    const id = uuidv4;
    const {
      owner,
      name,
      pullOnly,
      sectionType,
      setPublishErrorState,
      toggleSyncModal,
    } = this.props;

    if (sectionType === 'labbook') {
      const footerMessageData = {
        id,
        message: 'Syncing Project with Gigantum cloud ...',
        isLast: false,
        error: false,
      };
      setMultiInfoMessage(owner, name, footerMessageData);

      SyncLabbookMutation(
        owner,
        name,
        method,
        pullOnly,
        () => {},
        () => {},
        (error) => {
          if (error) {
            const messageData = {
              id,
              message: `Could not 'force' sync ${name}`,
              isLast: true,
              error: true,
              messageBody: error,
            };
            setMultiInfoMessage(owner, name, messageData);

            setPublishErrorState(
              `Could not 'force' sync ${name}`,
              {
                feedback: error[0].message,
              },
            );
          }
        },
      );
    } else {
      const footerMessageData = {
        id,
        message: 'Syncing Dataset with Gigantum cloud ...',
        isLast: false,
        error: false,
      };
      setMultiInfoMessage(owner, name, footerMessageData);

      SyncDatasetMutation(
        owner,
        name,
        method,
        pullOnly,
        () => {},
        () => {},
        (error) => {
          if (error) {
            const messageData = {
              id,
              message: `Could not 'force' sync ${name}`,
              isLast: true,
              error: true,
              messageBody: error,
            };
            setMultiInfoMessage(owner, name, messageData);

            setPublishErrorState(
              `Could not 'force' sync ${name}`,
              {
                feedback: error[0].message,
              },
            );
          }
        },
      );
    }

    toggleSyncModal();
  }

  render() {
    const {
      isVisible,
      toggleSyncModal,
    } = this.props;

    if (!isVisible) {
      return null;
    }

    return (
      <Modal
        header="Sync Conflict"
        handleClose={() => toggleSyncModal()}
        size="medium"
        icon="sync"
      >
        <>
          <div>
            <p>Your Project conflicts with changes already synced to the server. You can choose which changes to use</p>
            <p><b>**Note: This will overwrite the unselected conflicting files.</b></p>
            <p>Which changes would you like to use?</p>
          </div>
          <div className="ForceSync__buttonContainer">
            <button
              onClick={() => { this._forceSync('ours'); }}
              type="button"
            >
              Use Mine
            </button>
            <button
              onClick={() => { this._forceSync('theirs'); }}
              type="button"
            >
              Use Theirs
            </button>
            <button
              onClick={() => { toggleSyncModal(); }}
              type="button"
            >
              Abort
            </button>
          </div>
        </>
      </Modal>
    );
  }
}
