import React from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Modal
} from 'react-native';
import BaseScreen from '../BaseScreen'
import MasterdataUtils from '../../utils/MasterdataUtils'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { Icon } from 'react-native-elements'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import AppConfig from '../../utils/AppConfig';
import AppPreferences from '../../utils/AppPreferences';
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters';

export default class FundsScreen extends BaseScreen {

  constructor(props) {
    super(props)
    this.state = {
      symbols: [],
      amountTotal: 0,
      priceTotal: 0,
      yield: 0,
      openHelp: false,
    }
    this.currency = 'krw'
  }

  componentDidMount() {
    super.componentDidMount()
    this._loadData()
  }

  async _loadData() {
    await this._getSymbols()
    await this._getPrices()
  }

  async _getSymbols() {
    try {
      let result = await Promise.all([
        rf.getRequest('UserRequest').getBalance(),
        MasterdataUtils.getCurrenciesAndCoins()
      ])

      let coinList = result[0].data;
      //CurrenciesAndCoins
      result[1].map((coin, index) => {
        coinList[coin] = result[0].data[coin] ? { ...result[0].data[coin] } : {}
        coinList[coin].name = coin
        coinList[coin].code = coin
        coinList[coin].icon = AppConfig.getAssetServer() + '/images/color_coins/' + coin + '.png'
      });

      this._onBalanceUpdated(coinList);
    } catch (err) {
      console.log('Error in FundsScreen._getSymbols: ', err)
    }
  }

  async _getPrices() {
    try {
      let priceResponse = await rf.getRequest('PriceRequest').getPrices();
      this._onPricesUpdated(priceResponse.data);
    } catch (err) {
      console.log('FundsScreen._getPrices', err);
    }
  }

  getSocketEventHandlers() {
    return {
      PricesUpdated: this._onPricesUpdated.bind(this),
      BalanceUpdated: this._onBalanceUpdated.bind(this)
    }
  }

  _onBalanceUpdated(newAccountBalances, ) {
    // console.log('newAccountBalances', newAccountBalances)
    for (balance in newAccountBalances) {
      if (!newAccountBalances[balance].name) {
        newAccountBalances[balance].name = balance
      }
    }

    this.accountBalances = Object.assign({}, this.accountBalances, newAccountBalances);
    // console.log('this.accountBalances ', Object.values(this.accountBalances))

    let balanceList = Object.values(this.accountBalances)

    this._updateState(balanceList);
  }

  _onPricesUpdated(prices) {
    const coinList = this.state.symbols
    coinList.map((coin, index) => {
      if (coin.code.toLowerCase() === this.currency) {
        coinList[index] = Object.assign({}, coinList[index], { price: 1 })
      } else if (prices[this.currency + "_" + coin.code.toLowerCase()]) {
        coinList[index] = Object.assign({}, coinList[index], prices[this.currency + "_" + coin.code.toLowerCase()])
      }
    })

    this._updateState(coinList);
  }

  _updateState(symbols) {
    const amountTotal = symbols.reduce(function (total, symbol) {
      if (symbol.code.toLowerCase() === 'krw') return total + parseFloat(symbol.balance)
      else return total + parseFloat(symbol.krw_amount)
    }, 0)
    const priceTotal = symbols.reduce(function (total, symbol) {
      return total + parseFloat(symbol.balance * symbol.price)
    }, 0)

    symbols.map((symbol, index) => {
      if (symbol.code.toLowerCase() !== 'krw') {
        if (symbol.krw_amount != 0) {
          symbols[index].yield = parseFloat((symbol.balance * symbol.price - symbol.krw_amount) / symbol.krw_amount)
        } else {
          symbols[index].yield = parseFloat(0)
        }
      }
    })

    this.setState({
      symbols,
      amountTotal,
      priceTotal,
      yield: amountTotal != 0 ? ((priceTotal - amountTotal) / amountTotal) : 0.00
    })
  }

  render() {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Icon name="assessment" />
              <Text>{I18n.t('funds.assetStatus')}</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLeft}>{I18n.t('funds.totalNumberOfCoin')}</Text>
                <Text style={styles.infoRowRight}>
                  {formatCurrency(this.state.amountTotal, this.currency)}
                  <Text style={{ fontSize: 11 }}>{I18n.t('funds.currency')}</Text>
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLeft}>{I18n.t('funds.coinValuation')}</Text>
                <Text style={styles.infoRowRight}>
                  {formatCurrency(this.state.priceTotal, this.currency)}
                  <Text style={{ fontSize: 11 }}>{I18n.t('funds.currency')}</Text></Text>
              </View>
              <View style={styles.infoRow}>
                <TouchableOpacity
                  style={[styles.infoRowLeft, { flexDirection: 'row' }]}
                  onPress={() => this.setState({ openHelp: true })}>
                  <Text>{I18n.t('funds.ratingYeild')}</Text>
                  <Icon name="help" size={15} />
                </TouchableOpacity>
                <Text style={styles.infoRowRight}>{formatPercent(this.state.yield)}</Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.tableHeader}>
              <Text style={{ flex: 1 }}>{I18n.t('funds.division')}</Text>
              <Text style={{ flex: 1 }}> {I18n.t('funds.quantity')}</Text>
              <Text style={{ flex: 0.8 }}>{I18n.t('funds.profitAndLoss')}<Text style={{ fontSize: 11 }}>%</Text></Text>
              <Text style={{ flex: 1 }}>{I18n.t('funds.valuation')}<Text style={{ fontSize: 11 }}>({I18n.t('funds.currency')})</Text></Text>
            </View>
            <ScrollView>
              {
                this.state.symbols.map((symbol, index) => (
                  <View
                    key={symbol + "_" + index}
                    style={styles.tableRow}>
                    <View style={styles.tableRowDetail}>
                      <Image
                        style={{ width: 24, height: 24 }}
                        source={{ uri: symbol.icon }} />
                      <Text>{symbol.code.toUpperCase()}</Text>
                    </View>
                    <Text style={{ flex: 1, fontSize: 12 }}>
                      {symbol.code.toUpperCase() !== 'KRW' && parseFloat(symbol.balance)}
                    </Text>
                    <Text style={[{ flex: 0.5 }, symbol.yield > 0 ? { color: 'red' } : { color: 'blue' }]}>
                      {symbol.code.toUpperCase() !== "KRW" && formatPercent(symbol.yield)}
                      {/* {symbol.code.toUpperCase() !== "KRW" && <Text style={{ fontSize: 11 }}>%</Text>} */}
                    </Text>
                    <Text
                      style={[{ flex: 1, fontSize: 11 },
                      symbol.yield > 0 ? { color: 'red' } : { color: 'blue' },
                      symbol.code.toUpperCase() === 'KRW' ? { color: 'black' } : {}]}>
                      {(symbol.balance * symbol.price)}
                    </Text>
                  </View>
                ))
              }
            </ScrollView>
          </View>
          <View
            style={{
              flexDirection: "row", height: 30, backgroundColor: '#c7d2e2',
              alignItems: 'center', justifyContent: 'center', borderTopWidth: 1
            }}>
            <Text style={{ flex: 1, fontWeight: 'bold' }}>{I18n.t('funds.total')}</Text>
            <Text style={{ flex: 1 }}></Text>
            <Text style={{ flex: 0.8, fontWeight: 'bold', color: 'red' }}>{formatPercent(this.state.yield)}</Text>
            <Text style={{ flex: 1.5, fontWeight: 'bold', color: 'red' }}>{formatCurrency(this.state.priceTotal, this.currency)}</Text>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.openHelp}
          onRequestClose={() => { }}>
          <SafeAreaView>
            <View style={{ alignContent: 'flex-end', justifyContent: 'flex-end', borderBottomWidth: 1 }}>
              <TouchableOpacity onPress={() => this.setState({ openHelp: false })}>
                <Icon name="close" size={20} />
              </TouchableOpacity>
            </View>
            <View><Text>Help Content</Text></View>
          </SafeAreaView>
        </Modal>

      </SafeAreaView>
    )
  }
}

const styles = ScaledSheet.create({
  fullScreen: { flex: 1 },
  content: { flex: 1, flexDirection: "column" },
  header: { height: 80, flexDirection: "row", borderBottomWidth: 1 },
  logo: { flex: 1, flexDirection: "row", alignItems: 'center', justifyContent: 'center' },
  info: { flex: 2, flexDirection: "column", alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: "row", alignItems: 'center', justifyContent: 'center' },
  infoRowLeft: { flex: 1 },
  infoRowRight: { flex: 1.5 },
  tableHeader: {
    flexDirection: "row", height: 30, backgroundColor: '#c7d2e2',
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1
  },
  tableRow: {
    flexDirection: "row", height: 40,
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1
  },
  tableRowDetail: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }


});