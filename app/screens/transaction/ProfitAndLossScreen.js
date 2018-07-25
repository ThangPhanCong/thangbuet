import React from 'react';
import { FlatList, Text, TouchableWithoutFeedback, View, ScrollView } from "react-native";
import { CommonColors, CommonStyles, Fonts } from "../../utils/CommonStyles";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import I18n from "../../i18n/i18n";
import moment from "moment/moment";
import BitkoexDatePicker from "./common/BitkoexDatePicker";
import rf from "../../libs/RequestFactory";
import BigNumber from 'bignumber.js';
import { formatCurrency, getCurrencyName } from "../../utils/Filters";
import BaseScreen from "../BaseScreen";
import Consts from "../../../app/utils/Consts";
import HeaderProfitAndLoss from "./HeaderProfitAndLoss";
import HeaderProfitRight from "./HeaderProfitRight";
import HeaderProfitCenter from "./HeaderProfitCenter";

class ProfitAndLossScreen extends BaseScreen {
  state = {
    start_date: moment(new Date()).subtract(1, 'months'),
    end_date: new Date(),
    transactions: [],
    statsPrices: {},
    sum: {}
  }

  firstScrollView = null;

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

  _onLeftListScroll(event) {
    if (this.firstScrollView === 'left') {
      const y = event.nativeEvent.contentOffset.y;

      this.flatListRight.scrollToOffset({
        offset: y,
      });
      this.flatListCenter.scrollToOffset({
        offset: y,
      });
    }
  }

  _onCenterListScroll(event) {
    if (this.firstScrollView === 'center') {
      const y = event.nativeEvent.contentOffset.y;

      this.flatListRight.scrollToOffset({
        offset: y,
      });
      this.flatListLeft.scrollToOffset({
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
      this.flatListCenter.scrollToOffset({
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

  _handleCenterMomentumEnd() {
    if (this.firstScrollView === 'center') {
      this.firstScrollView = null;
    }
  }

  _handleCenterMomentumStart() {
    if (this.firstScrollView === null) {
      this.firstScrollView = 'center';
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

  _handleTouchStartCenter() {
    if (this.firstScrollView === null) {
      this.firstScrollView = 'center';
    }
  }

  _handleTouchEndCenter() {
    if (this.firstScrollView === 'center') {
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

  _renderSumLeft() {
    return (
      <View style={[styles.itemContainer, { backgroundColor: '#fffcf5' }]}>
        <View style={styles.currencyGroup}>
          <Text style={styles.itemTitleSum}>{I18n.t('transactions.profit.titleSum')}</Text>
        </View>
      </View>
    )
  }

  _renderSumCenter() {
    const { sum } = this.state;

    if (sum.deposit) {
      return (
        <View style={[styles.itemContainer, { backgroundColor: '#fffcf5' } ]}>
          <View style={styles.profitGroup}>
            <Text style={styles.itemBalanceSum}>{sum.startingBalance}</Text>
            <Text style={styles.itemBalanceSum}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>
          </View>

          <View style={styles.profitGroup}>
            <Text style={styles.itemDepositSum}>{sum.deposit}</Text>
            <Text style={styles.itemDepositSum}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>
          </View>

          <View style={styles.profitGroup}>
            <Text style={styles.itemWithDrawlSum}>{sum.withdraw}</Text>
            <Text style={styles.itemWithDrawlSum}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>
          </View>

          <View style={styles.profitGroup}>
            <Text style={styles.itemBalanceSum}>{sum.endingBalance}</Text>
            <Text style={styles.itemBalanceSum}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>
          </View>

          <View style={styles.profitGroup}>
            <Text
              style={this._checkDecrease(sum.increaseBalance) ? styles.decreaseSumChange : styles.increaseSumChange}>
              {sum.increaseBalance}
            </Text>
            <Text
              style={this._checkDecrease(sum.increaseBalance) ? styles.decreaseSumChange : styles.increaseSumChange}>{Consts.CURRENCY_KRW.toUpperCase()}</Text>
          </View>


        </View>
      )
    }

  }

  _renderSumRight() {
    const { sum } = this.state;

    if (sum.deposit) {
      return (
        <View style={[styles.itemContainer, { backgroundColor: '#fffcf5' }]}>
          <View style={[styles.profitRightGroup, { marginRight: scale(10) }]}>
            <Text
              style={this._checkDecrease(sum.percentIncrease) ? styles.decreaseSumChange : styles.increaseSumChange}>{sum.percentIncrease}</Text>
          </View>
        </View>

      )
    }
  }

  _renderItem({ item }) {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.currencyGroup}>
          <Text style={styles.itemCurrency}>{getCurrencyName(item.currency)}</Text>
        </View>
      </View>
    )
  }

  _renderItemCenter({ item }) {
    const startBalance = this.getStartingBalanceByCoin(item);
    const increase = this.getIncreaseBalanceByCoin(item);

    return (
      <View style={[styles.itemContainer]}>
        <View style={styles.profitGroup}>
          <Text style={[styles.itemStartBalance]}>{startBalance}</Text>
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
        <View style={{width: scale(20)}}></View>

      </View>
    )
  }

  _renderItemRight({ item }) {
    const startBalance = this.getStartingBalanceByCoin(item);
    const increase = this.getIncreaseBalanceByCoin(item);
    const percent = this.getPercentIncreaseBalance(increase, startBalance) + '%';

    return (
      <View style={styles.itemContainer}>
        <View style={[styles.profitRightGroup, { marginRight: scale(10) }]}>
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

        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexDirection: 'column' }}>
            <HeaderProfitAndLoss titles={titles}/>
            {this._renderSumLeft()}
            <FlatList data={transactions}
                      keyExtractor={(item, index) => index.toString()}
                      onScroll={(event) => this._onLeftListScroll(event)}
                      ref={elm => this.flatListLeft = elm}
                      onMomentumScrollStart={() => this._handleLeftMomentumStart()}
                      onMomentumScrollEnd={() => this._handleLeftMomentumEnd()}
                      onTouchStart={()=> this._handleTouchStartLeft()}
                      onTouchEnd={()=> this._handleTouchEndLeft()}
                      renderItem={this._renderItem.bind(this)}
              // onEndReached={this._handleLoadMore.bind(this)}
                      onEndThreshold={100}/>
          </View>

          <ScrollView horizontal={true} contentContainerStyle={{ flexDirection: 'column' }}>
            <HeaderProfitCenter titles={titles}/>
            {this._renderSumCenter()}
            <FlatList data={transactions}
                      keyExtractor={(item, index) => index.toString()}
                      onScroll={(event) => this._onCenterListScroll(event)}
                      ref={elm => this.flatListCenter = elm}
                      onMomentumScrollStart={() => this._handleCenterMomentumStart()}
                      onMomentumScrollEnd={() => this._handleCenterMomentumEnd()}
                      onTouchStart={()=> this._handleTouchStartCenter()}
                      onTouchEnd={()=> this._handleTouchEndCenter()}
                      renderItem={this._renderItemCenter.bind(this)}
              // onEndReached={this._handleLoadMore.bind(this)}
                      onEndThreshold={100}/>
          </ScrollView>

          <View style={styles.profitRightContainer}>
            <HeaderProfitRight titles={titles}/>
            {this._renderSumRight()}
            <FlatList data={transactions}
                      keyExtractor={(item, index) => index.toString()}
                      onScroll={(event) => this._onRightListScroll(event)}
                      ref={elm => this.flatListRight = elm}
                      onMomentumScrollStart={() => this._handleRightMomentumStart()}
                      onMomentumScrollEnd={() => this._handleRightMomentumEnd()}
                      onTouchStart={()=> this._handleTouchStartRight()}
                      onTouchEnd={()=> this._handleTouchEndRight()}
                      renderItem={this._renderItemRight.bind(this)}
              // onEndReached={this._handleLoadMore.bind(this)}
                      onEndThreshold={100}/>
          </View>

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
  itemCurrency: {
    color: CommonColors.mainText,
    fontSize: '12@s',
    ...Fonts.OpenSans_Bold
  },
  itemDeposit: {
    color: CommonColors.increased,
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemDepositSum: {
    color: CommonColors.increased,
    fontSize: '10@s',
    ...Fonts.OpenSans_Bold
  },
  itemWithDrawl: {
    color: CommonColors.decreased,
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemWithDrawlSum: {
    color: CommonColors.decreased,
    fontSize: '10@s',
    ...Fonts.OpenSans_Bold
  },
  itemBalance: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    ...Fonts.OpenSans
  },
  itemBalanceSum: {
    color: CommonColors.mainText,
    fontSize: '10@s',
    ...Fonts.OpenSans_Bold
  },
  increaseChange: {
    color: CommonColors.increased,
    fontSize: '10@s',
    ...Fonts.OpenSans,
  },
  decreaseChange: {
    color: CommonColors.decreased,
    fontSize: '10@s',
    ...Fonts.OpenSans,
  },
  decreaseSumChange: {
    color: CommonColors.decreased,
    fontSize: '10@s',
    ...Fonts.OpenSans_Bold,
  },
  increaseSumChange: {
    color: CommonColors.increased,
    fontSize: '10@s',
    ...Fonts.OpenSans_Bold,
  },
  profitGroup: {
    width: '80@s',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  profitRightGroup: {
    width: '50@s',
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
  },
  profitRightContainer: {
    flexDirection: 'column',
    borderLeftWidth: '1@s',
    borderLeftColor: CommonColors.separator
  },
  itemTitleSum: {
    fontSize: '12@s',
    ...Fonts.OpenSans
  },
  itemStartBalance: {
    fontSize: '10@s',
    ...Fonts.OpenSans
  }
});