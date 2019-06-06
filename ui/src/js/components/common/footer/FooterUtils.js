// vendor
import JobStatus from 'JS/utils/JobStatus';
import AnsiUp from 'ansi_up';
// store
import { setMultiInfoMessage, setErrorMessage } from 'JS/redux/actions/footer';
// mutations
import FetchLabbookEdgeMutation from 'Mutations/FetchLabbookEdgeMutation';
import FetchDatasetEdgeMutation from 'Mutations/FetchDatasetEdgeMutation';
import FetchDatasetFilesMutation from 'Mutations/FetchDatasetFilesMutation';
import FetchLabbookDatasetFilesMutation from 'Mutations/FetchLabbookDatasetFilesMutation';

const ansiUp = new AnsiUp();

const hideModal = () => {
  document.getElementById('modal__cover').classList.add('hidden');
  document.getElementById('loader').classList.add('hidden');
}

const messageParser = (response) => {
  let fullMessage = (response.data.jobStatus.jobMetadata.indexOf('feedback') > -1) ? JSON.parse(response.data.jobStatus.jobMetadata).feedback : '';
  fullMessage = fullMessage.lastIndexOf('\n') === (fullMessage.length - 1)
    ? fullMessage.slice(0, fullMessage.length - 1)
    : fullMessage;

  const html = ansiUp.ansi_to_html(fullMessage);

  const lastIndex = (fullMessage.lastIndexOf('\n') > -1)
    ? fullMessage.lastIndexOf('\n')
    : 0;

  let message = fullMessage.slice(lastIndex, fullMessage.length);

  if (message.indexOf('[0m') > 0) {
    const res = [];
    let index = 0;

    while (fullMessage.indexOf('\n', index + 1) > 0) {
      index = fullMessage.indexOf('\n', index + 1);
      res.push(index);
    }

    message = fullMessage.slice(res[res.length - 2], res[res.length - 1]);
  }
  return {
    html,
    message,
  };
};

const FooterUtils = {
  /**
   *  @param {number}
   *  iterate value of index within the bounds of the array size
   *  @return {}
   */
  getJobStatus: (footerData) => {
    /**
      *  @param {}
      *  refetches job status
      *  @return {}
      */
    const refetch = () => {
      setTimeout(() => {
        fetchStatus();
      }, 1000);
    };
    /**
      *  @param {}
      *  fetches job status for background message
      *  updates footer with a message
      *  @return {}
      */
    const fetchStatus = () => {
      const {
        result,
        type,
        key,
        FooterCallback,
        successCall,
        failureCall,
        id,
        hideFooter,
      } = footerData;


      const resultType = result[type];
      const resultKey = resultType ? resultType[key] : false;
      const mutations = {
        FetchLabbookEdgeMutation,
        FetchDatasetEdgeMutation,
        FetchDatasetFilesMutation,
        FetchLabbookDatasetFilesMutation,
      };

      if (resultKey) {
        JobStatus.updateFooterStatus(result[type][key]).then((response) => {
          if (response.data
              && response.data.jobStatus
              && response.data.jobStatus.jobMetadata) {

            const responseId = id || response.data.jobStatus.id;
            const { html, message } = messageParser(response);
            // executes while job status is still running, refetches until status is finished or failed
            if (response.data.jobStatus.status === 'started') {
              if (html.length) {
                const messageData = {
                  id: responseId,
                  message,
                  isLast: false,
                  error: false,
                  messageBody: [{ message: html }],
                  messageListOpen: !hideFooter,
                };
                setMultiInfoMessage(messageData);
              }
              refetch();
            // executes when job status has completed
            } else if (response.data.jobStatus.status === 'finished') {
              const messageData = {
                id: responseId,
                message,
                isLast: true,
                error: null,
                messageBody: [{ message: html }],
              };

              setMultiInfoMessage(messageData);
              hideModal();

              if (FooterCallback.finished) {
                const callbackData = {
                  response,
                  successCall,
                  mutations,
                };
                FooterCallback.finished(callbackData);
              }
            // executes when job status has failed
            } else if (response.data.jobStatus.status === 'failed') {
              let reportedFailureMessage = response.data.jobStatus.failureMessage;
              let errorMessage = response.data.jobStatus.failureMessage;
              hideModal();

              if (FooterCallback.failed) {
                const callbackData = {
                  response,
                  failureCall,
                  mutations,
                };
                ({ errorMessage, reportedFailureMessage } = FooterCallback.failed(callbackData));
              }

              const errorHTML = `${html}\n<span style="color:rgb(255,85,85)">${reportedFailureMessage}</span>`;
              const messageData = {
                id: responseId,
                message: errorMessage,
                isLast: true,
                error: true,
                messageBody: [{ message: errorHTML }],
              };
              setMultiInfoMessage(messageData);
            } else {
              // refetch status data not ready
              refetch();
            }
          } else {
            // refetch status data not ready
            refetch();
          }
        });
      } else {
        setErrorMessage('There was an error fetching job status.', [{ message: 'Callback error from the API' }]);
      }
    };

    // trigger fetch
    fetchStatus();
  },
};

export default FooterUtils;
