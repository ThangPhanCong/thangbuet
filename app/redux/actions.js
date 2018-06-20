import ActionType from "./ActionType";

export function sortSymbolSuccess(symbols, sortField, sortDirection) {
  return {
    type: ActionType.SORT_COIN_LIST_SUCCESS,
    symbols,
    sortField,
    sortDirection
  }
}

export function getCoinSuccess(symbols, prices, favorites, sortField, sortDirection) {
  return {
    type: ActionType.GET_COIN_LIST_SUCCESS,
    symbols,
    prices,
    favorites,
    sortField,
    sortDirection
  }
}

export function getFailure(error) {
  return {
    type: ActionType.GET_LIST_FAILURE,
    error
  }
}