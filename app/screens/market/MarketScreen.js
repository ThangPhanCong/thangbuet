import React from 'react';
import {
  Image,
  FlatList,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  Keyboard
} from 'react-native';
import BaseScreen from '../BaseScreen';
import Consts from '../../utils/Consts';
import { CommonColors, CommonStyles, Fonts } from '../../utils/CommonStyles';
import { getCurrencyName, formatCurrency, formatPercent } from "../../utils/Filters";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import rf from '../../libs/RequestFactory';
import { filter, map, find, includes, orderBy, remove } from 'lodash';
import I18n from '../../i18n/i18n';
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";

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
      symbols: [],
      isLoading: false
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
          keyboardDismissMode='interactive'
          keyboardShouldPersistTaps='handled'
          style={styles.listView}
          data={this.state.symbols}
          extraData={this.state}
          renderItem={this._renderItem.bind(this)}
          onRefresh={this._loadData.bind(this)}
          refreshing={this.state.isLoading}
          ItemSeparatorComponent={this._renderSeparator}
        />
      </View>
    )
  }

  _renderItem({ item }) {
    return (
      <TouchableHighlight
        style={styles.listItem}
        onPressIn={() => this._onPressItem(item)}
        underlayColor='#FFECED'>
        <View style={styles.listItemContainer}>
          <View style={styles.nameGroup}>
            <TouchableOpacity style={styles.favoriteButton}
                              onPress={() => this._onEnableFavorite(item)}>
              <Icon
                name='star'
                size={scale(15)}
                color={item.isFavorite ? '#FFC000' : '#D9D9D9'}/>
            </TouchableOpacity>

            <View style={{ marginStart: -scale(3), flexDirection: 'column' }}>
              <Text style={styles.itemFirstCoin}>
                {I18n.t(`currency.${item.coin}.fullname`) || getCurrencyName(item.coin)}
                {"\n"}
                <Text style={styles.itemCoin}>
                  {getCurrencyName(item.coin) + ' / ' + getCurrencyName(item.currency)}
                </Text>
              </Text>
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
            <Text style={styles.itemVolume}>
              {formatCurrency(Math.round(item.volume / 1000000), Consts.CURRENCY_KRW, 0)}
              <Text style={styles.itemUnit}>{I18n.t('marketList.unit')}</Text>
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
          <View style={styles.symbolHeader}>
            <Text style={styles.normalHeader}>
              {I18n.t('marketList.symbol')}
            </Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              {this._renderArrow(MarketScreen.SORT_FIELDS.SYMBOL)}
            </View>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortField(MarketScreen.SORT_FIELDS.PRICE)}>
          <View style={styles.priceHeader}>
            <Text style={styles.normalHeader}>
              {I18n.t('marketList.price')}
            </Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              {this._renderArrow(MarketScreen.SORT_FIELDS.PRICE)}
            </View>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortField(MarketScreen.SORT_FIELDS.CHANGE)}>
          <View style={styles.changeHeader}>
            <Text style={styles.normalHeader}>
              {I18n.t('marketList.change')}
            </Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
            {this._renderArrow(MarketScreen.SORT_FIELDS.CHANGE)}
          </View>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortField(MarketScreen.SORT_FIELDS.VOLUME)}>
          <View style={styles.volumeHeader}>
            <Text style={styles.normalHeader}>
              {I18n.t('marketList.volume')}
            </Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
            {this._renderArrow(MarketScreen.SORT_FIELDS.VOLUME)}
          </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _renderArrow(field) {
    let { sortField, sortDirection } = this.state;
    return (
      sortField === field && sortDirection === MarketScreen.SORT_DIRECTION.ASC ?
        <Image
          style={styles.iconSort}
          source={require('../../../assets/sortAsc/asc.png')}/>
        :
        <Image
          style={styles.iconSort}
          source={require('../../../assets/sortDesc/desc.png')}/>
    )
  }

  _onPressItem(item) {
    Keyboard.dismiss();
    this.props.showMarketScreenDetail(item);
  }

  filterFavoriteChanged(value) {
    if (this._isFavoriteFilter === value)
      return;

    this._isFavoriteFilter = value;
    let favoriteKeys = map(this._favorites, 'coin_pair');
    let filterSymbols;
    if (this._isFavoriteFilter)
      filterSymbols = filter(this._symbols, s => includes(favoriteKeys, s.favoriteKey));
    else
      filterSymbols = this._symbols;

    this.setState({ symbols: filterSymbols })
  }

  async _onEnableFavorite(item) {
    let currentFavorite = item.isFavorite;
    let favorite = find(this._favorites, i => i.coin_pair === item.favoriteKey);

    try {
      if (currentFavorite) {
        await rf.getRequest('FavoriteRequest').removeOne(favorite.id);
        remove(this._favorites, i => i === favorite);
        this.setState(this._updateSymbolsData(this._symbols, this._prices, this._favorites))
      }
      else {
        let response = await rf.getRequest('FavoriteRequest').createANewOne({ coinPair: item.favoriteKey });
        this._favorites.push(response.data);
        this.setState(this._updateSymbolsData(this._symbols, this._prices, this._favorites))
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
    this.setState({
      isLoading: true
    })

    const data = await Promise.all([
      this._getSymbols(),
      this._getPrices(),
      this._getFavorites()
    ]);

    let symbols = data[0];
    let prices = data[1];
    let favorites = data[2]

    this.setState({
      ...this._updateSymbolsData(symbols, prices, favorites),
      isLoading: false
    });
  }

  async _getSymbols() {
    try {
      let symbolResponse = await rf.getRequest('MasterdataRequest').getAll();
      let symbols = filter(symbolResponse.coin_settings, ['currency', this.props.currency]);
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
      return [];
      console.log('MarketScreen._getFavorites', err.message );
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

    let favoriteKeys = map(favorites, 'coin_pair');
    symbols = map(symbols, s => {
      s.isFavorite = includes(favoriteKeys, s.favoriteKey);
      return s;
    });

    this._symbols = symbols;
    symbols = this._sortSymbols(sortField, sortDirection);
    this._symbols = symbols;

    let filterSymbols;
    if (this._isFavoriteFilter)
      filterSymbols = filter(symbols, s => s.isFavorite);
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
    let favoriteKeys = map(this._favorites, 'coin_pair');
    let filterSymbols;
    if (this._isFavoriteFilter)
      filterSymbols = filter(this._symbols, s => includes(favoriteKeys, s.favoriteKey));
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
      return orderBy(this._symbols, (item) => parseFloat(item[sortField]), sortDirection);
    } else {
      const revertedDirection = this._revertSortDirection(sortDirection);
      return orderBy(this._symbols, ['coin', 'currency'], [revertedDirection, revertedDirection]);
    }
  }
}

export default MarketScreen;

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  favoriteButton: {
    width: '30@s',
    height: '30@s',
    justifyContent: 'center',
    alignItems: 'center'
  },
  listView: {
    flex: 1,
  },
  listItem: {
    height: '50@s'
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: '10@s'
  },
  separator: {
    flex: 1,
    height: '0.5@s',
    backgroundColor: CommonColors.separator,
  },
  nameGroup: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemFirstCoin: {
    fontSize: '12@s',
    ...Fonts.NotoSans,
    color: '#000'
  },
  itemCoin: {
    fontSize: '10@s',
    ...Fonts.NotoSans,
    color: '#000'
  },
  priceGroup: {
    flex: 2,
    alignItems: 'flex-end',
  },
  changeGroup: {
    flex: 2,
    alignItems: 'flex-end',
  },
  volumeGroup: {
    flex: 3,
    alignItems: 'flex-end',
  },
  increasedChange: {
    backgroundColor: '#3ea954',
  },
  decreasedChange: {
    backgroundColor: '#e0533c',
  },
  normalHeader: {
    fontSize: '10@s',
    ...Fonts.NotoSans,
    color: '#000'
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '40@s',
    backgroundColor: '#F8F9FB',
    paddingLeft: '10@s',
    paddingRight: '10@s',
    borderColor: CommonColors.separator,
    borderBottomWidth: '1@s'
  },
  iconSort: {
    marginTop: '3@s',
    height: '16@s',
    width: '16@s',
  },
  negativeText: {
    fontSize: '12@s',
    ...Fonts.OpenSans,
    color: '#0070C0'
  },
  positiveText: {
    fontSize: '12@s',
    ...Fonts.OpenSans,
    color: '#FF0000'
  },
  normalText: {
    fontSize: '12@s',
    ...Fonts.OpenSans,
    color: '#000'
  },
  itemVolume: {
    color: '#000',
    fontSize: '12@s',
    ...Fonts.OpenSans,
  },
  itemUnit: {
    color: '#000',
    fontSize: '12@s',
    ...Fonts.NotoSans,
  },
  changeHeader: {
    flex: 2,
    justifyContent: 'flex-end',
    flexDirection: 'row'
  },
  symbolHeader: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  priceHeader: {
    flex: 2,
    justifyContent: 'flex-end',
    flexDirection: 'row'
  },
  volumeHeader: {
    flex: 3,
    justifyContent: 'flex-end',
    flexDirection: 'row'
  }
});