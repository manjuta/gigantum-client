import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import uuidv4 from 'uuid/v4';
import { setMultiInfoMessage } from 'JS/redux/actions/footer';
import FooterUtils from 'Components/common/footer/FooterUtils';

const mutation = graphql`
  mutation PublishDatasetMutation($input: PublishDatasetInput!){
    publishDataset(input: $input){
      jobKey
      clientMutationId
    }
  }
`;

let tempID = 0;

const footerCallback = {
  finished: (callbackData) => {
    const { response, successCall, mutations } = callbackData;
    const metaDataArr = JSON.parse(response.data.jobStatus.jobMetadata).dataset.split('|');
    const owner = metaDataArr[1];
    const datasetName = metaDataArr[2];
    successCall(owner, datasetName);
    mutations.FetchDatasetEdgeMutation(
      owner,
      datasetName,
      (error) => {
        if (error) {
          console.error(error);
        }
      },
    );
  },
  failed: (callbackData) => {
    const { response, failureCall } = callbackData;
    const reportedFailureMessage = response.data.jobStatus.failureMessage;
    const errorMessage = response.data.jobStatus.failureMessage;
    failureCall(response.data.jobStatus.failureMessage);
    return {
      errorMessage,
      reportedFailureMessage,
    };
  },
};

export default function PublishDatasetMutation(
  owner,
  datasetName,
  setPublic,
  successCall,
  failureCall,
  callback,
) {
  const variables = {
    input: {
      setPublic,
      owner,
      datasetName,
      clientMutationId: tempID++,
    },
  };
  const id = uuidv4();
  const startMessage = 'Preparing to publish Dataset...';
  const messageData = {
    id,
    message: startMessage,
    isLast: false,
    error: false,
    messageBody: [{ message: startMessage }],
  };
  setMultiInfoMessage(messageData);
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
        }

        callback(response, error);
      },
      onError: (err) => { console.error(err); },
      updater: (store, response) => {
        if (response) {
          const footerData = {
            result: response,
            type: 'publishDataset',
            key: 'jobKey',
            footerCallback,
            successCall,
            failureCall,
            id,
          };
          FooterUtils.getJobStatus(footerData);
        }
      },
    },
  );
}
