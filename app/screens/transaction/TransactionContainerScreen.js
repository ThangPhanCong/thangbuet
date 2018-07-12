import React, { Component } from 'react';
import { FlatList, Text, View, TouchableWithoutFeedback, ScrollView, Image } from "react-native";
import rf from "../../libs/RequestFactory";
import moment from "moment";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import { getDayMonth, formatCurrency, getTime, getCurrencyName } from "../../utils/Filters";
import { CommonColors, CommonStyles } from "../../utils/CommonStyles";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import I18n from "../../i18n/i18n";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { orderBy } from "lodash";
import BitkoexDatePicker from "./common/BitkoexDatePicker";
import HeaderTransaction from "./common/HeaderTransaction";

class TransactionContainerScreen extends Component {
  static SORT_FIELDS = {
    DATE: 'date',
    PAIR: 'coin'
  };

  static SORT_DIRECTION = {
    ASC: 'asc',
    DESC: 'desc'
  };

  state = {
    transactions: [],
    page: 1,
    start_date: moment(new Date()).subtract(1, 'months'),
    end_date: new Date(),
    sortField: TransactionContainerScreen.SORT_FIELDS.DATE,
    sortDirection: TransactionContainerScreen.SORT_DIRECTION.DESC
  }


  componentDidMount() {
    this._loadData();
  }

  async _loadData() {
    try {
      const { page, start_date, end_date, transactions } = this.state;
      const { title } = this.props;
      const parseStartDate = moment(start_date).format('x');
      const parseEndDate = moment(end_date).format('x');
      let responseTransaction = {}, params = {};


      if (title === I18n.t('transactions.openOrderTab')) {
        params = {
          page,
          limit: 20,
          start_date: parseStartDate,
          currency: 'krw',
          end_date: parseEndDate,
        };
        responseTransaction = await rf.getRequest('OrderRequest').getOrdersPending(params);
      } else {
        params = {
          page,
          limit: 20,
          is_all_order: true,
          start_date: parseStartDate,
          end_date: parseEndDate,
        };
        responseTransaction = await rf.getRequest('OrderRequest').getOrderHistory(params);
      }

      this.setState({
        transactions: [...transactions, ...responseTransaction.data.data],
      })
    } catch (err) {
      console.log('OrderRequest._error:', err)
    }

  }

  _handleLoadMore() {
    this.setState({ page: this.state.page + 1 }, () => {
      this._loadData();
    })
  }

  _changeDate(titleDate, date) {
    this.setState({ [`${titleDate}`]: date });
  }

  _renderDatePicker(titleDate) {
    const date = this.state[titleDate];
    const showIcon = titleDate === 'start_date';

    return (
      <BitkoexDatePicker date={date} showIcon={showIcon} changeDate={(date) => this._changeDate(titleDate, date)}/>
    )
  }

  _changeSortField(sortField, sortDirection) {
    const { transactions } = this.state;

    this.setState({
      sortField,
      sortDirection,
      transactions: this._sortTransactions(transactions, sortField, sortDirection)
    })
  }

  _sortTransactions(transactions, sortField, sortDirection) {
    if (sortField !== TransactionContainerScreen.SORT_FIELDS.PAIR) {
      return orderBy(transactions, (item) => item.created_at, sortDirection)
    } else {
      const revertedDirection = this._revertSortDirection(sortDirection);
      return orderBy(transactions, ['coin', 'currency'], revertedDirection);
    }
  }

  _onSortDate() {
    let { sortField, sortDirection } = this.state;

    if (sortField === TransactionContainerScreen.SORT_FIELDS.DATE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = TransactionContainerScreen.SORT_FIELDS.DATE;
      sortDirection = TransactionContainerScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortPair() {
    let { sortField, sortDirection } = this.state;

    if (sortField === TransactionContainerScreen.SORT_FIELDS.PAIR) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = TransactionContainerScreen.SORT_FIELDS.PAIR;
      sortDirection = TransactionContainerScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection)
  }

  _revertSortDirection(direction) {
    if (direction === TransactionContainerScreen.SORT_DIRECTION.ASC) {
      return TransactionContainerScreen.SORT_DIRECTION.DESC;
    } else {
      return TransactionContainerScreen.SORT_DIRECTION.ASC;
    }
  }

  _searchByDate() {
    this.setState({ page: 1, transactions: [] }, () => {
      this._loadData();
    })
  }

  _renderButtonSeach() {
    return (
      <TouchableWithoutFeedback onPress={() => this._searchByDate()}>
        <View style={styles.searchContainer}>
          <Text style={styles.textSearch}>{I18n.t('transactions.search')}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  _renderArrow(field) {
    const { sortField, sortDirection } = this.state;

    return (
      sortField === field && sortDirection === TransactionContainerScreen.SORT_DIRECTION.ASC ?
        <Image
          source={require('../../../assets/sortAsc/asc.png')}/>
        :
        <Image
          source={require('../../../assets/sortDesc/desc.png')}/>
    )
  }

  async _cancelTransaction(item) {
    await rf.getRequest('OrderRequest').cancel(item.id);
    this.setState({ page: 1, transactions: [] }, () => {
      this._loadData();
    })
  }

  _renderStatusOrder(item) {
    return (
      <TouchableWithoutFeedback onPress={() => this._cancelTransaction(item)}>
        <View style={styles.lastItemRightOrder}>
          <View style={styles.viewCancel}>
            <Text style={styles.textCancel}>{I18n.t('transactions.cancel')}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  _renderItem({ item }) {
    const { title } = this.props;
    const stylesQuantity = item.quantity.includes('-') ? styles.itemDecreaseQuantity : styles.itemIncreaseQuantity;

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeftContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.itemDayMonth}>{getDayMonth(item.created_at)}</Text>
            <Text style={styles.itemTime}>{getTime(item.created_at)}</Text>
          </View>

          <View style={styles.coinPairContainer}>
            <Text style={[styles.itemCoin, { fontWeight: 'bold' }]}>{getCurrencyName(item.coin)}</Text>
            <Text style={[styles.itemCurrency, { fontWeight: 'bold' }]}>{' / ' + getCurrencyName(item.currency)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <View style={styles.itemRight}>
            <Text style={stylesQuantity}>
              {formatCurrency(item.quantity, item.coin)}
            </Text>

            <Text style={[styles.itemTransaction]}>{getCurrencyName(item.coin)}</Text>
          </View>

          <View style={styles.itemRight}>
            <Text style={styles.itemPrice}>{formatCurrency(item.price, item.currency)}</Text>
            <Text style={styles.itemTransaction}>{getCurrencyName(item.currency)}</Text>
          </View>

          <View style={styles.itemRight}>
            <Text style={styles.itemQuantityPrice}>{formatCurrency(item.price * item.quantity, item.currency)}</Text>
            <Text style={styles.itemTransaction}>{getCurrencyName(item.currency)}</Text>
          </View>

          {title === I18n.t('transactions.openOrderTab') ? this._renderStatusOrder(item) :
            <View style={[styles.lastItemRight]}>
              <Text style={styles.itemFee}>
                {formatCurrency(item.fee, item.coin)}
              </Text>
              <Text style={styles.itemTransaction}>{getCurrencyName(item.coin)}</Text>
            </View>}
        </View>
      </View>
    )
  }

  render() {
    const { transactions } = this.state;
    const { title } = this.props;
    const titleLast = title === I18n.t('transactions.openOrderTab') ? I18n.t('transactions.cancel') : I18n.t('transactions.fee');

    const titles = [I18n.t('transactions.amount'), I18n.t('transactions.orderPrice'),
      I18n.t('transactions.excutedPrice'), titleLast];

    return (
      <View style={styles.screen}>
        <View style={styles.viewDatePicker}>
          {this._renderDatePicker('start_date')}
          <View style={styles.viewSymbol}>
            <Text>~</Text>
          </View>
          {this._renderDatePicker('end_date')}
          {this._renderButtonSeach()}
        </View>

        <View>
          <ScrollView horizontal={true} contentContainerStyle={{ flexDirection: 'column' }}>
            <HeaderTransaction sortDate={() => this._onSortDate()}
                               titles={titles}
                               sortPair={() => this._onSortPair()}
                               renderArrowDate={this._renderArrow(TransactionContainerScreen.SORT_FIELDS.DATE)}
                               renderArrowPair={this._renderArrow(TransactionContainerScreen.SORT_FIELDS.PAIR)}
            />
            <FlatList data={transactions}
                      renderItem={this._renderItem.bind(this)}
                      onEndReached={this._handleLoadMore.bind(this)}
                      onEndThreshold={100}/>
          </ScrollView>
        </View>
      </View>
    )
  }
}

export default TransactionContainerScreen;

const styles = ScaledSheet.create({
  screen: {
    flexDirection: 'column',
    ...CommonStyles.screen
  },
  headerContainer: {
    flexDirection: 'row',
    height: '40@s',
    backgroundColor: '#f8f9fb',
    alignItems: 'center',
    borderWidth: '1@s',
    borderColor: CommonColors.separator
  },
  itemContainer: {
    flexDirection: 'row',
    height: '40@s',
    borderBottomColor: CommonColors.separator,
    borderBottomWidth: '1@s',
  },
  itemDayMonth: {
    color: CommonColors.mainText,
    fontWeight: 'bold',
    fontSize: '12@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemTime: {
    color: CommonColors.mainText,
    fontSize: '11@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemCoin: {
    color: CommonColors.mainText,
    fontSize: '12@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemCurrency: {
    color: CommonColors.mainText,
    fontSize: '12@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemTransaction: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemQuantity: {
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemDecreaseQuantity: {
    fontSize: '10@s',
    color: CommonColors.decreased,
    fontFamily: 'OpenSans-Regular'
  },
  itemIncreaseQuantity: {
    fontSize: '10@s',
    color: CommonColors.increased,
    fontFamily: 'OpenSans-Regular'
  },
  itemPrice: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemQuantityPrice: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemFee: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemLeftContainer: {
    width: '150@s',
    flexDirection: 'row',
    borderRightColor: CommonColors.separator,
    borderRightWidth: '1@s',
  },
  timeContainer: {
    width: '50@s',
    marginLeft: '2@s',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  itemRight: {
    flexDirection: 'column',
    width: '75@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  lastItemRight: {
    flexDirection: 'column',
    width: '50@s',
    marginLeft: '10@s',
    marginRight: '20@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  lastItemRightOrder: {
    flexDirection: 'column',
    width: '70@s',
    marginLeft: '10@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: '#f1f1f1',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '22@s',
    margin: '6@s',
    width: '40@s',
    borderRadius: '2@s',
    borderBottomColor: '#000',
    borderBottomWidth: '0.6@s'
  },
  textSearch: {
    fontSize: '12@s',
    color: CommonColors.mainText
  },
  columnPrice: {
    flexDirection: 'column',
    flex: 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemStatus: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  viewCancel: {
    backgroundColor: '#ff5d5d',
    width: '50@s',
    height: '25@s',
    marginRight: '5@s',
    borderRadius: '5@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textCancel: {
    fontSize: '12@s',
    color: '#FFF',
    fontFamily: 'OpenSans-Regular'
  },
  coinPairContainer: {
    width: '100@s',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '10@s',
    marginRight: '10@s'
  },
  viewDatePicker: {
    flexDirection: 'row',
    height: '40@s',
    alignItems: 'center',
  },
  viewSymbol: {
    alignSelf: 'center',
    marginLeft: '10@s'
  },
});
