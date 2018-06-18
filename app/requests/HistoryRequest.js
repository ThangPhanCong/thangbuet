import BaseRequest from '../libs/BaseRequest'

export default class HistoryRequest extends BaseRequest {

  getOrderTransactionHistory(params) {
    let url = '/orders/transactions';
    return this.get(url, params)
  }
}
