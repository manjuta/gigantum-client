// vendor
import uuidv4 from 'uuid/v4';
// constants
import * as types from 'JS/redux/constants/constants';

export default (
  state = {
    selectedComponent: '',
    containerState: '',
    transitionState: '',
    transitioningLabbook: '',
    imageStatus: '',
    isBuilding: false,
    isSyncing: false,
    isExporting: false,
    isPublishing: false,
    isUploading: false,
    containerStatus: '',
    modalVisible: '',
    detailMode: false,
    previousDetailMode: false,
    branchesOpen: false,
    isSticky: false,
    mergeFilter: false,
    sidePanelVisible: false,
  },
  action,
) => {
  if (action.payload && action.payload.labbookName) {
    const { owner, labbookName } = action.payload;
    const namespace = `${owner}_${labbookName}`;
    const namespaceExist = state[namespace];

    if (namespaceExist === undefined) {
      // preventing detail mode from opening until feature has been fully implemented
      return {
        [namespace]: {
          ...state,
        },
        ...state,
        labbookName,
        owner,
        forceUpdate: uuidv4(),
      };
    }
  }

  if (action.type === types.UPDATE_STICKY_STATE) {
    // preventing detail mode from opening until feature has been fully implemented
    const { namespace, isSticky } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        isSticky,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.MERGE_MODE) {
    const {
      namespace,
      mergeFilter,
      branchesOpen,
    } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        mergeFilter,
        branchesOpen,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.INITIALIZE) {
    const {
      namespace,
      selectedComponent,
      containerState,
      imageStatus,
    } = action.payload;

    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        namespace,
        selectedComponent,
        containerState,
        imageStatus,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.IS_BUILDING) {
    const { namespace, isBuilding } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        isBuilding,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.IS_SYNCING) {
    const { namespace, isSyncing } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        isSyncing,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.IS_EXPORTING) {
    const { namespace, isExporting } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        isExporting,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.IS_PUBLISHING) {
    const { namespace, isPublishing } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        isPublishing,
        forceUpdate: uuidv4(),
      },

    };
  } if (action.type === types.IS_UPLOADING) {
    const { namespace, isUploading } = action.payload;
    return {
      ...state,
      isUploading,
      [namespace]: {
        ...state[namespace],
        isUploading,
        forceUpdate: uuidv4(),
      },
    };
  } if (action.type === types.SELECTED_COMPONENT) {
    const { namespace, selectedComponent } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        selectedComponent,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.MODAL_VISIBLE) {
    const { namespace, modalVisible } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        modalVisible,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.UPDATE_BRANCHES_VIEW) {
    const { namespace, branchesOpen } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        branchesOpen,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.UPDATE_ALL) {
    return {
      ...state,
      labbookName: action.payload.labbookName,
      owner: action.payload.owner,
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.UPDATE_SIDEPANEL_VISIBLE) {
    const { namespace, sidePanelVisible } = action.payload;
    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        sidePanelVisible,
      },
      forceUpdate: uuidv4(),
    };
  } if (action.type === types.UPDATE_TRANSITION_STATE) {
    const { namespace } = action.payload;
    const { transitionState } = action.payload;

    return {
      ...state,
      [namespace]: {
        ...state[namespace],
        transitionState,
      },
      forceUpdate: uuidv4(),
    };
  }

  return state;
};
