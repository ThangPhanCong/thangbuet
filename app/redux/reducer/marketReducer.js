import ActionType from "../ActionType";

export default function reduce (state = {}, action) {
  switch (action.type) {
    case ActionType.SORT_COIN_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        symbols: action.symbols,
        sortField: action.sortField,
        sortDirection: action.sortDirection
      }
    case ActionType.GET_COIN_LIST:
      return {
        ...state,
        isLoading: true
      }
    case ActionType.GET_COIN_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        symbols: action.symbols,
        prices: action.prices,
        favorites: action.favorites,
        sortField: action.sortField,
        sortDirection: action.sortDirection
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