import ActionType from "./ActionType";

export function getFailure(error) {
  return {
    type: ActionType.GET_LIST_FAILURE,
    error
  }
}

export function updateSocketData(socketData) {
  return {
    type: ActionType.UPDATE_SOCKET_DATA_SUCCESS,
    ...socketData
  }
}