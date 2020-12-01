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
import FooterUtils from 'Components/footer/FooterUtils';
import footerCallback from 'Components/footer/utils/PublishDataset';

const mutation = graphql`
  mutation PublishDatasetMutation($input: PublishDatasetInput!){
    publishDataset(input: $input){
      jobKey
      clientMutationId
    }
  }
`;

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
      clientMutationId: uuidv4(),
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
  setMultiInfoMessage(owner, datasetName, messageData);
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {
        if (error) {
          setErrorMessage(owner, datasetName, 'An error occurred while publishing this Dataset', error);
          console.log(error);
        }

        callback(response, error);
      },
      onError: (err) => { console.error(err); },
      updater: (store, response) => {
        if (failureCall && response) {
          const footerData = {
            owner,
            name: datasetName,
            sectionType: 'dataset',
            result: response,
            type: 'publishDataset',
            key: 'jobKey',
            footerCallback,
            successCall,
            failureCall,
            id,
          };
          FooterUtils.getJobStatus(owner, datasetName, footerData);
        }
      },
    },
  );
}
