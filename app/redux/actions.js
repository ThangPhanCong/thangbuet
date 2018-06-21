import ActionType from "./ActionType";

export function getFailure(error) {
  return {
    type: ActionType.GET_LIST_FAILURE,
    error
  }
}

export function updateSocketData(namespace, event, data) {
  return {
    type: ActionType.UPDATE_SOCKET_DATA_SUCCESS,
    namespace,
    event,
    data
  }
}