import React, { Component } from 'react';
import { FlatList, Text, View, TouchableWithoutFeedback } from "react-native";
import rf from "../../libs/RequestFactory";
import TransactionRequest from "../../requests/TransactionRequest";
import DatePicker from 'react-native-datepicker'
import moment from "moment";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import { getDayMonth, formatCurrency, getTime, getCurrencyName } from "../../utils/Filters";
import { CommonColors, CommonStyles } from "../../utils/CommonStyles";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import I18n from "../../i18n/i18n";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { orderBy } from "lodash";

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

      const parseStartDate = moment(start_date).format('x');
      const parseEndDate = moment(end_date).format('x');

      const params = {
        page,
        start_date: parseStartDate,
        end_date: parseEndDate,
      };

      const responseTransaction = await rf.getRequest('OrderRequest').getOrderHistory(params);

      this.setState({ transactions: [...transactions, ...responseTransaction.data.data] })
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
      <DatePicker
        style={{ width: scale(120) }}
        date={date}
        mode="date"
        showIcon={showIcon}
        placeholder="select date"
        format="YYYY-MM-DD"
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={{
          dateIcon: {
            position: 'absolute',
            left: scale(0),
            top: scale(4),
            marginLeft: scale(0)
          },
          dateInput: {
            marginLeft: scale(30),
            height: scale(25),
            borderRadius: scale(4)
          },
          dateText: {
            fontSize: scale(11)
          }
        }}
        onDateChange={(date) => this._changeDate(titleDate, date)}
      />
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
        <Icon
          name='menu-up'
          size={scale(20)}
          color='#000'/> :
        <Icon
          name='menu-down'
          size={scale(20)}
          color='#000'/>
    )
  }

  _renderHeader() {
    return (
      <View style={styles.headerContainer}>
        <View style={{
          flexDirection: 'row', flex: 1, marginLeft: scale(8),
        }}>
          <TouchableWithoutFeedback onPress={() => this._onSortDate()}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Text>{I18n.t('transactions.time')}</Text>
              {this._renderArrow(TransactionContainerScreen.SORT_FIELDS.DATE)}
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={() => this._onSortPair()}>
            <View style={{ flexDirection: 'row', flex: 1.5 }}>
              <Text>{I18n.t('transactions.pair')}</Text>
              {this._renderArrow(TransactionContainerScreen.SORT_FIELDS.PAIR)}
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Text style={{
            flex: 1, alignItems: 'flex-end',
          }}> {I18n.t('transactions.amount')}</Text>
          <Text style={{ flex: 1 }}>{I18n.t('transactions.orderPrice')}</Text>
          <Text style={{ flex: 1 }}>{I18n.t('transactions.excutedPrice')}</Text>
          <Text style={{ flex: 1 }}>{I18n.t('transactions.fee')}</Text>
        </View>
      </View>
    )
  }

  _renderItem({ item }) {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeftContainer}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.itemDayMonth}>{getDayMonth(item.created_at)}</Text>
            <Text style={styles.itemTime}>{getTime(item.created_at)}</Text>
          </View>

          <View style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.itemCoin, { fontWeight: 'bold' }]}>{getCurrencyName(item.coin)}</Text>
            <Text style={[styles.itemCurrency, { fontWeight: 'bold' }]}>{' / ' + getCurrencyName(item.currency)}</Text>
          </View>
        </View>

        <View style={{ flex: 1.8, flexDirection: 'row' }}
        >
          <View style={styles.itemRight}>
            <Text style={styles.itemQuantity}>
              {formatCurrency(item.quantity, item.coin)}
            </Text>

            <Text style={[styles.itemCoin]}>{getCurrencyName(item.coin)}</Text>
          </View>

          <View style={styles.columnPrice}>
            <Text style={styles.itemPrice}>{formatCurrency(item.price, item.currency)}</Text>
            <Text style={styles.itemCurrency}>{getCurrencyName(item.currency)}</Text>
          </View>

          <View style={styles.columnPrice}>
            <Text style={styles.itemQuantityPrice}>{formatCurrency(item.price * item.quantity, item.currency)}</Text>
            <Text style={styles.itemCurrency}>{getCurrencyName(item.currency)}</Text>
          </View>

          <View style={{
            flexDirection: 'column',
            flex: 1.8,
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}>
            <Text style={styles.itemFee}>
              {formatCurrency(item.fee, item.coin)}
            </Text>
            <Text style={styles.itemCoin}>{getCurrencyName(item.coin)}</Text>
          </View>
        </View>
      </View>
    )
  }

  render() {
    const { transactions } = this.state;

    return (
      <View style={styles.screen}>
        <View style={{ flexDirection: 'row' }}>
          {this._renderDatePicker('start_date')}
          <View style={{ alignSelf: 'center', marginLeft: scale(20) }}>
            <Text>~</Text>
          </View>
          {this._renderDatePicker('end_date')}
          {this._renderButtonSeach()}
        </View>

        <View>
          {this._renderHeader()}
          <FlatList data={transactions}
                    renderItem={this._renderItem.bind(this)}
                    onEndReached={this._handleLoadMore.bind(this)}
                    onEndThreshold={100}/>
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
    height: '50@s',
    backgroundColor: '#f8f9fb',
    alignItems: 'center',
    borderWidth: '1@s',
    borderColor: CommonColors.separator
  },
  itemContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '50@s',
    borderBottomColor: CommonColors.separator,
    borderBottomWidth: '1@s',
  },
  itemDayMonth: {
    color: CommonColors.mainText,
    fontWeight: 'bold',
    fontSize: '12@s'
  },
  itemTime: {
    color: CommonColors.mainText,
    fontSize: '11@s'
  },
  itemCoin: {
    color: CommonColors.mainText
  },
  itemCurrency: {
    color: CommonColors.mainText
  },
  itemQuantity: {
    fontSize: '12@s',
  },
  itemPrice: {
    color: CommonColors.mainText,
    fontSize: '12@s',
  },
  itemQuantityPrice: {
    color: CommonColors.mainText,
    fontSize: '12@s',
  },
  itemLeftContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRightColor: CommonColors.separator,
    borderRightWidth: '1@s',
  },
  itemRight: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: '#f1f1f1',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '25@s',
    margin: '6@s',
    width: '35@s',
    borderRadius: '4@s'
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
  }
});
