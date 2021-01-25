// vendor
import uuidv4 from 'uuid/v4';
// mutations
import SetVisibilityMutation from 'Mutations/repository/visibility/SetVisibilityMutation';
import SetDatasetVisibilityMutation from 'Mutations/repository/visibility/SetDatasetVisibilityMutation';
import PublishLabbookMutation from 'Mutations/branches/PublishLabbookMutation';
import PublishDatasetMutation from 'Mutations/branches/PublishDatasetMutation';
// store
import {
  setErrorMessage,
  setInfoMessage,
  setMultiInfoMessage,
} from 'JS/redux/actions/footer';
import store from 'JS/redux/store';

/**
*  @param {}
*  adds remote url to labbook
*  @return {string}
*/
const publish = (baseUrl, props, isPublic, callback) => {
  const id = uuidv4();
  const {
    checkSessionIsValid,
    owner,
    name,
    labbookId,
    remoteUrl,
    resetState,
    resetPublishState,
    sectionType,
    setPublishingState,
    setRemoteSession,
    setSyncingState,
  } = props;

  checkSessionIsValid().then((response) => {
    if (navigator.onLine) {
      if (response.data) {
        if (response.data.userIdentity.isSessionValid) {
          if (store.getState().containerStatus.status !== 'Running') {
            resetPublishState(true);

            if (!remoteUrl) {
              setPublishingState(owner, name, true);

              const failureCall = (error) => {
                setPublishingState(owner, name, false);
                resetPublishState(false);
                if (setSyncingState) {
                  setSyncingState(false);
                }
                callback(false, [{ message: 'Error Publishing' }]);
              };

              const successCall = () => {
                setPublishingState(owner, name, false);
                resetPublishState(false);
                const messageData = {
                  id,
                  message: `Added remote ${baseUrl}${owner}/${name}`,
                  isLast: true,
                  error: false,
                };
                setMultiInfoMessage(owner, name, messageData);
                setRemoteSession();
                callback(true, null);
                if (setSyncingState) {
                  setSyncingState(false);
                }
              };

              if (sectionType === 'labbook') {
                PublishLabbookMutation(
                  owner,
                  name,
                  labbookId,
                  isPublic,
                  successCall,
                  failureCall,
                  (publishResponse, error) => {
                    if (publishResponse && publishResponse.publishLabbook) {
                      callback(publishResponse.publishLabbook.jobKey, error);
                    } else if (error) {
                      failureCall(error);
                      callback(null, error);
                    }
                  },
                );
              } else {
                setSyncingState(true);
                PublishDatasetMutation(
                  owner,
                  name,
                  isPublic,
                  successCall,
                  failureCall,
                  (publishResponse, error) => {
                    if (publishResponse && publishResponse.publishDataset) {
                      callback(publishResponse.publishDataset.jobKey, error);
                    } else if (error) {
                      failureCall(error);
                      callback(null, error);
                    }
                  },
                );
              }
            }
          }
        } else {
          resetState();
        }
      }
    } else {
      resetState();
    }
  });
};


/**
*  @param {}
*  adds remote url to labbook
*  @return {string}
*/
const changeVisibility = (props, isPublic, callback) => {
  const visibility = isPublic ? 'public' : 'private';
  const {
    checkSessionIsValid,
    modalStateValue,
    owner,
    name,
    resetState,
    sectionType,
    toggleModal,
  } = props;

  checkSessionIsValid().then((response) => {
    if (navigator.onLine) {
      if (response.data) {
        if (response.data.userIdentity.isSessionValid) {
          if (props.visibility !== visibility) {
            if (sectionType === 'labbook') {
              SetVisibilityMutation(
                owner,
                name,
                visibility,
                (visibilityResponse, error) => {
                  if (error) {
                    setErrorMessage(owner, name, 'Visibility change failed', error);
                    callback(null, error);
                  } else {
                    setInfoMessage(owner, name, `Visibility changed to ${visibility}`);
                    callback(true, null);
                  }
                },
              );
            } else {
              SetDatasetVisibilityMutation(
                owner,
                name,
                visibility,
                (visibilityResponse, error) => {
                  if (error) {
                    setErrorMessage(owner, name, 'Visibility change failed', error);
                    callback(false, error);
                  } else {
                    setInfoMessage(owner, name, `Visibility changed to ${visibility}`);
                    callback(true, null);
                  }
                },
              );
            }
          } else {
            callback(false, [{ message: 'Visibility not set' }]);
          }
        } else {
          resetState();
          callback(false, [{ message: 'Visibility not set' }]);
        }
      }
    } else {
      resetState();
      callback(false, [{ message: 'Visibility not set' }]);
    }
  });
};


export {
  publish,
  changeVisibility,
};

export default publish;
