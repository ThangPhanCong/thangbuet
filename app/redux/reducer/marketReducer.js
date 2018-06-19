import ActionType from "../ActionType";

export default function reduce (state = {}, action) {
  switch (action.type) {
    case ActionType.GET_COIN_LIST:
      return {
        ...state,
        isLoading: true
      }
    case ActionType.GET_COIN_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        list: action.data
      }
    case ActionType.GET_LIST_FAILURE:
      return {
        ...state,
        isLoading: true,
        error: action.error
      }
    default:
      return {}
  }
}