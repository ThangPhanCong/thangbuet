import React from 'react';
import { Dimensions, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale, verticalScale } from '../../libs/reactSizeMatter/scalingUtils';
import _ from 'lodash';
import Numeral from '../../libs/numeral';
import BigNumber from 'bignumber.js';
import rf from '../../libs/RequestFactory';
import Consts from '../../utils/Consts';
import I18n from '../../i18n/i18n';
import Utils from '../../utils/Utils';
import UIUtils from '../../utils/UIUtils';
import BaseScreen from '../BaseScreen';
import { CommonStyles, Fonts } from '../../utils/CommonStyles';
import Events from '../../utils/Events';

export default class OrderBook extends BaseScreen {
  static TYPE_FULL = 'full';
  static TYPE_SMALL = 'small';

  static COLUMN_COUNT = 5;
  static COLUMN_USER_SELL_QUANTITY = 0;
  static COLUMN_SELL_QUANTITY = 1;
  static COLUMN_PRICE = 2;
  static COLUMN_BUY_QUANTITY = 3;
  static COLUMN_USER_BUY_QUANTITY = 4;

  constructor(props) {
    super(props);

    let emptyOrderBook = [];
    for (let i = 0; i < this._getOrderBookSize(); i++) {
      emptyOrderBook.push({ price: 0, quantity: 0 });
    }
    this.state = {
      firstPriceGroup: 0,
      secondPriceGroup: 0,
      quantityPrecision: 4,
      krwPrice: 0,
      buyOrderBook: emptyOrderBook,
      sellOrderBook: emptyOrderBook,

      priceSetting: { digits: 4 },
      currencyPrice: 1,
      highlightCells: []
    };

    this.orderBook = undefined;
    this.userOrderBook = undefined;
    this.prices = {};
    this.currentPrice = undefined;
    this.yesterdayPrice = undefined;
    this.priceSetting = undefined;
    this.pricePrecision = 0;
    this.quantityPrecision = undefined;
    this.settings = {};

    this._scrollView = undefined;
  }

  async componentWillMount() {
    super.componentWillMount();
    this._updateOrderBook();
    this._loadData();
  }

  componentDidMount() {
    super.componentDidMount();
    setTimeout(() => {
      // scroll to middle
      this._scrollView && this._scrollView.scrollTo({
        x: 0,
        y: 0.4 * this._getOrderBookHeight(),
        animated: false
      });
    }, 100);

  }

  getSocketEventHandlers() {
    return {
      OrderBookUpdated: this._onOrderBookUpdated.bind(this),
      UserOrderBookUpdated: this._onUserOrderBookUpdated.bind(this),
      PricesUpdated: (data) => {
        this.setState(this._onPriceUpdated(data))
      }
    };
  }

  getDataEventHandlers() {
    return {
      [Events.ORDER_BOOK_SETTINGS_UPDATED]: this._onOrderBookSettingsUpdated.bind(this)
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currency != this.props.currency || prevProps.coin != this.props.coin) {
      this.reloadData();
    }
  }

  reloadData() {
    return this._loadData();
  }

  _getCurrency() {
    return this.props.currency;
  }

  _getCoin() {
    return this.props.coin;
  }

  async _loadData() {
    await this._getQuantityPrecision();
    await this._getOrderBookSettings();
    await this._getPriceSetting();

    await Promise.all([
      this._getPrices(),
      this._getOrderBook(),
      this._getUserOrderBook()
    ]);
  }

  async _getPriceSetting() {
    try {
      let response = await rf.getRequest('MasterdataRequest').getAll();
      let priceGroups = _.filter(response.price_groups, (value) => {
        return value.currency == this.props.currency && value.coin == this.props.coin;
      });
      let priceSetting = priceGroups[this.settings.price_group || 0];

      this.priceSetting = priceSetting;
      this.pricePrecision = Utils.getPrecision(priceSetting.value);
    } catch (err) {
      console.log('GetMasterData._error:', err)
    }
  }

  async _getQuantityPrecision() {
    try {
      const response = await rf.getRequest('MasterdataRequest').getAll();
      let setting = _.find(response.coin_settings, (setting) => {
        return setting.currency == this.props.currency && setting.coin == this.props.coin;
      });
      this.quantityPrecision = Math.round(Math.log(1 / setting.minimum_quantity) / Math.log(10));
    } catch (err) {
      console.log('GetMasterData._error:', err)
    }
  }

  async _getPrices() {
    try {
      let response = await rf.getRequest('PriceRequest').getPrices();
      return this._onPriceUpdated(response.data);
    } catch (err) {
      console.log('GetPrices._error:', err)
    }
  }

  async _getOrderBookSettings() {
    try {
      const params = {
        currency: this._getCurrency(),
        coin: this._getCoin()
      };
      const response = await rf.getRequest('UserRequest').getOrderBookSettings(params);
      this.settings = response.data;
      return this._updateOrderBook();
    } catch (err) {
      if(err.message === Consts.NOT_LOGIN) {
        const params = {
          currency: this._getCurrency(),
          coin: this._getCoin()
        };
        this.settings = { ...Consts.DEFAULT_ORDER_BOOK_SETTING, ...params };
        return this._updateOrderBook();
      }
      console.log('GetOrderBookSettings._error:', err)
    }
  }

  async _getOrderBook() {
    try {
      let params = this._getOrderBookParams();
      let response = await rf.getRequest('OrderRequest').getOrderBook(params);
      this.orderBook = response.data;
      this._convertOrderBookDataType(this.orderBook);
      return this._updateOrderBook();
    } catch (err) {
      console.log('GetOrderBook._error:', err)
    }
  }

  _getOrderBookParams() {
    return {
      currency: this.props.currency,
      coin: this.props.coin,
      tickerSize: this._getTickerSize()
    };
  }

  async _getUserOrderBook() {
    try {
      let params = this._getOrderBookParams();
      let response = await rf.getRequest('OrderRequest').getUserOrderBook(params);
      this.userOrderBook = response.data;
      this._convertOrderBookDataType(this.userOrderBook);
      return this._updateOrderBook();
    } catch (err) {
      if(err.message === Consts.NOT_LOGIN) {
        this.userOrderBook = Consts.DEFAULT_USER_ORDER_BOOK;
        this._convertOrderBookDataType(this.userOrderBook);
        return this._updateOrderBook();
      }
      console.log('GetUserOrderBook._error:', err)
    }
  }

  _convertOrderBookDataType(orderBook) {
    this._convertStringToNumber(orderBook.buy);
    this._convertStringToNumber(orderBook.sell);
  }

  _convertStringToNumber(list) {
    for (var i in list) {
      list[i].price = parseFloat(list[i].price);
      list[i].quantity = parseFloat(list[i].quantity);
      list[i].count = parseFloat(list[i].count);
    }
  }

  _getTickerSize() {
    return this.priceSetting ? parseFloat(this.priceSetting.value) : undefined;
  }

  _onPriceUpdated(prices) {
    this.prices = Object.assign({}, this.prices, prices);

    let key = Utils.getPriceKey(this._getCurrency(), this._getCoin());
    if (prices[key]) {
      if (this.currentPrice != this.prices[key].price) {
        this.currentPrice = this.prices[key].price;
        this.yesterdayPrice = this.prices[key].last_24h_price;
      }
    }

    this._updateOrderBook();
  }

  _onOrderBookUpdated(data) {
    const isSameTickerSize = BigNumber(data.tickerSize).isEqualTo(BigNumber(this._getTickerSize()));
    if (data.currency == this._getCurrency() && data.coin == this._getCoin() && isSameTickerSize) {
      this.orderBook = data.orderBook;
      this._convertOrderBookDataType(this.orderBook);
      this._updateOrderBook();
    }
  }

  _onUserOrderBookUpdated(data) {
    const isSameTickerSize = BigNumber(data.tickerSize).isEqualTo(BigNumber(this._getTickerSize()));
    if (data.currency == this._getCurrency() && data.coin == this._getCoin(), isSameTickerSize) {
      this.userOrderBook = data.orderBook;
      this._convertOrderBookDataType(this.userOrderBook);
      this._updateOrderBook();
    }
  }

  async _onOrderBookSettingsUpdated(data) {
    this.settings = data;
    await this._getPriceSetting();
    this._updateOrderBook();
  }

  _updateOrderBook() {
    let currentPrice = this.currentPrice;
    let orderBook = this._combineOrderBooks(); // combine user orderBook with user's orderBook
    let orderBookSize = this._getOrderBookSize();
    let settings = this.settings;
    let tickerSize = this._getTickerSize();

    if (!currentPrice || !orderBook || !settings || !tickerSize) {
      return;
    }

    const middlePrice = this._getMiddlePrice(orderBook, currentPrice, tickerSize);

    let result = undefined;
    if (this.settings.show_empty_group) {
      result = this._getOrderBookWithEmptyRow(orderBook, middlePrice, orderBookSize + 1, tickerSize);
    } else {
      result = this._getOrderBookWithoutEmptyRow(orderBook, middlePrice, orderBookSize + 1, tickerSize);
    }

    result = this._removeRedundantRows(result.buyOrderBook, result.sellOrderBook, orderBookSize);

    this.setState(result);
  }

  _getOrderBookWithEmptyRow(orderBook, middlePrice, orderBookSize, tickerSize) {
    let buyOrderBook = [];
    let sellOrderBook = [];

    let price = middlePrice;
    for (let i = 0; i < orderBookSize; i++) {
      let row = orderBook.buy.find(row => this._isEqual(row['price'], price));
      buyOrderBook.push(row || { price })
      price -= tickerSize;
    }

    price = middlePrice;
    for (let i = 0; i < orderBookSize; i++) {
      let row = orderBook.sell.find(row => this._isEqual(row['price'], price));
      sellOrderBook.unshift(row || { price })
      price += tickerSize;
    }

    return { buyOrderBook, sellOrderBook };
  }

  _getOrderBookWithoutEmptyRow(orderBook, middlePrice, orderBookSize, tickerSize) {
    let buyOrderBook = _.filter(orderBook.buy, item => item.price <= middlePrice);
    let sellOrderBook = _.filter(orderBook.sell, item => item.price >= middlePrice);

    buyOrderBook = _.orderBy(buyOrderBook, 'price', 'desc');
    sellOrderBook = _.orderBy(sellOrderBook, 'price', 'desc');

    this._addPaddingRows(buyOrderBook, sellOrderBook, orderBookSize, middlePrice, tickerSize);

    return { buyOrderBook, sellOrderBook };
  }

  _addPaddingRows(buyOrderBook, sellOrderBook, orderBookSize, middlePrice, tickerSize) {
    this._addPaddingBuyRows(buyOrderBook, orderBookSize, middlePrice, tickerSize);
    this._addPaddingSellRows(sellOrderBook, orderBookSize, middlePrice, tickerSize);
  }

  _addPaddingBuyRows(buyOrderBook, orderBookSize, middlePrice, tickerSize) {
    let bottomRow = _.minBy(buyOrderBook, 'price');
    let bottomPrice = bottomRow ? bottomRow.price : middlePrice;
    while (buyOrderBook.length < orderBookSize) {
      bottomPrice = bottomPrice - tickerSize;
      let price = bottomPrice;
      if (bottomPrice == 0) {
        price = bottomPrice / 10;
      } else if (bottomPrice < 0) {
        price = undefined;
      }
      buyOrderBook.push({ price });
    }
  }

  _addPaddingSellRows(sellOrderBook, orderBookSize, middlePrice, tickerSize) {
    let topRow = _.maxBy(sellOrderBook, 'price');
    let topPrice = topRow ? topRow.price : middlePrice;
    while (sellOrderBook.length < orderBookSize) {
      topPrice = topPrice + tickerSize;
      sellOrderBook.unshift({ price: topPrice });
    }
  }

  _removeRedundantRows(buyOrderBook, sellOrderBook, orderBookSize) {
    const topBuy = buyOrderBook[0];
    const bottomSell = sellOrderBook[sellOrderBook.length - 1];
    if (topBuy.price == bottomSell.price) {
      if (topBuy.quantity > bottomSell.quantity) {
        sellOrderBook.pop();
      } else {
        buyOrderBook.shift();
      }
    }

    if (buyOrderBook.length > orderBookSize) {
      buyOrderBook = buyOrderBook.slice(0, orderBookSize);
    }
    if (sellOrderBook.length > orderBookSize) {
      sellOrderBook = sellOrderBook.slice(sellOrderBook.length - orderBookSize);
    }

    return { buyOrderBook, sellOrderBook };
  }

  _getOrderBookSize() {
    return 9;
  }

  _getMiddlePrice(orderBook, currentPrice, tickerSize) {
    let price = parseFloat(currentPrice);

    var maxBuyGroup = _.maxBy(orderBook.buy, 'price');
    var maxBuyPrice = maxBuyGroup ? maxBuyGroup.price : 0;

    var minSellGroup = _.minBy(orderBook.sell, 'price');
    var minSellPrice = minSellGroup ? minSellGroup.price : 0;

    if (maxBuyPrice > 0 && minSellPrice > 0) {
      if (maxBuyPrice < minSellPrice) {
        if ((maxBuyPrice > currentPrice && minSellPrice > currentPrice)
          || (maxBuyPrice < currentPrice && minSellPrice < currentPrice)) {
          price = (maxBuyPrice + minSellPrice) / 2;
        }
      }
    } else if (maxBuyPrice > 0) {
      price = maxBuyPrice;
    } else if (minSellPrice > 0) {
      price = minSellPrice;
    }

    price = Math.round(price / tickerSize) * tickerSize;
    return price;
  }

  _combineOrderBooks() {
    if (!this.orderBook || !this.userOrderBook) {
      return undefined;
    }

    let combinedOrderBook = _.cloneDeep(this.orderBook);
    for (let i in this.userOrderBook.buy) {
      let userItem = this.userOrderBook.buy[i];
      let item = this.findOrCreateRow(combinedOrderBook.buy, userItem.price);
      item.userQuantity = userItem.quantity;
    }
    for (let i in this.userOrderBook.sell) {
      let userItem = this.userOrderBook.sell[i];
      let item = this.findOrCreateRow(combinedOrderBook.sell, userItem.price);
      item.userQuantity = userItem.quantity;
    }

    return combinedOrderBook;
  }

  findOrCreateRow(data, price) {
    let row = data.find(row => this._isEqual(row['price'], price));
    if (!row) {
      row = { price };
      data.push(row);
    }
    return row;
  }

  _isEqual(a, b) {
    return Math.abs(a - b) < 1e-10;
  }

  _calculateRowPercent(buyOrderBook, sellOrderBook) {
    const quantityFunction = (row) => {
      return parseFloat(row.quantity);
    }
    let maxBuy = maxBy(buyOrderBook, quantityFunction) || {};
    let maxSell = maxBy(sellOrderBook, quantityFunction) || {};
    let maxQuantity = Math.max(maxBuy.quantity || 0, maxSell.quantity || 0);

    for (let row of buyOrderBook) {
      row.quantityPercent = row.quantity * 100 / maxQuantity;
    }
    for (let row of sellOrderBook) {
      row.quantityPercent = row.quantity * 100 / maxQuantity;
    }
  }

  _getOrderBookHeight() {
    const mainTabBarHeight = scale(40);
    const headerHeight = verticalScale(90);
    const tabheight = scale(37);
    const toolbarHeight = verticalScale(38);
    const { height } = Dimensions.get('window');
    return height - UIUtils.getStatusBarHeight() - mainTabBarHeight - headerHeight - tabheight - toolbarHeight;
  }

  render() {
    switch (this.props.type) {
      case OrderBook.TYPE_FULL:
        return this._renderFullOrderBook();
      case OrderBook.TYPE_SMALL:
        return this._renderSmallOrderBook();
      default:
        return this._renderFullOrderBook();
    }
  }

  _renderFullOrderBook() {
    return (
      <View style={styles.screen}>
        {this._renderHeader()}
        <ScrollView ref={ref => this._scrollView = ref} style={styles.screen} showsVerticalScrollIndicator={false}>
          <View style={{ width: '100%', height: 1.8 * this._getOrderBookHeight() }}>
            <View style={styles.sellGroup}>
              {this.state.sellOrderBook.map((item, index) => {
                return this._renderSellRow(item, index, index == this.state.sellOrderBook.length - 1);
              })}
            </View>
            <View style={styles.buyGroup}>
              {this.state.buyOrderBook.map((item, index) => {
                return this._renderBuyRow(item, index);
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  _renderHeader() {
    return (
      <LinearGradient style={styles.orderBookHeader} colors={['#F2F2F2', '#D9D9D9']}>
        <View style={styles.userQuantityHeader}>
          <Text style={styles.headerText}>{I18n.t('orderBook.sell')}</Text>
        </View>
        <View style={styles.quantityHeader}>
          <Text style={styles.headerText}>{I18n.t('orderBook.balance')}</Text>
        </View>
        <View style={styles.priceHeader}>
          <Text style={styles.headerText}>{I18n.t('orderBook.price')}</Text>
        </View>
        <View style={styles.quantityHeader}>
          <Text style={styles.headerText}>{I18n.t('orderBook.balance')}</Text>
        </View>
        <View style={styles.userQuantityHeader}>
          <Text style={styles.headerText}>{I18n.t('orderBook.buy')}</Text>
        </View>
      </LinearGradient>
    );
  }

  _renderSellRow(item, index, isLastRow = false) {
    const borders = this._generateBorderStyles(index, extendedStyles.topBorder, isLastRow);
    return (
      <View style={styles.orderBookRow} key={index}>
        <TouchableWithoutFeedback onPress={() => this._onPressOrderBookCell(item, index, Consts.TRADE_TYPE_SELL)}>
          <View style={[styles.userSellQuantityCell, borders[0]]}>
            <Text style={styles.userSellQuantityText}>{this._formatQuantity(item.userQuantity)}</Text>
          </View>
        </TouchableWithoutFeedback>
        <View style={[styles.quantityCell, borders[1]]}>
          <View style={[styles.sellPercent, this._getPercentViewStyle(item)]}/>
          <Text style={styles.quantityText} numberOfLines={1} ellipsizeMode='tail'>
            {this._formatQuantity(item.quantity)}
          </Text>
        </View>
        <View style={[styles.priceCell, borders[2], this._getPriceCellStyle(item.price)]}>
          <Text style={[styles.priceText, this._getPriceTextStyle(item.price)]}>{this._formatPrice(item.price)}</Text>
        </View>
        <View style={[styles.quantityCell, borders[3]]}>
        </View>
        <TouchableWithoutFeedback onPress={() => this._onPressOrderBookCell(item, index, Consts.TRADE_TYPE_BUY)}>
          <View style={[styles.userBuyQuantityCell, borders[4]]}>
            <Text style={styles.userBuyQuantityText}></Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _generateBorderStyles(index, normalStyle, isLastRow = false) {
    let borderStyles = normalStyle;
    if (isLastRow) {
      borderStyles = Object.assign({}, borderStyles, extendedStyles.separatorBorder);
    }
    let borders = [borderStyles, borderStyles, borderStyles, borderStyles, borderStyles]
    for (let highlightCell of this.state.highlightCells) {
      if (index == highlightCell.row) {
        let column = highlightCell.column;
        borders[column] = Object.assign({}, borders[column], extendedStyles.selectedBorder);
      }
    }
    return borders;
  }

  _renderBuyRow(item, index) {
    const orderBookRowIndex = index + this._getOrderBookSize();
    const borders = this._generateBorderStyles(orderBookRowIndex, extendedStyles.bottomBorder);
    return (
      <View style={styles.orderBookRow} key={index}>
        <TouchableWithoutFeedback
          onPress={() => this._onPressOrderBookCell(item, orderBookRowIndex, Consts.TRADE_TYPE_SELL)}>
          <View style={[styles.userSellQuantityCell, borders[0]]}>
            <Text style={styles.userSellQuantityText}></Text>
          </View>
        </TouchableWithoutFeedback>
        <View style={[styles.quantityCell, borders[1]]}>
        </View>
        <View style={[styles.priceCell, borders[2], this._getPriceCellStyle(item.price)]}>
          <Text style={[styles.priceText, this._getPriceTextStyle(item.price)]}>{this._formatPrice(item.price)}</Text>
        </View>
        <View style={[styles.quantityCell, borders[3]]}>
          <View style={[styles.sellPercent, this._getPercentViewStyle(item)]}/>
          <Text style={styles.quantityText} numberOfLines={1} ellipsizeMode='tail'>
            {this._formatQuantity(item.quantity)}
          </Text>
        </View>
        <TouchableWithoutFeedback
          onPress={() => this._onPressOrderBookCell(item, orderBookRowIndex, Consts.TRADE_TYPE_BUY)}>
          <View style={[styles.userBuyQuantityCell, borders[4]]}>
            <Text style={styles.userBuyQuantityText}>{this._formatQuantity(item.userQuantity)}</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _getPriceCellStyle(price) {
    if (price == this.currentPrice) {
      return styles.currentPriceCell;
    } else {
      return {};
    }
  }

  _getPriceTextStyle(price) {
    if (price == this.currentPrice) {
      return styles.currentPrice;
    } else if (price >= this.yesterdayPrice) {
      return CommonStyles.priceIncreased;
    } else {
      return CommonStyles.priceDecreased;
    }
  }

  _onPressOrderBookCell(item, index, tradeType) {
    const column = tradeType == Consts.TRADE_TYPE_SELL
      ? OrderBook.COLUMN_USER_SELL_QUANTITY
      : OrderBook.COLUMN_USER_BUY_QUANTITY;
    const highlightCells = [
      { row: index, column: OrderBook.COLUMN_PRICE },
      { row: index, column: column }
    ];
    this.setState({ highlightCells });
    this._notifyOrderBookPressed(item, tradeType, OrderBook.TYPE_FULL);
  }

  _formatQuantity(value) {
    let precision = this.state.quantityPrecision;
    let format = precision == 0 ?
      '0,0' :
      '0,0.' + Array(precision + 1).join('0') + '';
    return value ? Numeral(value).format(format) : '';
  }

  _formatPrice(value) {
    let precision = this.pricePrecision;
    let format = precision == 0 ?
      '0,0' :
      '0,0.' + Array(precision + 1).join('0') + '';
    return value ? Numeral(value).format(format) : '';
  }

  _getPercentViewStyle(item) {
    return {
      width: (item.quantityPercent || 0) + '%'
    };
  }

  _renderSmallOrderBook() {
    return (
      <ScrollView ref={ref => this._scrollView = ref} style={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', height: 1.8 * this._getOrderBookHeight() }}>
          <View style={styles.sellGroup}>
            {this.state.sellOrderBook.map((item, index) => {
              return this._renderSmallSellRow(item, index);
            })}
          </View>
          <View style={styles.buyGroup}>
            {this.state.buyOrderBook.map((item, index) => {
              return this._renderSmallBuyRow(item, index);
            })}
          </View>
        </View>
      </ScrollView>
    );
  }

  _renderSmallSellRow(item, index) {
    return (
      <TouchableWithoutFeedback key={index}
                                onPress={() => this._onPressSmallOrderBookRow(item, Consts.TRADE_TYPE_SELL)}>
        <View style={styles.smallOrderBookRow}>
          <View
            style={[styles.priceCell, styles.smallTopBorder, styles.smallSellPrice, this._getPriceCellStyle(item.price)]}>
            <Text
              style={[styles.smallPriceText, this._getPriceTextStyle(item.price)]}>{this._formatPrice(item.price)}</Text>
          </View>
          <View style={[styles.quantityCell, styles.smallTopBorder, styles.smallQuantity]}>
            <View style={[styles.sellPercent, this._getPercentViewStyle(item)]}/>
            <Text style={styles.smallQuantityText} numberOfLines={1} ellipsizeMode='tail'>
              {this._formatQuantity(item.quantity)}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _renderSmallBuyRow(item, index) {
    return (
      <TouchableWithoutFeedback key={index} onPress={() => this._onPressSmallOrderBookRow(item, Consts.TRADE_TYPE_BUY)}>
        <View style={styles.smallOrderBookRow}>
          <View style={[
            styles.priceCell,
            styles.smallBottomBorder,
            styles.smallBuyPrice,
            this._getPriceCellStyle(item.price)]}>
            <Text
              style={[styles.smallPriceText, this._getPriceTextStyle(item.price)]}>{this._formatPrice(item.price)}</Text>
          </View>
          <View style={[styles.quantityCell, styles.smallBottomBorder, styles.smallQuantity]}>
            <View style={[styles.sellPercent, this._getPercentViewStyle(item)]}/>
            <Text style={styles.smallQuantityText} numberOfLines={1} ellipsizeMode='tail'>
              {this._formatQuantity(item.quantity)}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _onPressSmallOrderBookRow(item, tradeType) {
    this._notifyOrderBookPressed(item, tradeType, OrderBook.TYPE_SMALL);
  }

  _notifyOrderBookPressed(item, tradeType, orderBookType) {
    if (!item.price) {
      return;
    }
    if (!this.settings.click_to_order && orderBookType == OrderBook.TYPE_FULL) {
      return;
    }

    let data = { ...item }
    data.tradeType = tradeType;
    data.orderBookType = orderBookType;
    this.notify(Events.ORDER_BOOK_ROW_PRESSED, data);
  }
}

const fontSize = scale(12);
const borderColor = '#D9D9D9';
const borderWidth = scale(1);
const sellCellBorder = {
  borderTopWidth: borderWidth,
  borderLeftWidth: borderWidth,
  borderColor: borderColor
};
const cellText = {
  fontSize: fontSize,
  marginLeft: scale(5),
  marginRight: scale(5)
};
const selectedBorderWidth = scale(2);
const selectedBotderColor = '#F00';
const extendedStyles = {
  topBorder: {
    borderRightWidth: borderWidth,
    borderRightColor: borderColor,
    borderTopWidth: borderWidth,
    borderTopColor: '#FFF',
    borderBottomWidth: borderWidth,
    borderBottomColor: borderColor,
    borderLeftWidth: 1,
    borderLeftColor: '#0000'
  },
  bottomBorder: {
    borderRightWidth: borderWidth,
    borderRightColor: borderColor,
    borderTopWidth: borderWidth,
    borderTopColor: '#FFF',
    borderBottomWidth: borderWidth,
    borderBottomColor: borderColor
  },
  separatorBorder: {
    borderBottomWidth: borderWidth,
    borderBottomColor: '#595959'
  },
  selectedBorder: {
    borderTopWidth: selectedBorderWidth,
    borderLeftWidth: selectedBorderWidth,
    borderBottomWidth: selectedBorderWidth,
    borderRightWidth: selectedBorderWidth,
    borderTopColor: selectedBotderColor,
    borderLeftColor: selectedBotderColor,
    borderBottomColor: selectedBotderColor,
    borderRightColor: selectedBotderColor,
    marginRight: -1,
    marginLeft: -1
  }
};

const styles = ScaledSheet.create({
  screen: {
    flex: 1
  },
  screenVertical: {
    flex: 1,
    flexDirection: 'column'
  },

  buyGroup: {
    flex: 1
  },
  sellGroup: {
    flex: 1
  },
  orderBookRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch'
  },

  orderBookHeader: {
    flexDirection: 'row',
    height: '25@s',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#BFBFBF'
  },
  userQuantityHeader: {
    flex: 0.9,
    justifyContent: 'center',
    borderRightWidth: borderWidth,
    borderColor: borderColor
  },
  quantityHeader: {
    flex: 0.8,
    justifyContent: 'center',
    borderRightWidth: borderWidth,
    borderColor: borderColor
  },
  priceHeader: {
    flex: 1,
    justifyContent: 'center',
    borderRightWidth: borderWidth,
    borderColor: borderColor
  },
  headerText: {
    textAlign: 'center',
    fontSize: '14@s',
    ...Fonts.NotoSans
  },

  userSellQuantityCell: {
    flex: 0.9,
    justifyContent: 'center',
    backgroundColor: '#F0F6FB'
  },
  userSellQuantityText: {
    ...cellText,
    textAlign: 'right',
    fontSize: '13@s',
    ...Fonts.OpenSans
  },
  sellPercent: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
  },
  quantityCell: {
    flex: 0.8,
    justifyContent: 'center'
  },
  quantityText: {
    ...cellText,
    textAlign: 'right',
    color: '#000',
    fontSize: '13@s',
    ...Fonts.OpenSans
  },
  priceCell: {
    flex: 1,
    justifyContent: 'center'
  },
  priceText: {
    ...cellText,
    textAlign: 'center',
    fontSize: '13@s',
    ...Fonts.OpenSans
  },
  userBuyQuantityCell: {
    flex: 0.9,
    justifyContent: 'center',
    backgroundColor: '#FFF0F0'
  },
  userBuyQuantityText: {
    ...cellText,
    textAlign: 'right'
  },

  currentPriceCell: {
    backgroundColor: '#002060'
  },
  currentPrice: {
    color: '#FFF'
  },

  smallOrderBookRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: borderWidth,
    borderColor: '#FFF'
  },
  smallBuyPrice: {
    backgroundColor: '#FFF0F0'
  },
  smallSellPrice: {
    backgroundColor: '#F0F6FB'
  },
  smallQuantity: {
    backgroundColor: '#FBFAFA'
  },
  smallTopBorder: {
    borderRightWidth: borderWidth,
    borderColor: '#FFF'
  },
  smallBottomBorder: {
    borderRightWidth: borderWidth,
    borderColor: '#FFF'
  },
  smallPriceText: {
    ...cellText,
    textAlign: 'center',
    fontSize: '13.5@s',
    ...Fonts.OpenSans
  },
  smallQuantityText: {
    ...cellText,
    fontSize: '12@s',
    ...Fonts.OpenSans
  }
});