import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import uuidv4 from 'uuid/v4';
import { setMultiInfoMessage } from 'JS/redux/actions/footer';
import FooterUtils from 'Components/common/footer/FooterUtils';

const mutation = graphql`
  mutation SyncLabbookMutation($input: SyncLabbookInput!){
    syncLabbook(input: $input){
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

export default function SyncLabbookMutation(
  owner,
  labbookName,
  overrideMethod,
  pullOnly,
  successCall,
  failureCall,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      pullOnly,
      clientMutationId: tempID++,
    },
    first: 10,
    cursor: null,
    hasNext: false,
  };
  if (overrideMethod) {
    variables.input.overrideMethod = overrideMethod;
  }
  const id = uuidv4();
  const startMessage = `Preparing to ${pullOnly ? 'pull' : 'sync'} Project...`;
  const messageData = {
    id,
    message: startMessage,
    isLast: false,
    error: false,
    messageBody: [{ message: startMessage }],
    messageListOpen: false,
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

        callback(error);
      },
      onError: (err) => { console.error(err); },
      updater: (store, response) => {
        if (response) {
          const footerData = {
            result: response,
            type: 'syncLabbook',
            key: 'jobKey',
            footerCallback,
            successCall,
            failureCall,
            id,
            hideFooter: true,
          };

          FooterUtils.getJobStatus(footerData);
        }
      },
    },
  );
}
