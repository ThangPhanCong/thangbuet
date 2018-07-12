import React from 'react';
import {
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import BaseScreen from '../BaseScreen';
import Consts from '../../utils/Consts';
import { CommonColors, CommonStyles } from '../../utils/CommonStyles';
import { getCurrencyName, formatCurrency, formatPercent } from "../../utils/Filters";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import rf from '../../libs/RequestFactory';
import _ from 'lodash';
import I18n from '../../i18n/i18n';

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

  _symbols = [];
  _prices = {};
  _favorites = [];
  _isFavoriteFilter = false;

  constructor(props) {
    super(props);

    const { sortField, sortDirection } = this.props.navigation.state.params || {};
    this.state = {
      sortField: sortField || MarketScreen.SORT_FIELDS.VOLUME,
      sortDirection: sortDirection || MarketScreen.SORT_DIRECTION.DESC,
      symbols: []
    };
  }

  setFavoriteFilter(isFilter) {
    this._isFavoriteFilter = isFilter;
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
      <TouchableHighlight
        style={styles.listItem}
        onPress={() => this._onPressItem(item)}
        underlayColor='#FFECED'>
        <View style = {styles.listItemContainer}>
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
                  {I18n.t(`currency.${item.coin}.fullname`) || getCurrencyName(item.coin)}
                </Text>
                <Text style={styles.itemCoin}>
                  {getCurrencyName(item.coin) + ' / ' + getCurrencyName(item.currency)}
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
              {formatCurrency(item.volume, Consts.CURRENCY_KRW, 0) + I18n.t('marketList.unit')}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
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
        <TouchableWithoutFeedback onPress={() => this._onSortField(MarketScreen.SORT_FIELDS.SYMBOL)}>
          <View style={{ flex: 3, alignItems: 'center' }}>
            <Text style={styles.normalHeader}>
              {I18n.t('marketList.symbol')}
              {this._renderArrow(MarketScreen.SORT_FIELDS.SYMBOL)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortField(MarketScreen.SORT_FIELDS.PRICE)}>
          <View style={{ flex: 3, alignItems: 'flex-end' }}>
            <Text style={styles.normalHeader}>
              {I18n.t('marketList.price')}
              {this._renderArrow(MarketScreen.SORT_FIELDS.PRICE)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortField(MarketScreen.SORT_FIELDS.CHANGE)}>
          <View style={{ flex: 2, alignItems: 'flex-end' }}>
            <Text style={styles.normalHeader}>
              {I18n.t('marketList.change')}
              {this._renderArrow(MarketScreen.SORT_FIELDS.CHANGE)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortField(MarketScreen.SORT_FIELDS.VOLUME)}>
          <View style={{ flex: 3, alignItems: 'flex-end' }}>
            <Text style={styles.normalHeader}>
              {I18n.t('marketList.volume')}
              {this._renderArrow(MarketScreen.SORT_FIELDS.VOLUME)}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _renderArrow(field) {
    let {sortField, sortDirection } = this.state;
    return (
      sortField === field && sortDirection === MarketScreen.SORT_DIRECTION.ASC ?
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
    this.props.showMarketScreenDetail(item);
  }

  filterFavoriteChanged(value) {
    if (this._isFavoriteFilter === value)
      return;

    this._isFavoriteFilter = value;
    let favoriteKeys = _.map(this._favorites, 'coin_pair');
    let filterSymbols;
    if (this._isFavoriteFilter)
      filterSymbols = _.filter(this._symbols, s => _.includes(favoriteKeys, s.favoriteKey));
    else
      filterSymbols = this._symbols;

    this.setState({symbols: filterSymbols})
  }

  async _onEnableFavorite(item) {
    let currentFavorite = item.isFavorite;
    let favorite = _.find(this._favorites, item => item.coin_pair === item.favoriteKey)

    try {
      if (currentFavorite) {
        await rf.getRequest('FavoriteRequest').removeOne(favorite.id);
      }
      else {
        await rf.getRequest('FavoriteRequest').createANewOne({coinPair: item.favoriteKey});
      }
    }
    catch (err) {
      console.log('MarketScreen._onEnableFavorite', err);
    }
  }

  _onSortField(field) {
    let { sortField, sortDirection } = this.state;

    if (sortField === field) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = field;
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
        symbol.favoriteKey = symbol.coin + '/' + symbol.currency;
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
      return response.data;
    } catch (err) {
      console.log('MarketScreen._getFavorites', err);
    }
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

  getSocketEventHandlers() {
    return {
      PricesUpdated: (prices) => {
        const { symbols, favorites } = this.state;
        const state = this._updateSymbolsData(symbols, prices, favorites);
        this.setState(state);
      },
      FavoriteSymbolsUpdated: (data) => {
        const { symbols, prices } = this.state;
        const favorites = data;
        const state = this._updateSymbolsData(symbols, prices, favorites);
        this.setState(state);
      }
    };
  }

  _updateSymbolsData(symbols, prices, favorites) {
    if (!symbols || !favorites) {
      return;
    }

    this._favorites = favorites;
    this._prices = Object.assign({}, this._prices, prices);
    let { sortField, sortDirection } = this.state;

    for (let symbolKey in prices) {
      let [currency, coin] = symbolKey.split('_');
      this._updateSymbolData(symbols, currency, coin, prices[symbolKey]);
    }

    let favoriteKeys = _.map(favorites, 'coin_pair');
    symbols = _.map(symbols, s => {
      s.isFavorite = _.includes(favoriteKeys, s.favoriteKey);
      return s;
    });
    
    this._symbols = symbols;
    symbols = this._sortSymbols(sortField, sortDirection);
    this._symbols = symbols;

    let filterSymbols;
    if (this._isFavoriteFilter)
      filterSymbols = _.filter(symbols, s => s.isFavorite);
    else
      filterSymbols = symbols;
    
    let result = {
      symbols: filterSymbols
    };
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
    this._symbols = this._sortSymbols(sortField, sortDirection);
    let favoriteKeys = _.map(this._favorites, 'coin_pair');
    let filterSymbols;
    if (this._isFavoriteFilter)
      filterSymbols = _.filter(this._symbols, s => _.includes(favoriteKeys, s.favoriteKey));
    else
      filterSymbols = this._symbols;

    this.setState({
      sortField,
      sortDirection,
      symbols: filterSymbols
    });
  }

  _sortSymbols(sortField, sortDirection) {
    if (sortField != MarketScreen.SORT_FIELDS.SYMBOL) {
      return _.orderBy(this._symbols, (item) => parseFloat(item[sortField]), sortDirection);
    } else {
      const revertedDirection = this._revertSortDirection(sortDirection);
      return _.orderBy(this._symbols, ['coin', 'currency'], [revertedDirection, revertedDirection]);
    }
  }
}

export default MarketScreen;

const styles = StyleSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  listView: {
    flex: 1,
  },
  listItem: {
    height: 64
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#DEE3EB',
    opacity: 0.3
  },
  nameGroup: {
    flex: 3
  },
  spacePairName: {
    width: 3
  },
  itemCoin: {
    fontSize: 13,
    color: '#000'
  },
  priceGroup: {
    flex: 3,
    alignItems: 'flex-end',
  },
  changeGroup: {
    flex: 2,
    alignItems: 'flex-end',
  },
  volumeGroup: {
    flex: 3,
    alignItems: 'flex-end'
  },
  increasedChange: {
    backgroundColor: '#3ea954',
  },
  decreasedChange: {
    backgroundColor: '#e0533c',
  },
  normalHeader: {
    fontSize: 13,
    color: '#000'
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    backgroundColor: '#F8F9FB',
    paddingLeft: 10,
    paddingRight: 10,
  },
  iconSort: {
    height: 25,
    width: 14,
  },
  negativeText: {
    fontSize: 13,
    color: '#0070C0'
  },
  positiveText: {
    fontSize: 13,
    color: '#FF0000'
  },
  normalText: {
    fontSize: 13,
    color: '#000'
  }
});