// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidv4 from 'uuid/v4';
// environment
import environment from 'JS/createRelayEnvironment';
// redux
import { setMultiInfoMessage, setErrorMessage } from 'JS/redux/actions/footer';
// utils
import FooterUtils from 'Components/common/footer/FooterUtils';
import footerCallback from 'Components/common/footer/utils/PublishLabbook';

const mutation = graphql`
  mutation PublishLabbookMutation($input: PublishLabbookInput!){
    publishLabbook(input: $input){
      jobKey
      clientMutationId
    }
  }
`;

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
      clientMutationId: uuidv4(),
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
          setErrorMessage('An error occurred while publishing this Project', error);
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
