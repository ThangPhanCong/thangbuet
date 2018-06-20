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

  static defaultProps = {
    stats: {
      sortField: MarketScreen.SORT_FIELDS.VOLUME,
      sortDirection: MarketScreen.SORT_DIRECTION.DESC,
      symbols: [],
      prices: {},
      favorites: {}
    }
  }

  constructor(props) {
    super(props);

    const { sortField, sortDirection } = this.props.navigation.state.params || {};
    
    this.props.stats.sortField = sortField || MarketScreen.SORT_FIELDS.VOLUME;
    this.props.stats.sortDirection = sortDirection || MarketScreen.SORT_DIRECTION.DESC;
  }

  componentWillMount() {
    super.componentWillMount();
    this.props.getList();
  }

  componentDidUpdate(previousProps) {
    if (this.props.isFocused && !previousProps.isFocused) {
      let { sortField, sortDirection } = this.props.navigation.state.params || {};
      if (!sortDirection) {
        sortDirection = MarketScreen.SORT_DIRECTION.DESC;
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
              {item.isFavorite && <Icon name='star'
                size={10}
                color={"yellow"}/>}
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
          <View style={[styles.itemSort, { flexDirection: 'row', flex: 3 }]}>
            <Text style={sortField == MarketScreen.SORT_FIELDS.SYMBOL ? styles.activeHeader : styles.normalHeader}>
              {I18n.t('markets.pairTab')}
              {sortField == MarketScreen.SORT_FIELDS.VOLUME || sortField != MarketScreen.SORT_FIELDS.SYMBOL ?
                <Text>/ </Text> : null}
              {sortField == MarketScreen.SORT_FIELDS.SYMBOL && this._renderArrow(sortDirection)}
            </Text>

            <Text style={sortField == MarketScreen.SORT_FIELDS.VOLUME ? styles.activeHeader : styles.normalHeader}>
              {sortField == MarketScreen.SORT_FIELDS.SYMBOL ? <Text> /</Text> : null}
              {I18n.t('markets.volTab')}
              {sortField == MarketScreen.SORT_FIELDS.VOLUME && this._renderArrow(sortDirection)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortLastPrice()}>
          <View style={{ flex: 3 }}>
            <Text style={sortField == MarketScreen.SORT_FIELDS.PRICE ? styles.activeHeader : styles.normalHeader}>
              {I18n.t('markets.lastPriceTab')}
              {sortField == MarketScreen.SORT_FIELDS.PRICE && this._renderArrow(sortDirection)}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={() => this._onSortChangePercent()}>
          <View style={{ flex: 2 }}>
            <Text style={sortField == MarketScreen.SORT_FIELDS.CHANGE ? styles.activeHeader : styles.normalHeader}>
              {I18n.t('markets.percentTab')}
              {sortField == MarketScreen.SORT_FIELDS.CHANGE && this._renderArrow(sortDirection)}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _renderArrow(direction) {
    return (
      direction == MarketScreen.SORT_DIRECTION.ASC ?
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

  _onSortLastPrice() {
    let { sortField, sortDirection } = this.props.stats;

    if (sortField == MarketScreen.SORT_FIELDS.PRICE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = MarketScreen.SORT_FIELDS.PRICE;
      sortDirection = MarketScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortChangePercent() {
    let { sortField, sortDirection } = this.props.stats;

    if (sortField == MarketScreen.SORT_FIELDS.CHANGE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = MarketScreen.SORT_FIELDS.CHANGE;
      sortDirection = MarketScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _revertSortDirection(direction) {
    if (direction == MarketScreen.SORT_DIRECTION.ASC) {
      return MarketScreen.SORT_DIRECTION.DESC;
    } else {
      return MarketScreen.SORT_DIRECTION.ASC;
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

  _onPressItem(item) {
    // this.navigate('MarketDetailScreen', item);
  }

  _changeSortField(sortField, sortDirection) {
    let symbols = this.props.stats.symbols;
    this.props.sortList(symbols, sortField, sortDirection);
  }
}

function mapStateToProps(state) {
  return {
    stats: state.marketReducer
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getList: () => dispatch({
      type: ActionType.GET_COIN_LIST,
      sortField: MarketScreen.SORT_FIELDS.VOLUME,
      sortDirection: MarketScreen.SORT_DIRECTION.DESC
    }),
    sortList: (symbols, sortField, sortDirection) => dispatch({
      type: ActionType.SORT_COIN_LIST,
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