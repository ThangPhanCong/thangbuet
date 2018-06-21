import ActionType from "./ActionType";

export function getFailure(error) {
  return {
    type: ActionType.GET_LIST_FAILURE,
    error
  }
}

export function updateSocketData(event, channel, isPrivate, data) {
  return {
    type: ActionType.UPDATE_SOCKET_DATA_SUCCESS,
    isPrivate,
    channel,
    event,
    data
  }
}