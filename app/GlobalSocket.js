import Echo from 'laravel-echo';
import MicroEvent from 'microevent';
import { merge } from 'lodash';
import AppConfig from './utils/AppConfig'
import AppPreferences from './utils/AppPreferences';
import rf from './libs/RequestFactory';

export default class GlobalSocket {

  constructor(publicChannelsOnly) {
    this.connect(publicChannelsOnly);
  }

  connect(publicChannelsOnly) {
    if (!AppConfig.ACCESS_TOKEN) {
      return;
    }

    if (window.Echo) {
      window.Echo.disconnect();
    }

    window.Echo = this.initSocket();
    this.listenEvents(publicChannelsOnly);
  }

  disconnect() {
    if (window.Echo) {
      window.Echo.disconnect();
    }
  }

  initSocket() {
    return new Echo({
      broadcaster: 'socket.io',
      host: AppConfig.getSocketServer(),
      encrypted: true,
      client: require('socket.io-client'),
      auth: {
        headers: {
          'Authorization': 'Bearer ' + AppConfig.ACCESS_TOKEN,
        },
      },
    });
  }

  listenEvents(publicChannelsOnly) {
    //public channels
    this.listenForPrices();
    this.listenForOrderTransaction();
    this.listenForOrderBook();
    this.listenForCoinMarketCapTicker();
    this.listenForPriceChanges();
    this.listenForBot();

    if (!publicChannelsOnly) {
      //user private channels
      rf.getRequest('UserRequest').getCurrentUser()
        .then(res => {
          var userId = res.data.id;
          this.listenForBalance(userId);
          this.listenForTransaction(userId);
          this.listenForUserOrderBook(userId);
          this.listenForOrderList(userId);
          this.listenForOrderEvent(userId);
          this.listenForUserSessionRegistered(userId);
          this.listenForFavoriteSymbols(userId);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  setPrices(prices) {
    this.prices = merge(this.prices || {}, prices);
  }

  notifyPricesUpdate(newPrices) {
    this.prices = merge(this.prices || {}, newPrices);
    this.trigger('PricesUpdated', newPrices.data);
  }

  listenForPrices() {
    window.Echo.channel('App.Prices')
      .listen('PricesUpdated', (newPrices) => {
        this.notifyPricesUpdate(newPrices);
      });
  }

  listenForBalance(userId) {
    window.Echo.private('App.User.' + userId)
      .listen('BalanceUpdated', (balance) => {
        this.trigger('BalanceUpdated', balance.data);
        if (this.balance) {
          this.balance.data = merge(this.balance.data || {}, balance.data);
        }
      });
  }

  listenForTransaction(userId) {
    window.Echo.private('App.User.' + userId)
      .listen('TransactionCreated', (transaction) => {
        this.trigger('TransactionCreated', transaction.data);
      });
  }

  listenForOrderTransaction(userId) {
    window.Echo.channel('App.Orders')
      .listen('OrderTransactionCreated', (transaction) => {
        this.trigger('OrderTransactionCreated', transaction.data);
      });
  }

  listenForOrderBook() {
    window.Echo.channel('App.OrderBook')
      .listen('OrderBookUpdated', (orderBook) => {
        this.trigger('OrderBookUpdated', orderBook.data);
      });
  }

  listenForUserOrderBook(userId) {
    window.Echo.private('App.User.' + userId)
      .listen('UserOrderBookUpdated', (orderBook) => {
        this.trigger('UserOrderBookUpdated', orderBook.data);
      });
  }

  listenForOrderList(userId) {
    window.Echo.private('App.User.' + userId)
      .listen('OrderListUpdated', (data) => {
        this.trigger('OrderListUpdated', data.data);
      });
  }

  listenForOrderEvent(userId) {
    window.Echo.private('App.User.' + userId)
      .listen('OrderChanged', (data) => {
        this.trigger('OrderChanged', data.data);
      });
  }

  listenForUserSessionRegistered(userId) {
    window.Echo.private('App.User.' + userId)
      .listen('UserSessionRegistered', (data) => {
        this.trigger('UserSessionRegistered', data.data);
      });
  }

  listenForFavoriteSymbols(userId) {
    window.Echo.private('App.User.' + userId)
      .listen('FavoriteSymbolsUpdated', (symbols) => {
        this.trigger('FavoriteSymbolsUpdated', symbols.data);
        if (this.favoriteSymbols) {
          this.favoriteSymbols.data = merge(this.favoriteSymbols.data || {}, symbols.data);
        }
      });
  }

  listenForCoinMarketCapTicker() {
    window.Echo.channel('App.CoinMarketCapTicker')
      .listen('CoinMarketCapTickerUpdated', (res) => {
        this.trigger('CoinMarketCapTickerUpdated', res.data);
      });
  }

  listenForPriceChanges() {
    window.Echo.channel('App.MarketPriceChanges')
      .listen('MarketPriceChangesUpdated', (res) => {
        this.trigger('MarketPriceChangesUpdated', res.data);
      });
  }

  listenForBot() {
    window.Echo.channel('App.ProfitRate')
      .listen('ProfitRateUpdated', (res) => {
        this.trigger('ProfitRateUpdated', res.data);
      });
  }
}
