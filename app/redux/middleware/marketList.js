import { getMarketSuccess, getFailure, sortSymbolSuccess } from '../actions'
import RequestFactory from '../../libs/RequestFactory';
import _ from 'lodash';

import ActionType from '../ActionType';
import { Observable } from 'rxjs';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/filter';

import Consts from '../../utils/Consts';

const getMarketList = action$ =>
  action$
    .ofType(ActionType.GET_MARKET_LIST)
    .mergeMap(action => {
      let coinSettingObservable = 
        Observable
          .fromPromise(RequestFactory.getRequest('MasterdataRequest').getAll())
          .map(data => data.coin_settings)
          .map(symbols => _.filter(symbols, symbol => symbol.currency === action.currency))
          .map(symbols => _.map(symbols, symbol => {
            symbol.key = symbol.currency + '_' + symbol.coin;
            return symbol;
          }));
      
      let pricesObservable =
        Observable
          .fromPromise(RequestFactory.getRequest('PriceRequest').getPrices())
          .map(response => response.data);

      let favouriteObservable =
        Observable
          .fromPromise(RequestFactory.getRequest('FavoriteRequest').getList())
          .map(response => response.data)
          .map(data => _getFavorites(data));

      return Observable
        .zip(coinSettingObservable, pricesObservable, favouriteObservable, _mergeData)
        .map(data => getMarketSuccess(action.currency, data.symbols, data.prices, data.favorites, action.sortField, action.sortDirection))
        .catch(error => Observable.of(getFailure(error)));
    })

const sortSymbolList = action$ =>
  action$
    .ofType(ActionType.SORT_SYMBOL_LIST)
    .map(action => _sortSymbols(action.currency, action.symbols, action.sortField, action.sortDirection))
    .map(res => sortSymbolSuccess(res.currency, res.symbols, res.sortField, res.sortDirection))

function _mergeData(symbols, prices, favorites) {
  return {
    symbols,
    prices,
    favorites
  }
}

function _sortSymbols(currency, symbols, sortField, sortDirection) {
  if (sortField != Consts.SORT_MARKET_FIELDS.SYMBOL) {
    symbols = _.orderBy(symbols, (item) => parseFloat(item[sortField]), sortDirection);
  } else {
    symbols = _.orderBy(symbols, ['coin', 'currency'], [sortField, sortDirection]);
  }

  return {
    currency,
    symbols,
    sortField,
    sortDirection
  }
}

function _getFavorites(data) {
  let favorites = {};
  for (item of data) {
    favorites[item.coin_pair] = true;
  }
  return favorites;
}

export default { getMarketList, sortSymbolList };