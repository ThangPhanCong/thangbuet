import ActionType from "./ActionType";

export function getCoinSuccess(data) {
  return {
    type: ActionType.GET_COIN_LIST_SUCCESS,
    data
  }
}

export function getFailure(error) {
  return {
    type: ActionType.GET_LIST_FAILURE,
    error
  }
}