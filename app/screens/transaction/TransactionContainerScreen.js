import React, { Component } from 'react';
import { FlatList, Text, View, TouchableWithoutFeedback, ScrollView, Image } from "react-native";
import rf from "../../libs/RequestFactory";
import moment from "moment";
import { getDayMonth, formatCurrency, getTime, getCurrencyName } from "../../utils/Filters";
import { CommonColors, CommonStyles } from "../../utils/CommonStyles";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import I18n from "../../i18n/i18n";
import { orderBy } from "lodash";
import BitkoexDatePicker from "./common/BitkoexDatePicker";
import HeaderTransaction from "./common/HeaderTransaction";
import { Fonts } from "../../../app/utils/CommonStyles";
import HeaderTransactionsRight from "./common/HeaderTransactionsRight";
import BaseScreen from "../BaseScreen";
import Consts from "../../utils/Consts";

class TransactionContainerScreen extends BaseScreen {
  static TYPE_SCREEN = {
    ORDER_HISTORY: 'order',
    OPEN_ORDER: 'open_order',
  };

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
    sortDirection: TransactionContainerScreen.SORT_DIRECTION.DESC,
  }

  firstScrollView = null;


  componentDidMount() {
    super.componentDidMount();
    this._loadData();
  }

  getSocketEventHandlers() {
    return {
      PricesUpdated: this.onPricesUpdated.bind(this),
      OrderListUpdated: this.OrderListUpdated.bind(this)
    }
  }

  OrderListUpdated() {
    this._loadData(true)
  }

  onPricesUpdated(prices) {
    const { transactions } = this.state;

    transactions.forEach(item => {
      if(prices[`${item.currency}_${item.coin}`]) {
          item.price = prices[`${item.currency}_${item.coin}`].price;
      }
    });

    this.setState({transactions});
  }

  async _loadData(clearData = false) {
    try {
      const { page, start_date, end_date, transactions } = this.state;
      const { typeScreen } = this.props;
      const parseStartDate = moment(start_date).format('x');
      const parseEndDate = moment(end_date).format('x');
      let responseTransaction = {}, params = {};


      if (typeScreen === TransactionContainerScreen.TYPE_SCREEN.OPEN_ORDER) {
        params = {
          page: clearData ? 1 : page,
          limit: 20,
          start_date: parseStartDate,
          currency: 'krw',
          end_date: parseEndDate,
        };
        responseTransaction = await rf.getRequest('OrderRequest').getOrdersPending(params);
      } else {
        params = {
          page: clearData ? 1 : page,
          limit: 20,
          is_all_order: true,
          start_date: parseStartDate,
          end_date: parseEndDate,
        };
        responseTransaction = await rf.getRequest('OrderRequest').getOrderHistory(params);
      }

      const newTransactions = clearData ? responseTransaction.data.data : [...transactions, ...responseTransaction.data.data];

      this.setState({
        transactions: newTransactions,
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
          style={styles.iconSort}
          source={require('../../../assets/sortAsc/asc.png')}/>
        :
        <Image
          style={styles.iconSort}
          source={require('../../../assets/sortDesc/desc.png')}/>
    )
  }

  async _cancelTransaction(item) {
    try {
      const { transactions } = this.state;

      await rf.getRequest('OrderRequest').cancel(item.id);
      console.log("cancel xong")
      const newTransactions = transactions.filter(tr => tr.id !== item.id) ;

      this.setState({transactions: newTransactions});
    } catch (err) {
      console.log("CancelTransaction._error:", err)
    }

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
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeftContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.itemDayMonth}>{getDayMonth(item.created_at)}</Text>
            <Text style={styles.itemTime}>{getTime(item.created_at)}</Text>
          </View>

          <View style={styles.coinPairContainer}>
            <Text style={styles.itemCoin}>{getCurrencyName(item.coin)}</Text>
            <Text style={styles.itemCurrency}>{' / ' + getCurrencyName(item.currency)}</Text>
          </View>
        </View>
      </View>
    )
  }

  _renderItemRight({ item }) {
    const { typeScreen } = this.props;
    const stylesQuantity = item.quantity.includes('-') ? styles.itemDecreaseQuantity : styles.itemIncreaseQuantity;

    return (
      <View style={styles.itemContainer}>
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

        {typeScreen === TransactionContainerScreen.TYPE_SCREEN.OPEN_ORDER ? this._renderStatusOrder(item) :
          <View style={[styles.lastItemRight]}>
            <Text style={styles.itemFee}>
              {formatCurrency(item.fee, item.coin)}
            </Text>
            <Text style={styles.itemTransaction}>{getCurrencyName(item.coin)}</Text>
          </View>}
      </View>
    )
  }

  _onLeftListScroll(event) {
    if (this.firstScrollView === 'left') {
      const y = event.nativeEvent.contentOffset.y;
      this.flatListRight.scrollToOffset({
        offset: y,
      });
    }
  }

  _onRightListScroll(event) {
    if (this.firstScrollView === 'right') {
      const y = event.nativeEvent.contentOffset.y;
      this.flatListLeft.scrollToOffset({
        offset: y,
      });
    }
  }

  _handleLeftMomentumEnd() {
    if (this.firstScrollView === 'left') {
      this.firstScrollView = null;
    }
  }

  _handleLeftMomentumStart() {
    if (this.firstScrollView === null) {
      this.firstScrollView = 'left';
    }
  }

  _handleRightMomentumStart() {
    if (this.firstScrollView == null) {
      this.firstScrollView = 'right';
    }
  }

  _handleRightMomentumEnd() {
    if (this.firstScrollView === 'right') {
      this.firstScrollView = null;
    }
  }

  _handleTouchStartLeft() {
    if (this.firstScrollView === null) {
      this.firstScrollView = 'left';
    }
  }

  _handleTouchEndLeft() {
    console.log("touch left end")
    if (this.firstScrollView === 'left') {
      this.firstScrollView = null;
    }
  }

  _handleTouchStartRight() {
    if (this.firstScrollView === null) {
      this.firstScrollView = 'right';
    }
  }

  _handleTouchEndRight() {
    if (this.firstScrollView === 'right') {
      this.firstScrollView = null;
    }
  }

  render() {
    const { transactions } = this.state;
    const { typeScreen } = this.props;
    const titleLast = typeScreen === TransactionContainerScreen.TYPE_SCREEN.OPEN_ORDER ? I18n.t('transactions.cancel') : I18n.t('transactions.fee');

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
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexDirection: 'column' }}>
            <HeaderTransaction sortDate={() => this._onSortDate()}
                               sortPair={() => this._onSortPair()}
                               renderArrowDate={this._renderArrow(TransactionContainerScreen.SORT_FIELDS.DATE)}
                               renderArrowPair={this._renderArrow(TransactionContainerScreen.SORT_FIELDS.PAIR)}
            />

            <FlatList data={transactions}
                      ref={elm => this.flatListLeft = elm}
                      keyExtractor={(item, index) => index.toString()}
                      onScroll={(event) => this._onLeftListScroll(event)}
                      renderItem={this._renderItem.bind(this)}
                      onEndReached={this._handleLoadMore.bind(this)}
                      onMomentumScrollStart={() => this._handleLeftMomentumStart()}
                      onMomentumScrollEnd={() => this._handleLeftMomentumEnd()}
                      onTouchStart={() => this._handleTouchStartLeft()}
                      onTouchEnd={() => this._handleTouchEndLeft()}
                      onEndThreshold={100}/>
          </View>

          <ScrollView horizontal={true} contentContainerStyle={{ flexDirection: 'column' }}>
            <HeaderTransactionsRight titles={titles}/>
            <FlatList data={transactions}
                      ref={elm => this.flatListRight = elm}
                      keyExtractor={(item, index) => index.toString()}
                      onScroll={(event) => this._onRightListScroll(event)}
                      renderItem={this._renderItemRight.bind(this)}
                      onEndReached={this._handleLoadMore.bind(this)}
                      onMomentumScrollStart={() => this._handleRightMomentumStart()}
                      onMomentumScrollEnd={() => this._handleRightMomentumEnd()}
                      onTouchStart={() => this._handleTouchStartRight()}
                      onTouchEnd={() => this._handleTouchEndRight()}
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
    fontSize: '12@s',
    ...Fonts.OpenSans_Bold
  },
  itemTime: {
    color: CommonColors.mainText,
    fontSize: '11@s',
    ...Fonts.OpenSans
  },
  itemCoin: {
    color: CommonColors.mainText,
    fontSize: '12@s',
    ...Fonts.OpenSans_Bold
  },
  itemCurrency: {
    color: CommonColors.mainText,
    fontSize: '12@s',
    ...Fonts.OpenSans_Bold
  },
  itemTransaction: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemQuantity: {
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemDecreaseQuantity: {
    fontSize: '10@s',
    color: CommonColors.decreased,
    ...Fonts.OpenSans
  },
  itemIncreaseQuantity: {
    fontSize: '10@s',
    color: CommonColors.increased,
    ...Fonts.OpenSans
  },
  itemPrice: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemQuantityPrice: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemFee: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    ...Fonts.OpenSans
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
    borderColor: '#bfbfbf',
    borderWidth: '0.6@s'
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
    borderRadius: '3@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textCancel: {
    fontSize: '12@s',
    color: '#FFF',
    ...Fonts.OpenSans
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
  iconSort: {
    marginTop: '10@s',
    height: '20@s',
    width: '20@s',
  }
});
