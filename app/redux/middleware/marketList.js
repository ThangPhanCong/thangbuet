import { getCoinSuccess, getFailure } from '../actions'
import RequestFactory from '../../libs/RequestFactory';
import _ from 'lodash';

import { Observable } from 'rxjs';
import ActionType from '../ActionType';

const getCoinList = action$ => 
  action$
    .ofType(ActionType.GET_COIN_LIST)
    .mergeMap(action => {
      let coinSettingObservable = 
        Observable
          .fromPromise(RequestFactory.getRequest('MasterdataRequest').getAll())
          .map(data => data.coin_settings)
          .map(symbols => {
            return _.map(symbols, symbol => {
              symbol.key = symbol.currency + '_' + symbol.coin;
              return symbol;
            })
          });
      
      let pricesObservable =
        Observable
          .fromPromise(RequestFactory.getRequest('PriceRequest').getPrices())
          .map(response => response.data);

      let favouriteObservable =
        Observable
          .fromPromise(RequestFactory.getRequest('FavoriteRequest').getList())
          .map(response => response.data)
          .map(data => {
            let favorites = {};
            for (item of data) {
              favorites[item.coin_pair] = true;
            }
            return favorites;
          });
          
      return Observable
        .zip(coinSettingObservable, pricesObservable, favouriteObservable, _mergeData)
        .map(data => getCoinSuccess(data.symbols, data.prices, data.favorites, action.sortField, action.sortDirection))
        .catch(error => Observable.of(getFailure(error)));
    })

const sortCoinList = action$ =>
  action$
    .ofType(ActionType.SORT_COIN_LIST)
    .map(action => {
      let symbols = action.symbols;
      return _sortSymbols(symbols, action.sortField, action.sortDirection);
    })
    .map(symbols => sortCoinList(symbols, action.sortField, action.sortDirection));

function _mergeData(symbols, prices, favorites) {
  return {
    symbols,
    prices,
    favorites
  }
}

function _sortSymbols(symbols, sortField, sortDirection) {
  return orderBy(symbols, (symbol) => parseFloat(symbol[sortField]), sortDirection);
}

export default { getCoinList, sortCoinList };