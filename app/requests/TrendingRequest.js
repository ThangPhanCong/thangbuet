import BaseRequest from '../libs/BaseRequest'

export default class TrendingRequest extends BaseRequest {

  getTrendingSymbols() {
    let url = '/symbols/trending';
    return this.get(url)
  }
}
