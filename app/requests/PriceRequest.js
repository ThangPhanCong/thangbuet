import BaseRequest from '../libs/BaseRequest';

export default class PriceRequest extends BaseRequest {

  constructor() {
    super();
    this._isRequesting = false;
    this._getPriceResolvers = [];
    this._getPriceRejectors = [];
  }

  getPrices() {
    // if (window.GlobalSocket && window.GlobalSocket.prices) {
    //   return Promise.resolve(window.GlobalSocket.prices);
    // }

    if (this._isRequesting) {
      return new Promise((resolve, reject) => {
        this._getPriceResolvers.push(resolve);
        this._getPriceRejectors.push(reject);
      });
    }

    this._isRequesting = true;
    let url = '/prices';
    return this.get(url)
      .then(res => {
        // window.GlobalSocket.setPrices(res);
        this._callback(this._getPriceResolvers, res);
        this._getPriceResolvers = [];
        this._getPriceRejectors = [];
        this._isRequesting = false;
        return res;
      })
      .catch(error => {
        this._callback(this._getPriceRejectors, error);
        this._getPriceResolvers = [];
        this._getPriceRejectors = [];
        this._isRequesting = false;
      });
  }

  _callback(callbacks, data) {
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(error);
      }
    });
  }

  getChartBars(params) {
    let url = '/chart/bars';
    return this.get(url, params);
  }

  getPriceScope(currency) {
    let url = '/price-scope';
    return this.get(url, currency);
  }

  getMarketInfo(params) {
    let url = '/market-info';
    return this.get(url, params);
  }
}
