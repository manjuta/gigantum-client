export default {
  finished: (callbackData) => {
    const { response, successCall, mutations } = callbackData;
    const metaDataArr = JSON.parse(response.data.jobStatus.jobMetadata).labbook.split('|');
    const owner = metaDataArr[1];
    const name = metaDataArr[2];
    successCall(owner, name);
    mutations.FetchLabbookEdgeMutation(
      owner,
      name,
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
