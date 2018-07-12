import React, { Component } from 'react';
import { FlatList, Text, TouchableWithoutFeedback, View, ScrollView } from "react-native";
import { CommonColors, CommonStyles } from "../../utils/CommonStyles";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import I18n from "../../i18n/i18n";
import moment from "moment/moment";
import BitkoexDatePicker from "./common/BitkoexDatePicker";
import HeaderTransaction from "./common/HeaderTransaction";
import rf from "../../libs/RequestFactory";
import BigNumber from 'bignumber.js';
import { formatCurrency, getCurrencyName } from "../../utils/Filters";
import BaseScreen from "../BaseScreen";
import Consts from "../../../app/utils/Consts";
import HeaderProfitAndLoss from "./HeaderProfitAndLoss";

class ProfitAndLossScreen extends BaseScreen {
  state = {
    start_date: moment(new Date()).subtract(1, 'months'),
    end_date: new Date(),
    transactions: [],
    statsPrices: {},
    sum: {}
  }

  componentDidMount() {
    this._loadData();
    this._loadPrices();
  }

  getStartingBalanceByCoin(coin) {
    return new BigNumber(coin.ending_balance).plus(coin.credit).minus(coin.debit).toString();
  }

  getIncreaseBalanceByCoin(coin) {
    return new BigNumber(coin.ending_balance).plus(coin.withdraw).minus(coin.deposit).minus(this.getStartingBalanceByCoin(coin)).toString();
  }

  getPercentIncreaseBalance(increase, startBalance) {
    if (increase === "0") {
      return '0%';
    }
    if (startBalance === "0") {
      return "100%";
    }
    return new BigNumber(increase).div(startBalance).times(100).toFixed(2).toString();
  }

  async _loadData() {
    try {
      const { start_date, end_date, transactions } = this.state;
      const parseStartDate = moment(start_date).format('x');
      const parseEndDate = moment(end_date).format('x');
      const params = {
        start: parseStartDate,
        end: parseEndDate,
      };

      const responseProfit = await rf.getRequest('TransactionRequest').getStats(params);
      const statsPrices = responseProfit.data.startPrices;

      this.setState({
        transactions: [...transactions, ...responseProfit.data.balances],
        statsPrices
      });

      this._getSum();

    } catch (err) {
      console.log("ProfitHistory._error:", err)
    }
  }

  onPricesUpdated(newPrices) {
    const { prices } = this.state;

    this.setState({ prices: { ...prices, ...newPrices } })
    this._getSum();
  }

  getSocketEventHandlers() {
    return {
      PricesUpdated: this.onPricesUpdated
    }
  }

  async _loadPrices() {
    try {
      const responsePrice = await rf.getRequest('PriceRequest').getPrices();

      this.onPricesUpdated(responsePrice.data);
    } catch (err) {
      console.log("LoadPrices._error:", err)
    }

  }

  _calculateSum(title, startPrice, value) {
    return (new BigNumber(title).times(startPrice).integerValue()).plus(value).toString();
  }

  _getSum() {
    const { statsPrices, transactions, prices } = this.state;
    let sum = {};

    sum.deposit = '0';
    sum.withdraw = '0';
    sum.endingBalance = '0';
    sum.startingBalance = '0';
    sum.increaseBalance = '0';

    transactions.forEach(trans => {
      let price = 1;
      let startPrice = 1;

      if (trans.currency !== 'krw') {
        const priceCurrency = prices['krw_' + trans.currency].price;
        const statPriceCurrency = statsPrices['krw_' + trans.currency].price;

        prices['krw_' + trans.currency] ? price = priceCurrency : price = 0;
        statsPrices['krw_' + trans.currency] ? startPrice = statPriceCurrency : startPrice = 0;
      }

      sum.deposit = this._calculateSum(trans.deposit, price, sum.deposit);
      sum.withdraw = this._calculateSum(trans.withdraw, price, sum.withdraw);
      sum.endingBalance = this._calculateSum(trans.ending_balance, price, sum.endingBalance);
      sum.startingBalance = this._calculateSum(this.getStartingBalanceByCoin(trans), startPrice, sum.startingBalance);
    });

    sum.increaseBalance = (new BigNumber(sum.endingBalance)).minus(sum.startingBalance).toString();
    sum.percentIncrease = this.getPercentIncreaseBalance(sum.increaseBalance, sum.startingBalance);

    this.setState({ sum })

  }

  _searchByDate() {
    this.setState({ page: 1, transactions: [] }, () => {
      this._loadData();
      this._getSum();
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

  _renderButtonSeach() {
    return (
      <TouchableWithoutFeedback onPress={() => this._searchByDate()}>
        <View style={styles.searchContainer}>
          <Text style={styles.textSearch}>{I18n.t('transactions.search')}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  _checkDecrease(item) {
    if (item.includes('-')) {
      return true;
    }

    return false;
  }

  _renderSum() {
    const { sum } = this.state;

    if (sum.deposit) {
      return (
        <View style={styles.itemContainer}>
          <View style={styles.currencyGroup}>
            <Text style={[styles.itemCurrency, { fontWeight: 'bold' }]}>{I18n.t('transactions.profit.titleSum')}</Text>
          </View>

          <View style={styles.profitGroup}>
            <Text style={[styles.itemBalance, { fontWeight: 'bold' }]}>{sum.startingBalance}</Text>
            <Text style={[styles.itemBalance, { fontWeight: 'bold' }]}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>

          </View>

          <View style={styles.profitGroup}>
            <Text style={[styles.itemDeposit, { fontWeight: 'bold' }]}>{sum.deposit}</Text>
            <Text style={[styles.itemDeposit, { fontWeight: 'bold' }]}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>
          </View>

          <View style={styles.profitGroup}>
            <Text style={[styles.itemWithDrawl, { fontWeight: 'bold' }]}>{sum.withdraw}</Text>
            <Text style={[styles.itemWithDrawl, { fontWeight: 'bold' }]}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>
          </View>

          <View style={styles.profitGroup}>
            <Text style={[styles.itemBalance, { fontWeight: 'bold' }]}>{sum.endingBalance}</Text>
            <Text style={[styles.itemBalance, { fontWeight: 'bold' }]}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>
          </View>

          <View style={styles.profitGroup}>
            <Text
              style={this._checkDecrease(sum.increaseBalance) ? styles.decreaseSumChange : styles.increaseSumChange}>
              {sum.increaseBalance}
            </Text>
            <Text
              style={this._checkDecrease(sum.increaseBalance) ? styles.decreaseSumChange : styles.increaseSumChange}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>
          </View>

          <View style={[styles.profitGroup, { marginRight: scale(10) }]}>
            <Text
              style={this._checkDecrease(sum.percentIncrease) ? styles.decreaseSumChange : styles.increaseSumChange}>{sum.percentIncrease}</Text>
          </View>
        </View>
      )
    }

  }

  _renderItem({ item }) {
    const startBalance = this.getStartingBalanceByCoin(item);
    const increase = this.getIncreaseBalanceByCoin(item);
    const percent = this.getPercentIncreaseBalance(increase, startBalance) + '%';

    return (
      <View style={styles.itemContainer}>
        <View style={styles.currencyGroup}>
          <Text style={[styles.itemCurrency, { fontWeight: 'bold' }]}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={styles.profitGroup}>
          <Text style={[styles.itemDeposit]}>{startBalance}</Text>
          <Text style={[styles.itemBalance]}>{getCurrencyName(item.currency)}</Text>

        </View>

        <View style={styles.profitGroup}>
          <Text style={styles.itemDeposit}>{formatCurrency(item.deposit, item.currency)}</Text>
          <Text style={styles.itemDeposit}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={styles.profitGroup}>
          <Text style={styles.itemWithDrawl}>{formatCurrency(item.deposit, item.currency)}</Text>
          <Text style={styles.itemWithDrawl}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={styles.profitGroup}>
          <Text style={[styles.itemBalance]}>{formatCurrency(item.ending_balance, item.currency)}</Text>
          <Text style={[styles.itemBalance]}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={styles.profitGroup}>
          <Text
            style={this._checkDecrease(increase) ? styles.decreaseChange : styles.increaseChange}>
            {increase}
          </Text>
          <Text
            style={this._checkDecrease(increase) ? styles.decreaseChange : styles.increaseChange}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={[styles.profitGroup, { marginRight: scale(10) }]}>
          <Text style={this._checkDecrease(percent) ? styles.decreaseChange : styles.increaseChange}>{percent}</Text>
        </View>
      </View>
    )
  }

  render() {
    const { transactions } = this.state;
    const titles = [I18n.t('transactions.profit.type'), I18n.t('transactions.profit.excess'),
      I18n.t('transactions.profit.totalDeposit'), I18n.t('transactions.profit.totalWithDrawl'),
      I18n.t('transactions.profit.endingBalance'), I18n.t('transactions.profit.inscreaseAssets'), I18n.t('transactions.profit.rateChange')];

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
            <HeaderProfitAndLoss titles={titles}/>
            {this._renderSum()}
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

export default ProfitAndLossScreen;

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
    borderBottomColor: '#000',
    borderBottomWidth: '0.6@s'
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
  itemCurrency: {
    color: CommonColors.mainText,
    fontSize: '12@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemDeposit: {
    color: CommonColors.increased,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemWithDrawl: {
    color: CommonColors.decreased,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular'
  },
  itemBalance: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular'
  },
  increaseChange: {
    color: CommonColors.increased,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular',
  },
  decreaseChange: {
    color: CommonColors.decreased,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular',
  },
  decreaseSumChange: {
    color: CommonColors.decreased,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold'
  },
  increaseSumChange: {
    color: CommonColors.increased,
    fontSize: '10@s',
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold'
  },
  profitGroup: {
    width: '100@s',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  currencyGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '50@s',
    borderRightColor: CommonColors.separator,
    borderRightWidth: '1@s',
  },
  viewDatePicker: {
    flexDirection: 'row',
    height: '40@s',
    alignItems: 'center'
  },
  viewSymbol: {
    alignSelf: 'center',
    marginLeft: '10@s'
  }
});