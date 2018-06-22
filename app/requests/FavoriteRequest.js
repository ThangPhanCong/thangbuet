import BaseModelRequest from '../libs/BaseModelRequest';

export default class FavoriteRequest extends BaseModelRequest {

  getModelName() {
    return 'favorites';
  }

  reOrderFavourite(data) {
    let url = '/reorder-favorites';
    return this.post(url, { symbols: data });
  }

  getList() {
    // if (window.GlobalSocket) {
    //   if (window.GlobalSocket.favoriteSymbols) {
    //     return new Promise((resolve, reject) => {
    //       resolve(window.GlobalSocket.favoriteSymbols);
    //     });
    //   }
    // }

    return new Promise((resolve, reject) => {
      let url = '/favorites';
      this.get(url)
        .then(function (res) {
          // window.GlobalSocket.favoriteSymbols = res;
          resolve(res);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }
}