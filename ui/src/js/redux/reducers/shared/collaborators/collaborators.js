import * as types from 'JS/redux/constants/constants';

export default (
  state = {
    collaborators: null,
    canManageCollaborators: null,
    publishFromCollaborators: false,
  },
  action,
) => {
  if (action.type === types.SET_COLLABORATORS) {
    return {
      ...state,
      collaborators: action.payload.collaborators,
    };
  }
  if (action.type === types.SET_CANMANAGECOLLABORATORS) {
    return {
      ...state,
      canManageCollaborators: action.payload.canManageCollaborators,
    };
  }
  if (action.type === types.SET_PUBLISH_FROM_COLLABORATORS) {
    return {
      ...state,
      publishFromCollaborators: action.payload.publishFromCollaborators,
    };
  }
  return state;
};
