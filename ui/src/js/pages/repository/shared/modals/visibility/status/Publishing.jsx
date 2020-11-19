// @flow
// vendor
import React, { Component } from 'react';
import Loader from 'Components/loader/Loader';
// job status
import JobStatus from 'JS/utils/jobStatus';
// css
import './PublishModalStatus.scss';

type Props = {
  jobKey: string,
  name: string,
  owner: string,
  transition: Function,
}

class Publishing extends Component<Props> {
  state = {
    message: null,
  }

  componentDidUpdate(prevProps) {
    if (this.props.jobKey !== prevProps.jobKey) {
      this._fetchData(this.props.jobKey);
    }
  }

  /**
  * Method sets message state for publishing data.
  * @param {Object} jobMetaDataParsed
  *
  */
  _setMessage = (jobMetaDataParsed) => {
    if (jobMetaDataParsed.feedback) {
      const { message } = this.state;
      if ((jobMetaDataParsed.feedback !== null) && (message.indexOf(jobMetaDataParsed.feedback) !== -1)) {
        const newMessage = `${message} \n ${jobMetaDataParsed.feedback}`;
        this.setState({ message: newMessage });
      }
    }
  }

  /**
  * Method fetches job status and updates modal messaging
  * @param {string} jobKey
  */
  _fetchData = (jobKey) => {
    console.log(jobKey);
    const { transition } = this.props;

    JobStatus.updateFooterStatus(jobKey).then((response) => {
      console.log(response);
      const { status } = response.data.jobStatus;

      if ((status === 'started') || (status === 'queued')) {
        const { jobMetadata } = response.data.jobStatus;
        const jobMetaDataParsed = JSON.parse(jobMetadata);
        this._setMessage({ jobMetaDataParsed });
        setTimeout(() => {
          this._fetchData(jobKey);
        }, 1000);
      }

      if (status === 'finished') {
        transition(
          "COMPLETE",
          {},
        );
      }

      if (status === 'failed') {
        const { failureMessage } = response.data.jobStatus;
        transition(
          "ERROR",
          {
            failureMessage,
          },
        );
      }
    });
  }

  render() {
    const { jobKey, name, owner } = this.props;
    const { message } = this.state;

    console.log(this.props, jobKey);
    const text = `Publishing ${owner}/${name}`;
    return (
      <div className="PublishModalStatus">
        <h4 className="PublishModalStatus__h4">{text}</h4>

        { !message && (
            <Loader nested={true}/>
          )
        }

        { message && (
            <h6>{message}</h6>
          )
        }

      </div>
    );
  }
}

export default Publishing;
