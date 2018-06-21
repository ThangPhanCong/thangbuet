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
  static defaultProps = {
    stats: {
      currency: Consts.CURRENCY_KRW,
      sortField: Consts.SORT_MARKET_FIELDS.VOLUME,
      sortDirection: Consts.SORT_DIRECTION.DESC,
      symbols: []
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
        <View style = {{height: 20}} />
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
            <View style = {{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon
                name='star'
                size={15}
                color={item.isFavorite ? 'yellow' : 'grey'}/>
            </View>
            <View styles={styles.coinPairNameContainer}>
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

  _renderArrow(field) {
    let {sortField, sortDirection } = this.props.stats;
    return (
      sortField === field && sortDirection === Consts.SORT_DIRECTION.ASC ?
      <Icon
        name='menu-down'
        size={20}
        color= '#000'/> :
      <Icon
        name='menu-up'
        size={20}
        color= '#000'/>
    )
  }

  _revertSortDirection(direction) {
    if (direction == Consts.SORT_DIRECTION.ASC) {
      return Consts.SORT_DIRECTION.DESC;
    } else {
      return Consts.SORT_DIRECTION.ASC;
    }
  }

  _changeSortField(sortField, sortDirection) {
    let symbols = this.props.stats.symbols;
    this.props.sortList(this.props.stats.currency, symbols, sortField, sortDirection);
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
    else if (number < 0)
      return '-' + percentString;
    else
      return percentString;
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
  coinPairNameContainer: {
    alignSelf: 'center',
    marginStart: '3@s'
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