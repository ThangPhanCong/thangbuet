import BaseRequest from '../libs/BaseRequest';

export default class TransactionRequest extends BaseRequest {

  getHistory(params, typeCoin) {
    let url = '/transactions';
    if (typeCoin) {
      url += '/' + typeCoin;
    }
    return this.get(url, params);
  }

  withdraw(params) {
    let url = '/transactions/withdraw';
    return this.post(url, params);
  }

  withdrawKrw(params) {
    let url = '/transactions/withdraw-krw';
    return this.post(url, params);
  }

  depositKrw(params) {
    let url = '/transactions/deposit-krw';
    return this.post(url, params);
  }

  getPendingDepositTransaction(params) {
    let url = '/transactions/deposit/pending';
    return this.post(url, params);
  }

  cancelKrwDepositTransaction(params) {
    let url = '/transactions/deposit/cancel';
    return this.post(url, params);
  }

  getStats(params) {
    let url = '/transactions/stats';
    return this.get(url, params);
  }

  getTrasactionHistory(params) {
    let url = '/transactions';

    return this.get(url, params);
  }

  getWithdrawalDaily(params) {
    let url = '/transactions/withdraw-daily'

    return this.post(url, params)
  }
}
