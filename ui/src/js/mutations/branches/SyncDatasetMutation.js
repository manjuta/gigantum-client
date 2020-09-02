// vendor
import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidv4 from 'uuid/v4';
// environment
import environment from 'JS/createRelayEnvironment';
// redux
import { setMultiInfoMessage } from 'JS/redux/actions/footer';
// utils
import FooterUtils from 'Components/footer/FooterUtils';
import footerCallback from 'Components/footer/utils/SyncDataset';

const mutation = graphql`
  mutation SyncDatasetMutation($input: SyncDatasetInput!){
    syncDataset(input: $input){
      jobKey
      clientMutationId
    }
  }
`;

export default function SyncDatasetMutation(
  owner,
  datasetName,
  overrideMethod,
  pullOnly,
  successCall,
  failureCall,
  callback,
) {
  const variables = {
    input: {
      owner,
      datasetName,
      pullOnly,
      clientMutationId: uuidv4(),
    },
    first: 10,
    cursor: null,
    hasNext: false,
  };
  const id = uuidv4();
  const startMessage = `Preparing to ${pullOnly ? 'pull' : 'sync'} Dataset...`;
  const messageData = {
    id,
    message: startMessage,
    isLast: false,
    error: false,
    messageBody: [{ message: startMessage }],
  };
  setMultiInfoMessage(owner, datasetName, messageData);
  if (overrideMethod) {
    variables.input.overrideMethod = overrideMethod;
  }
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
            owner,
            name: datasetName,
            sectionType: 'dataset',
            result: response,
            type: 'syncDataset',
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
