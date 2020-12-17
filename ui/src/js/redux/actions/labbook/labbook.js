import dispatcher from 'JS/redux/dispatcher';
import * as types from 'JS/redux/constants/constants';

/**
 * actions
 */
export const setBuildingState = (owner, name, isBuilding) => dispatcher(
  types.IS_BUILDING,
  {
    namespace: `${owner}_${name}`,
    isBuilding,
  },
);

export const setMergeMode = (owner, name, branchesOpen, mergeFilter) => dispatcher(
  types.MERGE_MODE,
  {
    namespace: `${owner}_${name}`,
    branchesOpen,
    mergeFilter,
  },
);

export const setSyncingState = (owner, name, isSyncing) => dispatcher(
  types.IS_SYNCING,
  {
    namespace: `${owner}_${name}`,
    isSyncing,
  },
);

export const setPublishingState = (owner, name, isPublishing) => dispatcher(
  types.IS_PUBLISHING,
  {
    namespace: `${owner}_${name}`,
    isPublishing,
  },
);

export const setExportingState = (owner, name, isExporting) => dispatcher(
  types.IS_EXPORTING,
  {
    namespace: `${owner}_${name}`,
    isExporting,
  },
);

export const setModalVisible = (owner, name, modalVisible) => dispatcher(
  types.MODAL_VISIBLE,
  {
    namespace: `${owner}_${name}`,
    modalVisible,
  },
);

export const setStickyState = (owner, name, isSticky) => dispatcher(
  types.UPDATE_STICKY_STATE,
  {
    namespace: `${owner}_${name}`,
    isSticky,
  },
);

export const setSidepanelVisible = (owner, name, sidePanelVisible) => dispatcher(
  types.UPDATE_SIDEPANEL_VISIBLE,
  {
    namespace: `${owner}_${name}`,
    sidePanelVisible,
  },
);

export const updateTransitionState = (owner, name, transitionState) => dispatcher(
  types.UPDATE_TRANSITION_STATE,
  {
    namespace: `${owner}_${name}`,
    transitionState,
  },
);

export const setFileBrowserLock = (owner, name, isUploading) => dispatcher(
  types.IS_UPLOADING,
  {
    namespace: `${owner}_${name}`,
    isUploading,
  },
);
