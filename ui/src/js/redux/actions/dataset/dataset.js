import dispatcher from 'JS/redux/dispatcher';
import * as types from 'JS/redux/constants/constants';
/**
 * actions
 */

export const setStickyState = (owner, name, isSticky) => dispatcher(
  types.UPDATE_STICKY_STATE,
  {
    namespace: `${owner}_${name}`,
    isSticky,
  },
);
export const setIsProcessing = (owner, name, isProcessing) => dispatcher(
  types.SET_IS_PROCESSING,
  {
    namespace: `${owner}_${name}`,
    isProcessing,
  },
);

export const setIsSyncing = (owner, name, isSyncing) => dispatcher(
  types.SET_IS_SYNCHING,
  {
    namespace: `${owner}_${name}`,
    isSyncing,
  },
);
