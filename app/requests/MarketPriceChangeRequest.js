import BaseRequest from '../libs/BaseRequest'

export default class MarketPriceChangeRequest extends BaseRequest {

  getPriceChanges() {
    let url = '/market-price-changes';
    return this.get(url)
  }
}
