import React from 'react';
import {
  Button,
  PixelRatio,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import _ from 'lodash';
import Numeral from '../../libs/numeral';
import rf from '../../libs/RequestFactory';
import Consts from '../../utils/Consts';
import I18n from '../../i18n/i18n';
import Utils from '../../utils/Utils';
import BaseScreen from '../BaseScreen';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import { formatCurrency, formatPercent } from '../../utils/Filters';

export default class OrderBook extends BaseScreen {
  static TYPE_FULL = 'full';
  static TYPE_SMALL = 'small';

  constructor(props) {
    super(props);
    this.state = {
      firstPriceGroup: 0,
      secondPriceGroup: 0,
      quantityPrecision: 4,
      krwPrice: 0,
      buyOrderBook: [],
      sellOrderBook: [],

      priceSetting: { digits: 4 },

      currencyPrice: 1,
      marketData: {},
    };

    this.orderBook = undefined;
    this.userOrderBook = undefined;
    this.prices = {};
    this.currencyPrice;
    this.priceSetting = undefined;
    this.quantityPrecision = undefined;
  }

  async componentWillMount() {
    super.componentWillMount();
    this._updateOrderBook()
    this._loadData();
  }

  reloadData() {
    return this._loadData();
  }

  setPriceSetting(priceSetting) {
    Utils.calculatePriceSettingDigits(priceSetting);
    this.setState({ priceSetting });
    this.reloadData();
  }

  componentDidUpdate(prevProps, prevState) {
    // Reload order type list when change order type
    if (prevProps.type != this.props.type) {
      this.reloadData();
    }
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
    let response = await rf.getRequest('MasterdataRequest').getAll();
    let priceGroups = _.filter(response.price_groups, (value) => {
      return value.currency == this.props.currency && value.coin == this.props.coin;
    });
    let priceSetting = priceGroups[this.settings.price_group];
    this.priceSetting = priceSetting;
    this.pricePrecision = Utils.getPrecision(priceSetting.value);
  }

  async _getQuantityPrecision() {
    const response = await rf.getRequest('MasterdataRequest').getAll();
    let setting = _.find(response.coin_settings, (setting) => {
      return setting.currency == this.props.currency && setting.coin == this.props.coin;
    });
    this.quantityPrecision = Math.round(Math.log(1 / setting.minimum_quantity) / Math.log(10));
  }

  async _getPrices() {
    let response = await rf.getRequest('PriceRequest').getPrices();
    return this._onPriceUpdated(response.data);
  }

  async _getOrderBookSettings() {
    let response = await rf.getRequest('UserRequest').getOrderBookSettings();
    this.settings = response.data;
    return this._updateOrderBook();
  }

  async _getOrderBook() {
    let params = this._getOrderBookParams();
    let response = await rf.getRequest('OrderRequest').getOrderBook(params);
    this.orderBook = response.data;
    this._convertOrderBookDataType(this.orderBook);
    return this._updateOrderBook();
  }

  _getOrderBookParams() {
    return {
      currency: this.props.currency,
      coin: this.props.coin,
      tickerSize: this._getTickerSize()
    };
  }

  async _getUserOrderBook() {
    let params = this._getOrderBookParams();
    let response = await rf.getRequest('OrderRequest').getUserOrderBook(params);
    this.userOrderBook = response.data;
    this._convertOrderBookDataType(this.userOrderBook);
    return this._updateOrderBook();
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
        this.currentPrice = this.prices[key].price
      }
    }

    this._updateOrderBook();
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

  _onOrderBookUpdated(data) {
    if (data.currency == this._getCurrency() && data.coin == this._getCoin()) {
      this.orderBook = data.orderBook;
      this._convertOrderBookDataType(this.orderBook);
      this._updateOrderBook();
    }
  }

  _onUserOrderBookUpdated(data) {
    if (data.currency == this._getCurrency() && data.coin == this._getCoin()) {
      this.userOrderBook = data.orderBook;
      this._convertOrderBookDataType(this.userOrderBook);
      this._updateOrderBook();
    }
  }

  _updateOrderBook() {
    let currentPrice = this.currentPrice;
    let orderBook = this._combineOrderBooks(); // combine user orderBook with user's orderBook
    let orderBookSize = this._getOrderBookSize();
    let settings = this.settings;
    let tickerSize = this._getTickerSize();

    console.log('price: ', currentPrice, 'orderbook: ', orderBook, 'settings: ', settings, 'ticker: ', tickerSize);

    if (!currentPrice || !orderBook || !settings || !tickerSize) {
      return;
    }

    const middlePrice = this._getMiddlePrice(orderBook, currentPrice);

    let result = undefined;
    if (this.settings.show_empty_group) {
      result = this._getOrderBookWithEmptyRow(orderBook, middlePrice);
    } else {
      result = this._getOrderBookWithoutEmptyRow(orderBook, middlePrice);
    }

    this._addPaddingRows(result.buyOrderBook, result.sellOrderBook, orderBookSize, middlePrice, tickerSize);

    this.setState(result);
  }

  _getOrderBookWithoutEmptyRow(orderBook, middlePrice) {
    let buyOrderBook = _.filter(orderBook.buy, item => item.price <= middlePrice);
    let sellOrderBook = _.filter(orderBook.sell, item => item.price >= middlePrice);

    buyOrderBook = _.orderBy(buyOrderBook, 'price', 'desc');
    sellOrderBook = _.orderBy(sellOrderBook, 'price', 'desc');

    return { buyOrderBook, sellOrderBook };
  }

  _addPaddingRows(buyOrderBook, sellOrderBook, orderBookSize, middlePrice, tickerSize) {
    if (buyOrderBook.length > orderBookSize) {
      buyOrderBook = buyOrderBook.slice(0, orderBookSize);
    }
    if (sellOrderBook.length > orderBookSize) {
      sellOrderBook = sellOrderBook.slice(sellOrderBook.length - orderBookSize);
    }

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

  _getOrderBookSize() {
    let sizes = {};
    sizes[OrderBook.TYPE_FULL] = 5;
    sizes[OrderBook.TYPE_SMALL] = 5;
    return sizes[this.props.type] || 5;
  }

  _getMiddlePrice(orderBook, currentPrice) {
    // TODO calculate middle price
    return currentPrice;
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

  _renderBuyRowVertical(item, index) {
    return (
      <TouchableOpacity activeOpacity={1} style={styles.orderBookRow} key={index} onPress={() => this._rowClick(item)}>
        <View style={[styles.buyPercentVertical, this._getPercentViewStyle(item)]} />
        <Text style={styles.buyPriceVertical} >{this._formatPrice(item.price)}</Text>
        <Text style={styles.buyQuantityVertical}>{this._formatQuantity(item.quantity)}</Text>
      </TouchableOpacity>
    );
  }

  _renderSellRowVertical(item, index) {
    const { currency } = this.props;

    return (
      <TouchableOpacity activeOpacity={1} style={styles.orderBookRow} key={index} onPress={() => this._rowClick(item)}>
        <View style={[styles.sellPercentVertical, this._getPercentViewStyle(item)]} />
        <Text
          style={styles.sellPrice}>{this._formatPrice(item.price)}</Text>
        <Text style={styles.sellQuantity}>{this._formatQuantity(item.quantity)}</Text>
      </TouchableOpacity>
    );
  }

  _renderFullOrderBook() {
    return (
      <View style={styles.screenFull}>
        {this._renderHeader()}
        <View style={styles.sellGroup}>
          {this.state.sellOrderBook.map((item, index) => {
            return this._renderSellRow(item, index);
          })}
        </View>
        <View style={styles.separator}/>
        <View style={styles.buyGroup}>
          {this.state.buyOrderBook.map((item, index) => {
            return this._renderBuyRow(item, index);
          })}
        </View>
      </View>
    )
  }

  _renderHeader() {
    return (
      <View style={styles.orderBookHeader}>
        <View style={styles.userQuantityHeader}>
          <Text style={styles.headerText}>매도</Text>
        </View>
        <View style={styles.quantityHeader}>
          <Text style={styles.headerText}>잔량</Text>
        </View>
        <View style={styles.priceHeader}>
          <Text style={styles.headerText}>가격</Text>
        </View>
        <View style={styles.quantityHeader}>
          <Text style={styles.headerText}>잔량</Text>
        </View>
        <View style={styles.userQuantityHeader}>
          <Text style={styles.headerText}>매도</Text>
        </View>
      </View>
    );
  }

  _renderSellRow(item, index) {
    return (
      <View style={styles.orderBookRow} key={index} onPress={() => this._rowClick(item)}>
        <View style={[styles.userSellQuantityCell, styles.topBorder]}>
          <Text style={styles.userSellQuantityText}>{this._formatQuantity(item.userQuantity)}</Text>
        </View>
        <View style={[styles.quantityCell, styles.topBorder]}>
          <View style={[styles.sellPercent, this._getPercentViewStyle(item)]} />
          <Text style={styles.quantityText}>{this._formatQuantity(item.quantity)}</Text>
        </View>
        <View style={[styles.priceCell, styles.topBorder]}>
          <Text style={styles.priceText}>{this._formatPrice(item.price)}</Text>
        </View>
        <View style={[styles.quantityCell, styles.topBorder]}>
        </View>
        <View style={[styles.userBuyQuantityCell, styles.topBorder]}>
          <Text style={styles.userBuyQuantityText}></Text>
        </View>
      </View>
    );
  }

  _renderBuyRow(item, index) {
    return (
      <View style={styles.orderBookRow} key={index} onPress={() => this._rowClick(item)}>
        <View style={[styles.userSellQuantityCell, styles.bottomBorder]}>
          <Text style={styles.userSellQuantityText}></Text>
        </View>
        <View style={[styles.quantityCell, styles.bottomBorder]}>
        </View>
        <View style={[styles.priceCell, styles.bottomBorder]}>
          <Text style={styles.priceText}>{this._formatPrice(item.price)}</Text>
        </View>
        <View style={[styles.quantityCell, styles.bottomBorder]}>
          <View style={[styles.sellPercent, this._getPercentViewStyle(item)]} />
          <Text style={styles.quantityText}>{this._formatQuantity(item.quantity)}</Text>
        </View>
        <View style={[styles.userBuyQuantityCell, styles.bottomBorder]}>
          <Text style={styles.userBuyQuantityText}>{this._formatQuantity(item.userQuantity)}</Text>
        </View>
      </View>
    );
  }

  _rowClick(item) {
    if (item.price) {
      this.props.parentOrderForm.setPrice(item.price);
    }
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

  _getFiatPrice() {
    return this.state.marketData.price * this.state.currencyPrice;
  }

  _renderSmallOrderBook() {
    return (
      <View
        style={styles.screenVertical}>
        <View style={CommonStyles.matchParent}>
          {reverse([].concat(this.state.sellOrderBook)).map((item, index) => {
            return this._renderSellRowVertical(item, index);
          })}
        </View>

        <View style={CommonStyles.matchParent}>
          {this.state.buyOrderBook.map((item, index) => {
            return this._renderBuyRowVertical(item, index);
          })}
        </View>
      </View>
    )
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
}

const fontSize = PixelRatio.getFontScale() * 10;
const borderColor = '#DCDCDC';
const borderWidth = 1;
const sellCellBorder = {
  borderTopWidth: borderWidth,
  borderLeftWidth: borderWidth,
  borderColor: borderColor
};
const cellText = {
  fontSize: fontSize,
  marginLeft: 5,
  marginRight: 5
};

const styles = ScaledSheet.create({
  screenFull: {
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
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#616161'
  },

  orderBookHeader: {
    flexDirection: 'row',
    backgroundColor: '#E1E0E1',
    height: '25@s',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#F2E5E5'
  },
  userQuantityHeader: {
    flex: 0.9,
    justifyContent: 'center',
    borderLeftWidth: borderWidth,
    borderColor: borderColor
  },
  quantityHeader: {
    flex: 0.8,
    justifyContent: 'center',
    borderLeftWidth: borderWidth,
    borderColor: borderColor
  },
  priceHeader: {
    flex: 1,
    justifyContent: 'center',
    borderLeftWidth: borderWidth,
    borderColor: borderColor
  },
  headerText: {
    textAlign: 'center'
  },

  userSellQuantityCell: {
    flex: 0.9,
    justifyContent: 'center',
    backgroundColor: '#F0F6FB'
  },
  userSellQuantityText: {
    ...cellText,
    textAlign: 'right'
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
    color: '#000'
  },
  priceCell: {
    flex: 1,
    justifyContent: 'center'
  },
  priceText: {
    ...cellText,
    textAlign: 'center'
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
  topBorder: {
    borderTopWidth: borderWidth,
    borderLeftWidth: borderWidth,
    borderColor: borderColor
  },
  bottomBorder: {
    borderBottomWidth: borderWidth,
    borderLeftWidth: borderWidth,
    borderColor: borderColor
  },

  buyPrice: {
    flex: 1,
    textAlign: 'right',
    color: CommonColors.increased,
    fontSize: fontSize
  },
  buyQuantity: {
    color: CommonColors.mainText,
    fontSize: fontSize
  },
  buyPercent: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#21281A'
  },

  buyPriceVertical: {
    color: CommonColors.increased,
    fontSize: fontSize
  },
  buyQuantityVertical: {
    flex: 1,
    color: CommonColors.mainText,
    fontSize: fontSize,
    textAlign: 'right',
  },
  buyPercentVertical: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#21281A'
  },

  sellPrice: {
    color: CommonColors.decreased,
    fontSize: fontSize
  },
  sellQuantity: {
    flex: 1,
    textAlign: 'right',
    color: CommonColors.mainText,
    fontSize: fontSize
  },

  sellPercentVertical: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#311B2A'
  }
});