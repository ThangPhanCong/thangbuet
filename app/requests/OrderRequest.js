import BaseModelRequest from '../libs/BaseModelRequest';

export default class OrderRequest extends BaseModelRequest {

  getModelName() {
    return 'orders';
  }

  cancel(id) {
    let url = '/orders/' + id + '/cancel';
    return this.put(url);
  }

  cancelAll() {
    let url = '/orders/cancel-all';
    return this.put(url);
  }

  cancelByType(params) {
    let url = '/orders/cancel-by-type';
    return this.put(url, params);
  }

  getRecentTransactions(params) {
    let url = '/orders/transactions/recent';
    return this.get(url, params);
  }

  getOrders(params, currency, status, cancelToken) {
    let url = '/orders/' + currency + '/' + status;
    return this.get(url, params, cancelToken);
  }

  getOrdersPending(params) {
    let url = '/orders/pending';
    return this.get(url, params);
  }

  getOrderBook(params) {
    let url = '/orders/order-book';
    return this.get(url, params);
  }

  getUserOrderBook(params, cancelToken) {
    let url = '/orders/user-order-book';
    return this.get(url, params, cancelToken);
  }

  getOrdersHistory(params) {
    let url = '/orders/transactions';
    return this.get(url, params);
  }

}
