import ActionType from "../ActionType";
import _ from 'lodash';

function _updateSymbolsData(oldSymbols, newPrices, newFavorites) {
  if (!oldSymbols) { return oldSymbols };
  let symbols = oldSymbols;
  let prices = newPrices;

  return _.map(symbols, s => {
    let symbol;
    if (newPrices) {
      symbol = Object.assign(s, prices[s.key]);
    }
    else {
      symbol = s;
    }
    
    if (newFavorites) {
      symbol.isFavorite = newFavorites[s.key];
    }
    
    return symbol;
  })
}

export default function reduce (state = {}, action) {
  switch (action.type) {
    case ActionType.SORT_SYMBOL_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        symbols: action.symbols,
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
        symbols: _updateSymbolsData(action.symbols, action.prices, action.favorites),
        sortField: action.sortField,
        sortDirection: action.sortDirection
      }
    case ActionType.UPDATE_MARKET_LIST_SOCKET_SUCCESS:
      return {
        ...state,
        symbols: _updateSymbolsData(action.symbols, action.prices || state.prices, action.favorites || state.favorites)
      }
    case ActionType.GET_LIST_FAILURE:
      return {
        ...state,
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