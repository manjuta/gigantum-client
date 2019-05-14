import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import uuidv4 from 'uuid/v4';
import FooterUtils from 'Components/common/footer/FooterUtils';
import { setMultiInfoMessage } from 'JS/redux/actions/footer';

const mutation = graphql`
  mutation PublishLabbookMutation($input: PublishLabbookInput!){
    publishLabbook(input: $input){
      jobKey
      clientMutationId
    }
  }
`;

let tempID = 0;

const footerCallback = {
  finished: (callbackData) => {
    const { response, successCall, mutations } = callbackData;
    const metaDataArr = JSON.parse(response.data.jobStatus.jobMetadata).labbook.split('|');
    const owner = metaDataArr[1];
    const labbookName = metaDataArr[2];
    successCall(owner, labbookName);
    mutations.FetchLabbookEdgeMutation(
      owner,
      labbookName,
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

export default function PublishLabbookMutation(
  owner,
  labbookName,
  labbookId,
  setPublic,
  successCall,
  failureCall,
  callback,
) {
  const variables = {
    input: {
      setPublic,
      owner,
      labbookName,
      clientMutationId: tempID++,
    },
  };
  const id = uuidv4();
  const startMessage = 'Preparing to publish Project...';
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
            type: 'publishLabbook',
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
