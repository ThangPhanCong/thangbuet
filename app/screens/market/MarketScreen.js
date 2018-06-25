import React from 'react';
import {
  FlatList,
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
import _ from 'lodash';
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';

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

    if (!this.props.sortField)
      this.props.sortField = Consts.SORT_MARKET_FIELDS.VOLUME;
    if (!this.props.sortDirection)
      this.props.sortDirection = Consts.SORT_DIRECTION.DESC;
  }

  componentWillMount() {
    super.componentWillMount();
    if (_.isEmpty(this.props.symbols))
      this.props.getList();
  }

  render() {
    return (
      <View style={styles.screen}>
        {this._renderHeader()}
        <FlatList
          style={styles.listView}
          data={this.props.symbols}
          extraData={this.props}
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

  _onSortPair() {
    let { sortField, sortDirection } = this.props;

    if (sortField == Consts.SORT_MARKET_FIELDS.SYMBOL) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = Consts.SORT_MARKET_FIELDS.SYMBOL;
      sortDirection = Consts.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortLastPrice() {
    let { sortField, sortDirection } = this.props;

    if (sortField == Consts.SORT_MARKET_FIELDS.PRICE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = Consts.SORT_MARKET_FIELDS.PRICE;
      sortDirection = Consts.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortChangePercent() {
    let { sortField, sortDirection } = this.props;

    if (sortField == Consts.SORT_MARKET_FIELDS.CHANGE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = Consts.SORT_MARKET_FIELDS.CHANGE;
      sortDirection = Consts.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortVolume() {
    let { sortField, sortDirection } = this.props;

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
    let {sortField, sortDirection } = this.props;
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
}

// function mapStateToPropsFactory(state, ownProps) {
//   return (state, props) => {
//     return {
//       stats: (state.marketReducer.currency === props.currency) && state.marketReducer
//     }
//   }
// }

function mapStateToProps(state, ownProps) {
  let res = computeProps(state, ownProps);

  return {
    symbols: res[ownProps.currency],
    isLoading: res.isLoading,
    sortField: res.sortField,
    sortDirection: res.sortDirection
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    getList: () => dispatch({
      currency: ownProps.currency,
      type: ActionType.GET_MARKET_LIST,
      sortField: Consts.SORT_MARKET_FIELDS.VOLUME,
      sortDirection: Consts.SORT_DIRECTION.DESC
    }),
    sortList: (symbols, sortField, sortDirection) => dispatch({
      type: ActionType.SORT_SYMBOL_LIST,
      currency: ownProps.currency,
      symbols,
      sortField,
      sortDirection
    })
  }
}

const createCachedSelector = createSelectorCreator(
  defaultMemoize,
  _.isEqual
);

const computeProps = createCachedSelector(
  (_, props) => props.currency,
  state => state.symbols,
  state => state,
  (currency, symbols, state) => {
    let res = {};
    res[currency] = symbols;
    res.isLoading = state.isLoading;
    res.sortField = state.sortField;
    res.sortDirection = state.sortDirection;
    res.error = state.error;

    return res;
  }
)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MarketScreen);

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