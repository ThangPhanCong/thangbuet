import BaseModelRequest from '../libs/BaseModelRequest';
import _ from 'lodash';

export default class FavoriteRequest extends BaseModelRequest {

  getModelName() {
    return 'favorites';
  }

  reOrderFavourite(data) {
    let url = '/reorder-favorites';
    return this.post(url, { symbols: data });
  }

  getList() {
    if (window.GlobalSocket) {
      if (window.GlobalSocket.favoriteSymbols) {
        return new Promise((resolve, reject) => {
          resolve(window.GlobalSocket.favoriteSymbols);
        });
      }
    }

    return new Promise((resolve, reject) => {
      let url = '/favorites';
      this.get(url)
        .then(function (res) {
          window.GlobalSocket.favoriteSymbols = res;
          resolve(res);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  createFavoriteCoinPair(coinPair) {
    let url = '/favorites'
    return this.post(url, { coinPair })
      .then(res => {
        let cachedFavoriteSymbols = window.GlobalSocket.favoriteSymbols.data || [];
        if (!_.some(cachedFavoriteSymbols, ['coin_pair', coinPair])) {
          cachedFavoriteSymbols.push(res);
          window.GlobalSocket.favoriteSymbols.data = cachedFavoriteSymbols;
        }

        return res;
      })
  }

  deleteFavoriteCoinPair(coinPair) {
    let cachedFavoriteSymbols = window.GlobalSocket.favoriteSymbols.data;
    let favorite = _.find(cachedFavoriteSymbols, ['coin_pair', coinPair]);

    let url = `/favorites/${favorite.id}`;
    return this.del(url, { coinPair })
      .then(res => {
        _.remove(window.GlobalSocket.favoriteSymbols.data, item => item === favorite);
        return res;
      })
  }
}