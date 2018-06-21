export default class Consts {
  static CURRENCY_BTC = 'btc';
  static CURRENCY_ETH = 'eth';
  static CURRENCY_KRW = 'krw';

  static ORDER_TYPE_LIMIT = 'limit';
  static ORDER_TYPE_MARKET = 'market';
  static ORDER_TYPE_STOP_LIMIT = 'stop_limit';
  static ORDER_TYPE_STOP_MARKET = 'stop_market';
  static DEPOSITE_HISTORY = 'Deposite History';
  static WITHDRAW_HISTORY = 'Withdraw History';
  static TRADE_TYPE_BUY = 'buy';
  static TRADE_TYPE_SELL = 'sell';

  //Google authenticator action
  static GOOGLE_2FA_DISABLED_ACT = "disable2FA"
  static GOOGLE_2FA_CHANGE_PASSWORD = "changePassWord"

  //Transaction History
  static DEPOSITS_HISTORY = 'deposits_history';
  static WITHDRAWLS_HISTORY = 'withdrawls_history';
  static DEPOSIT_DETAIL = 'Deposit detail'
  static WITHDRAW_DETAIL = 'Withdraw detail'

  static SORT_MARKET_FIELDS = {
    SYMBOL: 'symbol',
    VOLUME: 'volume',
    PRICE: 'price',
    CHANGE: 'change'
  };

  static SORT_DIRECTION = {
    ASC: 'asc',
    DESC: 'desc'
  };

  static SOCKET_CHANNEL = {
    PUBLIC: {
      APP_PRICES: 'App.Prices',
      APP_ORDERS: 'App.Orders',
      APP_ORDER_BOOK: 'App.OrderBook',
      APP_COIN_MARKKETCAP_TICKER: 'App.CoinMarketCapTicker',
      APP_MARKET_PRICES_CHANGE: 'App.MarketPriceChanges',
      APP_PROFIT_RATE: 'App.ProfitRate'
    },
    PRIVATE: 'App.User.'
  };

  static SOCKET_EVENTS = {
    MARKET_PRICE_CHANGES_UPDATED: 'MarketPriceChangesUpdated',
    PRICE_UPDATED: 'PricesUpdated',
    BALANCE_UPDATED: 'BalanceUpdated',
    TRANSACTION_CREATED: 'TransactionCreated',
    ORDER_TRANSACTION_CREATED: 'OrderTransactionCreated',
    ORDER_BOOK_UPDATED: 'OrderBookUpdated',
    USER_ORDER_BOOK_UPDATED: 'UserOrderBookUpdated',
    ORDER_LIST_UPDATED: 'OrderListUpdated',
    ORDER_CHANGED: 'OrderChanged',
    USER_SESSION_REGISTERED: 'UserSessionRegistered',
    FAVORITE_SYMBOLS_UPDATED: 'FavoriteSymbolsUpdated',
    COIN_MARKET_CAP_TICKET_UPDATED: 'CoinMarketCapTickerUpdated',
    PROFIT_RATE_UPDATED: 'ProfitRateUpdated'
  };
}