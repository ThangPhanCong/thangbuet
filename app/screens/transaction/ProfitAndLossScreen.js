import React, { Component } from 'react';
import { FlatList, Text, TouchableWithoutFeedback, View } from "react-native";
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

class ProfitAndLossScreen extends Component {
  state = {
    start_date: moment(new Date()).subtract(1, 'months'),
    end_date: new Date(),
    transactions: [],
    statsPrices: [],
  }

  componentDidMount() {
    this._loadData();
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
      const responsePrice = responseProfit.data.startPrices;
      let statsPrices = [];

      for (let j in responsePrice) {
        if (responsePrice.hasOwnProperty(j)) {
          let innerObj = {};

          innerObj[j] = responsePrice[j];
          statsPrices.push(innerObj[j]);
        }
      }

      this._calculateSumStartBalance(statsPrices, responseProfit.data.balances);

      this.setState({
        transactions: [...transactions, ...responseProfit.data.balances],
        statsPrices
      })

    } catch (err) {
      console.log("ProfitHistory._error:", err)
    }
  }

  _calculateSumStartBalance(statsPrices, transactions) {
    let sum = 0;
    const findKrw = transactions.find(item => item.currency === 'krw');

    for (let i = 0; i < statsPrices.length; i++) {
      for (let j = 0; j < transactions.length; j++) {
        const startBalance = parseFloat(this.getStartingBalanceByCoin(transactions[j]));

        if (statsPrices[i].currency === 'krw' && statsPrices[i].coin === transactions[j].currency) {
          sum += parseFloat(statsPrices[i].price) * startBalance + parseFloat(this.getStartingBalanceByCoin(findKrw));
        }
      }
    }

    return sum;
  }

  _searchByDate() {
    this.setState({ page: 1, transactions: [] }, () => {
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
    return (
      <View style={styles.itemContainer}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemCurrency, { fontWeight: 'bold' }]}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text style={[styles.itemCurrency]}>{startBalance}</Text>
          <Text style={[styles.itemCurrency]}>{getCurrencyName(item.currency)}</Text>

        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text style={styles.itemDeposit}>{formatCurrency(item.deposit, item.currency)}</Text>
          <Text style={styles.itemDeposit}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text style={styles.itemWithDrawl}>{formatCurrency(item.deposit, item.currency)}</Text>
          <Text style={styles.itemWithDrawl}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text>{formatCurrency(item.ending_balance, item.currency)}</Text>
          <Text style={[styles.itemCurrency]}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text
            style={this._checkDecrease(increase) ? styles.decreaseChange : styles.increaseChange}>
            {increase}
          </Text>
          <Text
            style={this._checkDecrease(increase) ? styles.decreaseChange : styles.increaseChange}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={this._checkDecrease(percent) ? styles.decreaseChange : styles.increaseChange}>{percent}</Text>
        </View>
      </View>
    )
  }

  _renderItem({ item }) {
    const startBalance = this.getStartingBalanceByCoin(item);
    const increase = this.getIncreaseBalanceByCoin(item);
    const percent = this.getPercentIncreaseBalance(increase, startBalance) + '%';

    return (
      <View style={styles.itemContainer}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemCurrency, { fontWeight: 'bold' }]}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text style={[styles.itemCurrency]}>{startBalance}</Text>
          <Text style={[styles.itemCurrency]}>{getCurrencyName(item.currency)}</Text>

        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text style={styles.itemDeposit}>{formatCurrency(item.deposit, item.currency)}</Text>
          <Text style={styles.itemDeposit}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text style={styles.itemWithDrawl}>{formatCurrency(item.deposit, item.currency)}</Text>
          <Text style={styles.itemWithDrawl}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text>{formatCurrency(item.ending_balance, item.currency)}</Text>
          <Text style={[styles.itemCurrency]}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <Text
            style={this._checkDecrease(increase) ? styles.decreaseChange : styles.increaseChange}>
            {increase}
          </Text>
          <Text
            style={this._checkDecrease(increase) ? styles.decreaseChange : styles.increaseChange}>{getCurrencyName(item.currency)}</Text>
        </View>

        <View style={{ flex: 1 }}>
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
        <View style={{ flexDirection: 'row' }}>
          {this._renderDatePicker('start_date')}
          <View style={{ alignSelf: 'center', marginLeft: scale(20) }}>
            <Text>~</Text>
          </View>
          {this._renderDatePicker('end_date')}
          {this._renderButtonSeach()}
        </View>

        <View>
          <HeaderTransaction titles={titles}/>
          <FlatList data={transactions}
                    renderItem={this._renderItem.bind(this)}
            // onEndReached={this._handleLoadMore.bind(this)}
                    onEndThreshold={100}/>
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
    alignItems: 'center',
    flexDirection: 'row',
    height: '50@s',
    borderBottomColor: CommonColors.separator,
    borderBottomWidth: '1@s',
  },
  itemCurrency: {
    color: CommonColors.mainText,
    fontSize: '14@s'
  },
  itemDeposit: {
    color: CommonColors.increased,
    fontSize: '14@s'
  },
  itemWithDrawl: {
    color: CommonColors.decreased,
    fontSize: '14@s'
  },
  increaseChange: {
    color: CommonColors.increased,
    fontSize: '14@s'
  },
  decreaseChange: {
    color: CommonColors.decreased,
    fontSize: '14@s'
  }
});