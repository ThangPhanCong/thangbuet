import ActionType from "../ActionType";

export default function reduce (state = {}, action) {
  switch (action.type) {
    case ActionType.SORT_SYMBOL_LIST_SUCCESS:
      return {
        isLoading: false,
        currency: action.currency,
        symbols: action.symbols,
        prices: action.prices || state.prices,
        favorites: action.favorites || state.favorites,
        sortField: action.sortField,
        sortDirection: action.sortDirection
      }
    case ActionType.GET_MARKET_LIST:
      return {
        ...state,
        currency: action.currency,
        isLoading: true
      }
    case ActionType.GET_MARKET_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        currency: action.currency,
        symbols: action.symbols,
        prices: action.prices,
        favorites: action.favorites,
        sortField: action.sortField,
        sortDirection: action.sortDirection
      }
    case ActionType.GET_LIST_FAILURE:
      return {
        ...state,
        currency: action.currency,
        isLoading: true,
        error: action.error
      }
    default:
      return {
        ...state,
        isLoading: false
      }
  }
}