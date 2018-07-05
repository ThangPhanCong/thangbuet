import React, { Component } from 'react';
import { FlatList, Text, TouchableWithoutFeedback, View, ScrollView } from "react-native";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, CommonStyles } from "../../utils/CommonStyles";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import I18n from "../../i18n/i18n";
import moment from "moment/moment";
import BitkoexDatePicker from "./common/BitkoexDatePicker";
import rf from "../../libs/RequestFactory";
import TransactionRequest from "../../requests/TransactionRequest";
import { orderBy } from "lodash";
import HeaderTransaction from "./common/HeaderTransaction";
import TransactionContainerScreen from "./TransactionContainerScreen";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatCurrency, getCurrencyName, getDayMonth, getTime } from "../../utils/Filters";

class FundsHistoryScreen extends Component {
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

  _renderDatePicker(titleDate) {
    const date = this.state[titleDate];
    const showIcon = titleDate === 'start_date';

    return (
      <BitkoexDatePicker date={date} showIcon={showIcon} changeDate={(date) => this._changeDate(titleDate, date)}/>
    )
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
        limit: 20,
        start: parseStartDate,
        currency: 'krw',
        end: parseEndDate,
      };

      const responseFunds = await rf.getRequest('TransactionRequest').getTrasactionHistory(params);

      this.setState({ transactions: [...transactions, ...responseFunds.data.data] })

    } catch (err) {
      console.log("FundsHistory._error:", err)
    }
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
      return orderBy(transactions, ['coin', 'currency'], revertedDirection);
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

  _renderItem({ item }) {
    const { title } = this.props;
    const pardeDayMonth = moment(item.transaction_date).format('MM-DD');
    const truntCateAddress = item.foreign_blockchain_address.substr(0, 11) + "...";

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemLeftContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.itemDayMonth}>{pardeDayMonth}</Text>
            <Text style={styles.itemTime}>{getTime(item.updated_at)}</Text>
          </View>

          <View style={styles.coinPairContainer}>
            <Text style={[styles.itemCurrency, { fontWeight: 'bold' }]}>{getCurrencyName(item.currency)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}
        >
          <View style={styles.itemRight}>
            <Text style={styles.itemQuantity}>
              {formatCurrency(item.amount, item.currency)}
            </Text>

            <Text style={[styles.itemCurrency]}>{getCurrencyName(item.currency)}</Text>
          </View>

          <View style={styles.viewAddressBlockChain}>
            <Text style={styles.itemBlockchain}>{truntCateAddress}</Text>
          </View>

          <View style={styles.itemRight}>
            <Text style={styles.itemQuantityPrice}>{formatCurrency(item.fee, item.currency)}</Text>
            <Text style={styles.itemCurrency}>{getCurrencyName(item.currency)}</Text>
          </View>

          <View style={[styles.itemRight, {marginRight: scale(10)}]}>
            {item.status === 'pending' ? <Text style={styles.itemPending}> {I18n.t('transactions.pending')}</Text>
              : <Text style={styles.itemSuccess}>{I18n.t('transactions.success')}</Text>}
          </View>
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
        <View style={{ flexDirection: 'row' }}>
          {this._renderDatePicker('start_date')}
          <View style={{ alignSelf: 'center', marginLeft: scale(20) }}>
            <Text>~</Text>
          </View>
          {this._renderDatePicker('end_date')}
          {this._renderButtonSeach()}
        </View>

        <View>
          <ScrollView horizontal={true} contentContainerStyle={{ flexDirection: 'column' }}>
            <HeaderTransaction sortDate={() => this._onSortDate()}
                               sortPair={() => this._onSortPair()}
                               renderArrowDate={this._renderArrow(FundsHistoryScreen.SORT_FIELDS.DATE)}
                               renderArrowPair={this._renderArrow(FundsHistoryScreen.SORT_FIELDS.PAIR)}
                               titles={titles}
            />
            <FlatList data={transactions}
                      renderItem={this._renderItem.bind(this)}
              // onEndReached={this._handleLoadMore.bind(this)}
                      onEndThreshold={100}/>
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
    height: '25@s',
    margin: '6@s',
    width: '35@s',
    borderRadius: '4@s'
  },
  textSearch: {
    fontSize: '12@s',
    color: CommonColors.mainText
  },
  itemContainer: {
    flexDirection: 'row',
    height: '50@s',
    borderBottomColor: CommonColors.separator,
    borderBottomWidth: '1@s',
  },
  itemLeftContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRightColor: CommonColors.separator,
    borderRightWidth: '1@s',
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
  itemCurrency: {
    color: CommonColors.mainText,
    fontSize: '13@s'
  },
  itemPending: {
    color: 'red',
    fontSize: '13@s'
  },
  itemSuccess: {
    color: CommonColors.mainText,
    fontSize: '13@s'
  },
  itemRight: {
    flexDirection: 'column',
    width: '100@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemBlockchain: {
    color: CommonColors.decreased,
    fontSize: '11@s',
    borderBottomColor: CommonColors.decreased,
    borderBottomWidth: '0.5@s'
  },
  viewAddressBlockChain: {
    flexWrap: 'wrap',
    width: '100@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeContainer: {
    flex: 1,
    marginLeft: '2@s',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  coinPairContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '20@s',
    marginRight: '20@s'
  }
})
