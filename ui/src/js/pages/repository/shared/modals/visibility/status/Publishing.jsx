// @flow
// vendor
import React, { Component } from 'react';
// job status
import JobStatus from 'JS/utils/JobStatus';
// State Machine
import { ERROR, COMPLETE } from '../machine/MachineConstants';
// css
import './PublishModalStatus.scss';

type Props = {
  jobKey: string,
  header: string,
  name: string,
  owner: string,
  resetPublishState: Function,
  setPublishingState: Function,
  toggleModal: Function,
  transition: Function,
}

class Publishing extends Component<Props> {
  state = {
    message: '',
  }

  componentDidUpdate(prevProps) {
    if ((this.props.jobKey !== prevProps.jobKey) && this.props.jobKey !== null) {
      this._fetchData(this.props.jobKey);
    }
  }

  /**
  * Method sets message state for publishing data.
  * @param {Object} jobMetaDataParsed
  *
  */
  _setMessage = (jobMetaDataParsed) => {
    if (jobMetaDataParsed.feedback !== undefined) {
      const { message } = this.state;
      if ((jobMetaDataParsed.feedback !== null) && (message.indexOf(jobMetaDataParsed.feedback) === -1)) {
        const newMessage = `${message} ${jobMetaDataParsed.feedback} <br />`;
        this.setState({ message: newMessage });
      }
    }
  }

  /**
  * Method fetches job status and updates modal messaging
  * @param {string} jobKey
  */
  _fetchData = (jobKey) => {
    const {
      name,
      owner,
      resetPublishState,
      setPublishingState,
      setSyncingState,
      toggleModal,
      transition,
    } = this.props;

    JobStatus.updateFooterStatus(jobKey).then((response) => {
      const { status } = response.data.jobStatus;

      if ((status === 'started') || (status === 'queued')) {
        const { jobMetadata } = response.data.jobStatus;
        const jobMetaDataParsed = JSON.parse(jobMetadata);
        this._setMessage(jobMetaDataParsed);
        setTimeout(() => {
          this._fetchData(jobKey);
        }, 1000);
      }

      if (status === 'finished') {
        transition(
          COMPLETE,
          {},
        );

        setTimeout(() => {
          toggleModal();
          if (setPublishingState) {
            setPublishingState(owner, name, false);
          }
          setSyncingState(false);
          resetPublishState(false);
        }, 1000);
      }

      if (status === 'failed') {
        const { failureMessage } = response.data.jobStatus;
        transition(
          ERROR,
          {
            failureMessage,
          },
        );

        if (setPublishingState) {
          setPublishingState(owner, name, false);
        }

        setSyncingState(false);

        resetPublishState(false);
      }
    });
  }

  render() {
    const { header, name, owner } = this.props;
    const { message } = this.state;

    const text = (header === 'Publish')
      ? `Publishing ${owner}/${name}`
      : `Changing ${owner}/${name} visibility`;
    const tempMessage = (header === 'Publish')
      ? 'Publish task in queue'
      : 'Visibility change task in queue';

    return (
      <div className="PublishModalStatus">

        <h4 className="PublishModalStatus__h4">{text}</h4>

        <div className="PublishModalStatus__main PublishModalStatus__main--publishing flex flex--column justify--center">
          { !message && (
              <h6>{tempMessage}</h6>
            )
          }

          { message && (
              <h6>
                <div dangerouslySetInnerHTML={{ __html: message }} />
              </h6>
            )
          }
        </div>
      </div>
    );
  }
}

export default Publishing;
