import React from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import BaseScreen from '../BaseScreen';
import Consts from '../../utils/Consts';
import { CommonColors, CommonStyles } from '../../utils/CommonStyles';
import { getCurrencyName, formatCurrency, formatPercent } from "../../utils/Filters";
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import rf from '../../libs/RequestFactory';
import _ from 'lodash';
import Utils from '../../utils/Utils';

class MarketScreen extends BaseScreen {
  static SORT_FIELDS = {
    SYMBOL: 'symbol',
    VOLUME: 'volume',
    PRICE: 'price',
    CHANGE: 'change'
  };

  static SORT_DIRECTION = {
    ASC: 'asc',
    DESC: 'desc'
  };

  constructor(props) {
    super(props);

    const { sortField, sortDirection } = this.props.navigation.state.params || {};
    this.state = {
      sortField: sortField || MarketScreen.SORT_FIELDS.VOLUME,
      sortDirection: sortDirection || MarketScreen.SORT_DIRECTION.DESC,
      symbols: [],
      prices: {},
      favorites: {}
    };
  }

  componentDidUpdate(previousProps) {
    if (this.props.isFocused && !previousProps.isFocused) {
      let { sortField, sortDirection } = this.props.navigation.state.params || {};
      if (!sortDirection) {
        sortDirection = MarketScreen.SORT_DIRECTION.DESC;
      }
      if (sortField) {
        if (sortField != this.state.sortField || sortDirection != this.state.sortDirection) {
          this._changeSortField(sortField, sortDirection);
        }
      }
    }
  }

  componentWillMount() {
    super.componentWillMount();
    this._loadData();
  }

  render() {
    return (
      <View style={styles.screen}>
        {this._renderHeader()}
        <FlatList
          style={styles.listView}
          data={this.state.symbols}
          extraData={this.state}
          renderItem={this._renderItem.bind(this)}
          ItemSeparatorComponent={this._renderSeparator}
        />
      </View>
    )
  }

  _renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => this._onPressItem(item)}>

        <View style={styles.nameGroup}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style = {{ alignItems: 'center', justifyContent: 'center' }}
              onPress = {() => this._onEnableFavorite(item)}>
              <Icon
                name='star'
                size={15}
                color={item.isFavorite ? '#FFC000' : '#D9D9D9'} />
            </TouchableOpacity>
            <View style={styles.spacePairName} />
            <View style={{ alignSelf: 'center' }}>
              <Text style={styles.itemCoin}>
                {getCurrencyName(item.coin) + '/' + getCurrencyName(item.currency)}
              </Text>
              <Text style={styles.itemCoin}>
                {getCurrencyName(item.coin) + '/' + getCurrencyName(item.currency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.priceGroup}>
          <Text style={this._applyTextColorByChange(item.change)}>
            {formatCurrency(item.price, item.currency, 0)}
          </Text>
        </View>

        <View style={styles.changeGroup}>
          <Text style={this._applyTextColorByChange(item.change)}>
            {this._toPercentChangeString(item.change)}
          </Text>
        </View>

        <View style={styles.volumeGroup}>
          <Text style={{ color: '#000' }}>
            {formatCurrency(item.volume, Consts.CURRENCY_KRW, 0) + '백만'}
          </Text>
        </View>

      </TouchableOpacity>
    );
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View key="rowID" style={styles.separator}/>
    );
  }

  _renderHeader() {
    return (
      <View style={styles.tabBar}>
        <TouchableWithoutFeedback onPress={() => this._onSortPair()}>
          <View style={{ flex: 3, alignItems: 'center' }}>
            <Text style={styles.normalHeader}>
              코인
              {this._renderArrow(Consts.SORT_MARKET_FIELDS.SYMBOL)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortLastPrice()}>
          <View style={{ flex: 3, alignItems: 'flex-end' }}>
            <Text style={styles.normalHeader}>
              현재가
              {this._renderArrow(Consts.SORT_MARKET_FIELDS.PRICE)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortChangePercent()}>
          <View style={{ flex: 2, alignItems: 'flex-end' }}>
            <Text style={styles.normalHeader}>
              전일대비
              {this._renderArrow(Consts.SORT_MARKET_FIELDS.CHANGE)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortVolume()}>
          <View style={{ flex: 3, alignItems: 'flex-end' }}>
            <Text style={styles.normalHeader}>
              거래대금
              {this._renderArrow(Consts.SORT_MARKET_FIELDS.VOLUME)}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _renderArrow(field) {
    let {sortField, sortDirection } = this.state;
    return (
      sortField === field && sortDirection === Consts.SORT_DIRECTION.ASC ?
      <Icon
        name='menu-up'
        size={20}
        color= '#000'/> :
      <Icon
        name='menu-down'
        size={20}
        color= '#000'/>
    )
  }

  _onPressItem(item) {
    // this.navigate('MarketDetailScreen', item);
  }

  async _onEnableFavorite(item) {
    let currentFavorite = item.isFavorite;
    let favorites = this.state.favorites;
    item.isFavorite = !item.isFavorite;
    favorites[item.key] = item.isFavorite;
    this.setState({
      favorites
    })

    try {
      if (currentFavorite) {
        await rf.getRequest('FavoriteRequest').createFavoriteCoinPair(item.key);
      }
      else {
        await rf.getRequest('FavoriteRequest').createFavoriteCoinPair(item.key);
      }
    }
    catch (err) {
      item.isFavorite = !item.isFavorite;
      favorites[item.key] = item.isFavorite;
      this.setState({
        favorites
      })
      console.log('MarketScreen._onEnableFavorite', err);
    }
  }

  _onSortPair() {
    let { sortField, sortDirection, symbols } = this.state;

    if (sortField != MarketScreen.SORT_FIELDS.SYMBOL) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = MarketScreen.SORT_FIELDS.SYMBOL;
      sortDirection = MarketScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortLastPrice() {
    let { sortField, sortDirection } = this.state;

    if (sortField == MarketScreen.SORT_FIELDS.PRICE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = MarketScreen.SORT_FIELDS.PRICE;
      sortDirection = MarketScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortChangePercent() {
    let { sortField, sortDirection } = this.state;

    if (sortField == MarketScreen.SORT_FIELDS.CHANGE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = MarketScreen.SORT_FIELDS.CHANGE;
      sortDirection = MarketScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortVolume() {
    let { sortField, sortDirection } = this.state;

    if (sortField == MarketScreen.SORT_FIELDS.VOLUME) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = MarketScreen.SORT_FIELDS.VOLUME;
      sortDirection = MarketScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  async _loadData() {
    const data = await Promise.all([
      this._getSymbols(),
      this._getPrices(),
      this._getFavorites()
    ]);

    let symbols = data[0];
    let prices = data[1];
    let favorites = data[2]

    this.setState(this._updateSymbolsData(symbols, prices, favorites));
  }

  async _getSymbols() {
    try {
      let symbolResponse = await rf.getRequest('MasterdataRequest').getAll();
      let symbols = _.filter(symbolResponse.coin_settings, ['currency', this.props.currency]);
      symbols.map(symbol => {
        symbol.key = symbol.currency + '_' + symbol.coin;
        return symbol;
      });

      return symbols;
    } catch (err) {
      console.log('MarketScreen._getSymbols', err);
    }
  }

  async _getPrices() {
    try {
      let priceResponse = await rf.getRequest('PriceRequest').getPrices();
      return priceResponse.data;
    } catch (err) {
      console.log('MarketScreen._getPrices', err);
    }
  }

  async _getFavorites() {
    try {
      let response = await rf.getRequest('FavoriteRequest').getList();
      return this._getFavoritesMap(response.data);
    } catch (err) {
      console.log('MarketScreen._getFavorites', err);
    }
  }

  _revertSortDirection(direction) {
    if (direction == Consts.SORT_DIRECTION.ASC) {
      return Consts.SORT_DIRECTION.DESC;
    } else {
      return Consts.SORT_DIRECTION.ASC;
    }
  }

  _changeSortField(sortField, sortDirection) {
    let symbols = this.props.symbols;
    this.props.sortList(symbols, sortField, sortDirection);
  }

  _applyTextColorByChange(number) {
    if (number > 0)
      return styles.positiveText;
    else if (number < 0)
      return styles.negativeText;
    else
      return styles.normalText
  }

  _toPercentChangeString(number) {
    let percentString = formatPercent(number);
    if (number > 0)
      return '+' + percentString;
    else
      return percentString;
  }

  _getFavoritesMap(data) {
    let favorites = {};
    for (item of data) {
      favorites[item.coin_pair] = true;
    }
    return favorites;
  }

  getSocketEventHandlers() {
    return {
      PricesUpdated: (prices) => {
        const { symbols, favorites } = this.state;
        const state = this._updateSymbolsData(symbols, prices, favorites);
        this.setState(state);
      },
      FavoriteSymbolsUpdated: (data) => {
        const { symbols, prices } = this.state;
        const favorites = this._getFavoritesMap(data);
        const state = this._updateSymbolsData(symbols, prices, favorites);
        this.setState(state);
      }
    };
  }

  _updateSymbolsData(symbols, prices, favorites) {
    if (!symbols || !favorites) {
      return;
    }

    prices = Object.assign({}, this.state.prices, prices);
    let { sortField, sortDirection } = this.state;

    for (let symbolKey in prices) {
      let [currency, coin] = symbolKey.split('_');
      this._updateSymbolData(symbols, currency, coin, prices[symbolKey]);
    }

    let currencyPrice = undefined;
    if (this.props.currency != Consts.CURRENCY_VND) {
      let key = Utils.getPriceKey(Consts.CURRENCY_VND, this.props.currency);
      if (prices[key]) {
        currencyPrice = prices[key].price
      }
    }

    let result = {
      prices,
      symbols: this._sortSymbols(symbols, sortField, sortDirection)
    };
    if (currencyPrice) {
      result['currencyPrice'] = currencyPrice;
    }
    return result;
  }

  _updateSymbolData(symbols, currency, coin, data) {
    let index = symbols.findIndex((item) => {
      return item.currency == currency && item.coin == coin;
    });
    if (index >= 0) {
      Object.assign(symbols[index], data);
    }
  }

  _revertSortDirection(direction) {
    if (direction == MarketScreen.SORT_DIRECTION.ASC) {
      return MarketScreen.SORT_DIRECTION.DESC;
    } else {
      return MarketScreen.SORT_DIRECTION.ASC;
    }
  }

  _changeSortField(sortField, sortDirection) {
    const symbols = this.state.symbols;
    this.setState({
      sortField,
      sortDirection,
      symbols: this._sortSymbols(symbols, sortField, sortDirection)
    });
  }

  _sortSymbols(symbols, sortField, sortDirection) {
    if (sortField != MarketScreen.SORT_FIELDS.SYMBOL) {
      return _.orderBy(symbols, (item) => parseFloat(item[sortField]), sortDirection);
    } else {
      const revertedDirection = this._revertSortDirection(sortDirection);
      return _.orderBy(symbols, ['coin', 'currency'], [revertedDirection, revertedDirection]);
    }
  }
}

export default MarketScreen;

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  listView: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    height: "58@s",
    alignItems: 'center',
    paddingLeft: "10@s",
    paddingRight: "10@s"
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#DEE3EB'
  },
  nameGroup: {
    flex: 3
  },
  spacePairName: {
    width: '3@s'
  },
  itemCoin: {
    color: '#000'
  },
  secondaryText: {
    color: CommonColors.secondaryText
  },
  priceGroup: {
    flex: 3,
    alignItems: 'flex-end',
  },
  increasedPrice: {
    color: '#3ea954'
  },
  decreasedPrice: {
    color: '#e0533c'
  },
  changeGroup: {
    flex: 2,
    alignItems: 'flex-end',
  },
  volumeGroup: {
    flex: 3,
    alignItems: 'flex-end'
  },
  changeSubGroup: {
    width: "72@s",
    height: "30@s",
    borderRadius: "1@s",
    justifyContent: 'center',
    alignItems: 'center'
  },
  increasedChange: {
    backgroundColor: '#3ea954',
  },
  decreasedChange: {
    backgroundColor: '#e0533c',
  },
  changedText: {
    color: '#FFFFFF'
  },
  itemSort: {
    flex: 1,
  },
  normalHeader: {
    color: '#000'
  },
  volTab: {
    color: '#656b7c'
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: "36@s",
    backgroundColor: '#F8F9FB',
    paddingLeft: "10@s",
    paddingRight: "10@s",
  },
  iconSort: {
    height: "25@s",
    width: "14@s",
  },
  negativeText: {
    color: '#0070C0'
  },
  positiveText: {
    color: '#FF0000'
  },
  normalText: {
    color: '#000'
  }
});