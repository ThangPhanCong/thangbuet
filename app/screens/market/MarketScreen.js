import React from 'react';
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import BaseScreen from '../BaseScreen';
import { connect } from 'react-redux';
import ActionType from '../../redux/ActionType';
import Consts from '../../utils/Consts';
import { CommonColors, CommonStyles } from '../../utils/CommonStyles';
import { getCurrencyName, formatCurrency, formatPercent } from "../../utils/Filters";
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import I18n from '../../i18n/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Utils from '../../utils/Utils';

class MarketScreen extends BaseScreen {
  static defaultProps = {
    stats: {
      currency: Consts.CURRENCY_KRW,
      sortField: Consts.SORT_MARKET_FIELDS.VOLUME,
      sortDirection: Consts.SORT_DIRECTION.DESC,
      symbols: [],
      prices: {},
      favorites: {}
    }
  }

  constructor(props) {
    super(props);

    const { sortField, sortDirection } = this.props.navigation.state.params || {};
    
    this.props.stats.currency = Consts.CURRENCY_KRW;
    this.props.stats.sortField = sortField || Consts.SORT_MARKET_FIELDS.VOLUME;
    this.props.stats.sortDirection = sortDirection || Consts.SORT_DIRECTION.DESC;
  }

  componentWillMount() {
    super.componentWillMount();
    this.props.getList(this.props.stats.currency);
  }

  componentDidUpdate(previousProps) {
    if (this.props.isFocused && !previousProps.isFocused) {
      let { sortField, sortDirection } = this.props.navigation.state.params || {};
      if (!sortDirection) {
        sortDirection = Consts.SORT_DIRECTION.DESC;
      }
      if (sortField) {
        if (sortField != this.props.stats.sortField || sortDirection != this.props.stats.sortDirection) {
          this._changeSortField(sortField, sortDirection);
        }
      }
    }
  }

  render() {
    return (
      <View style={styles.screen}>
        {this._renderHeader()}
        <FlatList
          style={styles.listView}
          data={this.props.stats.symbols}
          extraData={this.props.stats}
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
            <View>
              <Icon name='star'
                size={10}
                color={item.isFavorite ? 'yellow' : 'grey'}/>
            </View>
            <Text style={styles.itemCoin}>{getCurrencyName(item.coin)}</Text>
            <Text style={styles.itemCurrency}>{'/' + getCurrencyName(item.currency)}</Text>
          </View>
          <Text style={styles.secondaryText}>
            {I18n.t('markets.vol') + ' ' + formatCurrency(item.volume, item.currency)}
          </Text>
        </View>

        <View style={styles.priceGroup}>
          <Text style={{ color: '#FFF' }}>
            {formatCurrency(item.price, item.currency)}
          </Text>
          <Text style={styles.itemCurrency}>
            {formatCurrency(this._getFiatPrice(item), Consts.CURRENCY_KRW)}
          </Text>
        </View>

        <View style={styles.changeGroup}>
          <View
            style={[styles.changeSubGroup, item.change >= 0 ? styles.increasedChange : styles.decreasedChange]}>
            <Text style={styles.changedText}>
              {item.change >= 0 ? '+' + formatPercent(item.change) : '-' + formatPercent(item.change)}
            </Text>
          </View>
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
    let { sortField, sortDirection } = this.props.stats;
    return (
      <View style={styles.tabBar}>
        <TouchableWithoutFeedback onPress={() => this._onSortPair()}>
          <Text style={sortField == Consts.SORT_MARKET_FIELDS.SYMBOL ? styles.activeHeader : styles.normalHeader}>
            코인
            {sortField == Consts.SORT_MARKET_FIELDS.VOLUME || sortField != Consts.SORT_MARKET_FIELDS.SYMBOL ?
              <Text>/ </Text> : null}
            {sortField == Consts.SORT_MARKET_FIELDS.SYMBOL && this._renderArrow(sortDirection)}
          </Text>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortLastPrice()}>
          <View style={{ flex: 3 }}>
            <Text style={sortField == Consts.SORT_MARKET_FIELDS.PRICE ? styles.activeHeader : styles.normalHeader}>
              현재가
              {sortField == Consts.SORT_MARKET_FIELDS.PRICE && this._renderArrow(sortDirection)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortChangePercent()}>
          <View style={{ flex: 2 }}>
            <Text style={sortField == Consts.SORT_MARKET_FIELDS.CHANGE ? styles.activeHeader : styles.normalHeader}>
              전일대비
              {sortField == Consts.SORT_MARKET_FIELDS.CHANGE && this._renderArrow(sortDirection)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortVolume()}>
          <View style={{ flex: 2 }}>
            <Text style={sortField == Consts.SORT_MARKET_FIELDS.VOLUME ? styles.activeHeader : styles.normalHeader}>
              거래대금
              {sortField == Consts.SORT_MARKET_FIELDS.VOLUME && this._renderArrow(sortDirection)}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _renderArrow(direction) {
    return (
      direction == Consts.SORT_DIRECTION.ASC ?
        <Image
          resizeMode={'contain'}
          style={styles.iconSort}
          source={require('../../../assets/common/2x/sortUp.png')}
        /> : <Image
          resizeMode={'contain'}
          style={styles.iconSort}
          source={require('../../../assets/common/2x/sortDown.png')}
        />
    )
  }

  _onSortPair() {
    let { sortField, sortDirection } = this.props.stats;

    if (sortField != Consts.SORT_MARKET_FIELDS.SYMBOL) {
      sortField = Consts.SORT_MARKET_FIELDS.SYMBOL;
      sortDirection = Consts.SORT_DIRECTION.DESC;
    } else {
      sortField = Consts.SORT_MARKET_FIELDS.VOLUME;
      sortDirection = Consts.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortLastPrice() {
    let { sortField, sortDirection } = this.props.stats;

    if (sortField == Consts.SORT_MARKET_FIELDS.PRICE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = Consts.SORT_MARKET_FIELDS.PRICE;
      sortDirection = Consts.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortChangePercent() {
    let { sortField, sortDirection } = this.props.stats;

    if (sortField == Consts.SORT_MARKET_FIELDS.CHANGE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = Consts.SORT_MARKET_FIELDS.CHANGE;
      sortDirection = Consts.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortVolume() {
    let { sortField, sortDirection } = this.props.stats;

    if (sortField == Consts.SORT_MARKET_FIELDS.VOLUME) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = Consts.SORT_MARKET_FIELDS.VOLUME;
      sortDirection = Consts.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onPressItem(item) {
    // this.navigate('MarketDetailScreen', item);
  }

  _revertSortDirection(direction) {
    if (direction == Consts.SORT_DIRECTION.ASC) {
      return Consts.SORT_DIRECTION.DESC;
    } else {
      return Consts.SORT_DIRECTION.ASC;
    }
  }

  isFavorite(symbol, favorites) {
    return favorites[`${symbol.coin}/${symbol.currency}`];
  }

  _getFiatPrice(item) {
    if (item.currency == Consts.CURRENCY_KRW) {
      return item.price;
    } else {
      return item.price * this._getPrice(Consts.CURRENCY_KRW, item.currency);
    }
  }

  _getPrice(currency, coin) {
    let key = Utils.getPriceKey(currency, coin);
    const priceObject = this.props.stats.prices[key];
    return priceObject ? priceObject.price : 1;
  }

  _changeSortField(sortField, sortDirection) {
    let symbols = this.props.stats.symbols;
    this.props.sortList(this.props.stats.currency, symbols, sortField, sortDirection);
  }
}

function mapStateToProps(state) {
  return {
    stats: state.marketReducer
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getList: (currency) => dispatch({
      currency,
      type: ActionType.GET_MARKET_LIST,
      sortField: Consts.SORT_MARKET_FIELDS.VOLUME,
      sortDirection: Consts.SORT_DIRECTION.DESC
    }),
    sortList: (currency, symbols, sortField, sortDirection) => dispatch({
      type: ActionType.SORT_SYMBOL_LIST,
      currency,
      symbols,
      sortField,
      sortDirection
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MarketScreen);

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  listView: {
    flex: 1,
    paddingLeft: "18@s",
    paddingRight: "18@s"
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#10121e',
    height: "66@s",
    alignItems: 'center'
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#555555'
  },

  nameGroup: {
    flex: 3,
  },
  itemCoin: {
    color: '#FFFFFF'
  },
  itemCurrency: {
    color: '#7b808d',
    fontSize: '11@s',
    paddingTop: "2.2@s"
  },
  secondaryText: {
    color: CommonColors.secondaryText
  },

  priceGroup: {
    flex: 3,
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
    paddingRight: "10@s",
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
    color: CommonColors.secondaryText
  },
  activeHeader: {
    color: CommonColors.activeTintColor
  },
  percentTab: {
    color: '#656b7c',
    textAlign: 'right'
  },
  volTab: {
    color: '#656b7c'
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: "36@s",
    backgroundColor: CommonColors.listItemBgColor,
    paddingLeft: "18@s",
    paddingRight: "18@s",
  },
  iconSort: {
    height: "25@s",
    width: "14@s",
  }
});