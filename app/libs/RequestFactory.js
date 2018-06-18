import UserRequest from '../requests/UserRequest';
import MasterdataRequest from '../requests/MasterdataRequest';
import NotificationRequest from '../requests/NotificationRequest';
import OrderRequest from '../requests/OrderRequest';
import PriceRequest from '../requests/PriceRequest';
import HistoryRequest from '../requests/HistoryRequest';
import TransactionRequest from '../requests/TransactionRequest';
import ServiceRequest from '../requests/ServiceRequest';
import NoticeRequest from '../requests/NoticeRequest';
import FavoriteRequest from '../requests/FavoriteRequest';
import MarketPriceChangeRequest from '../requests/MarketPriceChangeRequest';
import TrendingRequest from '../requests/TrendingRequest';

const requestMap = {
  UserRequest,
  MasterdataRequest,
  NotificationRequest,
  OrderRequest,
  PriceRequest,
  HistoryRequest,
  TransactionRequest,
  ServiceRequest,
  NoticeRequest,
  FavoriteRequest,
  MarketPriceChangeRequest,
  TrendingRequest,
};

const instances = {};

export default class RequestFactory {

  static getRequest(classname) {
    let RequestClass = requestMap[classname];
    if (!RequestClass) {
      throw new Error('Invalid request class name: ' + classname);
    }

    let requestInstance = instances[classname];
    if (!requestInstance) {
      requestInstance = new RequestClass();
      instances[classname] = requestInstance;
    }

    return requestInstance;
  }

}
