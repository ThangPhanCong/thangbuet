import React, { Component } from 'react';
import { FlatList, Text, TouchableWithoutFeedback, View, ScrollView, Image, Linking } from "react-native";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, CommonStyles, Fonts } from "../../utils/CommonStyles";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import I18n from "../../i18n/i18n";
import moment from "moment/moment";
import BitkoexDatePicker from "./common/BitkoexDatePicker";
import rf from "../../libs/RequestFactory";
import TransactionRequest from "../../requests/TransactionRequest";
import { orderBy } from "lodash";
import { formatCurrency, getCurrencyName, getTime } from "../../utils/Filters";
import HeaderFunds from "./HeaderFunds";
import HeaderFundsRight from "./HeaderFundsRight";
import Utils from "../../utils/Utils";
import BaseScreen from "../BaseScreen";

class FundsHistoryScreen extends BaseScreen {
  static SORT_FIELDS = {
    DATE: 'date',
    PAIR: 'coin'
  };

  static SORT_DIRECTION = {
    ASC: 'asc',
    DESC: 'desc'
  };
  state = {
    start_date: moment(new Date()).subtract(1, 'months'),
    end_date: new Date(),
    transactions: [],
    page: 1,
    sortField: FundsHistoryScreen.SORT_FIELDS.DATE,
    sortDirection: FundsHistoryScreen.SORT_DIRECTION.DESC
  }

  firstScrollView = null;
  last_page = 1;

  componentDidMount() {
    super.componentDidMount();
    this._loadData();
  }

  _changeDate(titleDate, date) {
    this.setState({ [`${titleDate}`]: date });
  }

  async _loadData() {
    try {
      const { page, start_date, end_date, transactions } = this.state;
      const parseStartDate = moment(start_date).format('x');
      const parseEndDate = moment(end_date).format('x');

      const params = {
        page,
        limit: 20,
        start: parseStartDate,
        currency: 'krw',
        end: parseEndDate,
      };

      const responseFunds = await rf.getRequest('TransactionRequest').getTrasactionHistory(params);

      this.last_page = responseFunds.data.last_page;
      this.setState({ transactions: [...transactions, ...responseFunds.data.data] })

    } catch (err) {
      console.log("FundsHistory._error:", err)
    }
  }

  _handleLoadMore() {
    const { page } = this.state;

    if (page >= this.last_page) {
      return;
    }

    this.setState({ page: this.state.page + 1 }, () => {
      this._loadData();
    })
  }

  getSocketEventHandlers() {
    return {
      TransactionCreated: this.onTransactionCreated.bind(this)
    }
  }

  onTransactionCreated(data) {
    const { transactions } = this.state;

    transactions.push(data);
    this.setState({transactions});
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
    if (sortField !== FundsHistoryScreen.SORT_FIELDS.PAIR) {
      return orderBy(transactions, (item) => item.created_at, sortDirection)
    } else {
      const revertedDirection = this._revertSortDirection(sortDirection);
      return orderBy(transactions, 'currency', revertedDirection);
    }
  }

  _onSortDate() {
    let { sortField, sortDirection } = this.state;

    if (sortField === FundsHistoryScreen.SORT_FIELDS.DATE) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = FundsHistoryScreen.SORT_FIELDS.DATE;
      sortDirection = FundsHistoryScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection);
  }

  _onSortPair() {
    let { sortField, sortDirection } = this.state;

    if (sortField === FundsHistoryScreen.SORT_FIELDS.PAIR) {
      sortDirection = this._revertSortDirection(sortDirection);
    } else {
      sortField = FundsHistoryScreen.SORT_FIELDS.PAIR;
      sortDirection = FundsHistoryScreen.SORT_DIRECTION.DESC;
    }

    this._changeSortField(sortField, sortDirection)
  }

  _revertSortDirection(direction) {
    if (direction === FundsHistoryScreen.SORT_DIRECTION.ASC) {
      return FundsHistoryScreen.SORT_DIRECTION.DESC;
    } else {
      return FundsHistoryScreen.SORT_DIRECTION.ASC;
    }
  }

  _searchByDate() {
    this.setState({ page: 1, transactions: [] }, () => {
      this._loadData();
    })
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

  _renderButtonSeach() {
    return (
      <TouchableWithoutFeedback onPress={() => this._searchByDate()}>
        <View style={styles.searchContainer}>
          <Text style={styles.textSearch}>{I18n.t('transactions.search')}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  _renderDatePicker(titleDate) {
    const date = this.state[titleDate];
    const showIcon = titleDate === 'start_date';

    return (
      <BitkoexDatePicker date={date} showIcon={showIcon} changeDate={(date) => this._changeDate(titleDate, date)}/>
    )
  }

  _renderArrow(field) {
    const { sortField, sortDirection } = this.state;
    return (
      sortField === field && sortDirection === FundsHistoryScreen.SORT_DIRECTION.ASC ?
        <Image
          style={styles.iconSort}
          source={require('../../../assets/sortAsc/asc.png')}/> :
        <Image
          style={styles.iconSort}
          source={require('../../../assets/sortDesc/desc.png')}/>
    )
  }

  _renderItem({ item }) {
    const pardeDayMonth = moment(item.transaction_date).format('MM.DD');

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeftContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.itemDayMonth}>{pardeDayMonth}</Text>
            <Text style={styles.itemTime}>{getTime(item.updated_at)}</Text>
          </View>

          <View style={styles.coinPairContainer}>
            <Text style={styles.itemCurrency}>{getCurrencyName(item.currency)}</Text>
          </View>
        </View>


      </View>
    )
  }

  _renderItemRight({ item }) {
    const transactionId = item.transaction_id ? item.transaction_id : item.internal_transaction_id;
    const stylesQuantity = item.amount.includes('-') ? styles.itemDecreaseQuantity : styles.itemIncreaseQuantity;
    const txidKRW = <View style={styles.txidKRW}>
      <Text style={styles.itemBankAccount} numberOfLines={1} ellipsizeMode={'tail'}>{item.foreign_bank_account}</Text>
      <Text style={styles.itemBankName}>{item.foreign_bank_account_holder}</Text>
    </View>

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemRight}>
          <Text style={stylesQuantity}>
            {formatCurrency(item.amount, item.currency)}
          </Text>

          <Text style={[styles.itemFunds]}>{getCurrencyName(item.currency)}</Text>
        </View>

        {
          item.currency === 'krw' ? txidKRW :
            <TouchableWithoutFeedback onPress={item.transaction_id ?
              () => Linking.openURL(Utils.getTransactionUrl(item.currency, item.transaction_id))
              : () => {
              }}>
              <View style={styles.viewAddressBlockChain}>
                <Text style={styles.itemBlockchain} numberOfLines={1} ellipsizeMode={'tail'}>{transactionId}</Text>
              </View>
            </TouchableWithoutFeedback>
        }

        <View style={styles.itemRight}>
          <Text style={styles.itemQuantityPrice}>{formatCurrency(item.fee, item.currency)}</Text>
          <Text style={styles.itemFunds}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={[styles.itemRight, { marginRight: scale(10) }]}>
          {item.status === 'pending' ? <Text style={styles.itemPending}> {I18n.t('transactions.pending')}</Text>
            : <Text style={styles.itemSuccess}>{I18n.t('transactions.success')}</Text>}
        </View>
      </View>
    )
  }

  render() {
    const { transactions } = this.state;
    const titles = [I18n.t('transactions.funds.amount'), I18n.t('transactions.funds.account'),
      I18n.t('transactions.fee'), I18n.t('transactions.funds.status')];

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
            <HeaderFunds sortDate={() => this._onSortDate()}
                         sortPair={() => this._onSortPair()}
                         renderArrowDate={this._renderArrow(FundsHistoryScreen.SORT_FIELDS.DATE)}
                         renderArrowPair={this._renderArrow(FundsHistoryScreen.SORT_FIELDS.PAIR)}
            />
            <FlatList data={transactions}
                      ref={elm => this.flatListLeft = elm}
                      keyExtractor={(item, index) => index.toString()}
                      onScroll={(event) => this._onLeftListScroll(event)}
                      onMomentumScrollStart={() => this._handleLeftMomentumStart()}
                      onMomentumScrollEnd={() => this._handleLeftMomentumEnd()}
                      onTouchStart={() => this._handleTouchStartLeft()}
                      onTouchEnd={() => this._handleTouchEndLeft()}
                      renderItem={this._renderItem.bind(this)}
                      onEndReached={this._handleLoadMore.bind(this)}
                      onEndReachedThreshold={0.5}/>
          </View>

          <ScrollView horizontal={true} contentContainerStyle={{ flexDirection: 'column' }}>
            <HeaderFundsRight titles={titles}/>
            <FlatList data={transactions}
                      ref={elm => this.flatListRight = elm}
                      keyExtractor={(item, index) => index.toString()}
                      onScroll={(event) => this._onRightListScroll(event)}
                      onMomentumScrollStart={() => this._handleRightMomentumStart()}
                      onMomentumScrollEnd={() => this._handleRightMomentumEnd()}
                      onTouchStart={() => this._handleTouchStartRight()}
                      onTouchEnd={() => this._handleTouchEndRight()}
                      renderItem={this._renderItemRight.bind(this)}
                      onEndReached={this._handleLoadMore.bind(this)}
                      onEndReachedThreshold={0.5}/>
          </ScrollView>
        </View>
      </View>
    )
  }
}

export default FundsHistoryScreen;


const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen,
    flexDirection: 'column',
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
  itemContainer: {
    flexDirection: 'row',
    height: '40@s',
    borderBottomColor: CommonColors.separator,
    borderBottomWidth: '1@s',
  },
  itemLeftContainer: {
    width: '120@s',
    flexDirection: 'row',
    borderRightColor: CommonColors.separator,
    borderRightWidth: '1@s',
  },
  itemDayMonth: {
    color: CommonColors.mainText,
    fontWeight: 'bold',
    fontSize: '12@s',
    ...Fonts.OpenSans
  },
  itemTime: {
    color: CommonColors.mainText,
    fontSize: '11@s',
    ...Fonts.OpenSans
  },
  itemCurrency: {
    color: CommonColors.mainText,
    fontSize: '12@s',
    ...Fonts.OpenSans_Bold
  },
  itemFunds: {
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
  itemQuantityPrice: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemPending: {
    color: 'red',
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemSuccess: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemRight: {
    flexDirection: 'column',
    width: '80@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemBlockchain: {
    color: '#3a68bc',
    fontSize: '10@s',
    borderBottomColor: '#3a68bc',
    borderBottomWidth: '0.5@s'
  },
  viewAddressBlockChain: {
    width: '90@s',
    marginLeft: '10@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeContainer: {
    width: '50@s',
    marginLeft: '2@s',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  coinPairContainer: {
    width: '70@s',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '20@s',
    marginRight: '40@s'
  },
  viewDatePicker: {
    height: '40@s',
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewSymbol: {
    alignSelf: 'center',
    marginLeft: '10@s'
  },
  iconSort: {
    marginTop: '7@s',
    height: '20@s',
    width: '20@s',
  },
  itemBankAccount: {
    ...Fonts.OpenSans,
    fontSize: '12@s'
  },
  itemBankName: {
    ...Fonts.NanumGothic_Regular,
    fontSize: '12@s'
  },
  txidKRW: {
    flexDirection: 'column',
    width: '90@s',
    marginLeft: '10@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  }
})
