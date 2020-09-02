// vendor
import React, { Component, Fragment } from 'react';
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
  owner: string,
  name: string,
  pullOnly: bool,
  toggleSyncModal: Function,
}

export default class ForceSync extends Component<Props> {
  /**
  *  @param {}
  *  Triggers sync with the correct override method
  *  @return {}
  */
  _forceSync(method) {
    const { props } = this;
    const id = uuidv4;
    const {
      owner,
      name,
      pullOnly,
      toggleSyncModal,
    } = this.props;

    if (props.sectionType === 'labbook') {
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
          }
        },
      );
    }

    toggleSyncModal();
  }

  render() {
    const {
      toggleSyncModal,
    } = this.props;
    return (
      <Modal
        header="Sync Conflict"
        handleClose={() => toggleSyncModal()}
        size="medium"
        icon="sync"
        renderContent={() => (
          <Fragment>
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
          </Fragment>
        )
        }
      />
    );
  }
}
