import React from 'react';
import { Button, Image, SafeAreaView, ScrollView, Text, View } from 'react-native';
import BaseScreen from '../BaseScreen'
import MasterdataUtils from '../../utils/MasterdataUtils'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import AppConfig from '../../utils/AppConfig'
import HeaderBalance from './HeaderBalance'
import { getCurrencyName } from '../../utils/Filters'

export default class BalanceScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      symbolArr: [],
      symbols: {},
      assetsValuation: 0
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
        coinList[coin].price = 1
      })

      this._updateState(coinList)
    } catch (err) {
      console.log('Error in HeaderScreen._getSymbols: ', err)
    }
  }

  async _getPrices() {
    try {
      let priceResponse = await rf.getRequest('PriceRequest').getPrices();
      this._onPricesUpdated(priceResponse.data);
    } catch (err) {
      console.log('HeaderScreen._getPrices', err);
    }
  }

  getSocketEventHandlers() {
    return {
      PricesUpdated: this._onPricesUpdated.bind(this),
      BalanceUpdated: this._onBalanceUpdated.bind(this)
    }
  }

  _onBalanceUpdated(symbolsUpdate) {
    const data = this._fillData(symbolsUpdate)

    let symbols = this.state.symbols ? this.state.symbols : {}
    symbols = Object.assign({}, symbols, data)

    this._updateState(symbols)
  }

  _onPricesUpdated(prices) {
    const symbols = this.state.symbols

    for (symbol in symbols) {
      if (symbol.toLowerCase() === this.currency) {
        symbols[symbol] = Object.assign({}, symbols[symbol], { price: 1 })
      } else if (prices[this.currency + "_" + symbol.toLowerCase()]) {
        symbols[symbol] = Object.assign({}, symbols[symbol], prices[this.currency + "_" + symbol.toLowerCase()])
      }
    }

    this._updateState(symbols, prices)
  }

  _fillData(symbols) {
    const prices = this.state.prices

    for (symbol in symbols) {
      symbols[symbol].name = symbol
      symbols[symbol].code = symbol
      symbols[symbol].icon = AppConfig.getAssetServer() + '/images/color_coins/' + symbol + '.png'
      if (symbol.toLowerCase() === this.currency) {
        symbols[symbol] = Object.assign({}, symbols[symbol], { price: 1 })
      } else if (prices[this.currency + "_" + symbol.toLowerCase()]) {
        symbols[symbol] = Object.assign({}, symbols[symbol], prices[this.currency + "_" + symbol.toLowerCase()])
      }
    }

    return symbols
  }

  _updateState(symbols, prices) {
    const symbolArr = Object.values(symbols)

    const assetsValuation = symbolArr.reduce(function (total, symbol) {
      return total + parseFloat(symbol.balance * symbol.price)
    }, 0)

    if (prices) {
      this.setState({ symbols, assetsValuation, symbolArr: Object.values(symbols), prices })
    } else {
      this.setState({ symbols, assetsValuation, symbolArr: Object.values(symbols) })
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.content}>
          <HeaderBalance />
          <View style={{ flex: 1 }}>
            <View style={styles.tableHeader}>
              <Text style={{ flex: 1 }}>{I18n.t('balances.coin')}</Text>
              <Text style={{ flex: 1 }}> {I18n.t('balances.quantity')}</Text>
              <Text style={{ flex: 1 }}>{I18n.t('balances.action')}</Text>
            </View>
            <ScrollView>
              {
                this.state.symbolArr.map((symbol, index) => (
                  <View
                    key={symbol + "_" + index}
                    style={styles.tableRow}>
                    <View style={styles.tableRowDetail}>
                      <Image
                        style={styles.imageSize}
                        source={{ uri: symbol.icon }} />
                      <Text>{getCurrencyName(symbol.code)}</Text>
                    </View>
                    <Text style={styles.balance}>
                      {symbol.code !== 'krw' && parseFloat(symbol.balance)}
                    </Text>
                    <View style={styles.action}>
                      <Button title={I18n.t('balances.deposit')} onPress={() => {
                        if (symbol.code == 'krw') {
                          this.navigate('DepositKRW', { symbol })
                        } else {
                          this.navigate('Deposit', { symbol })
                        }
                      }} />
                      <Button title={I18n.t('balances.withdrawal')} onPress={() => {
                        if (symbol.code == 'krw') {
                          this.navigate('WithdrawalKRW', { symbol })
                        } else {
                          this.navigate('Withdrawal', { symbol })
                        }
                      }} />
                    </View>
                  </View>
                ))
              }
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    )
  }
}

const styles = ScaledSheet.create({
  fullScreen: { flex: 1 },
  content: { flex: 1, flexDirection: "column" },
  header: { height: 40, flexDirection: "row" },
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
  tableRowDetail: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  imageSize: { width: 24, height: 24 },
  balance: { flex: 1, fontSize: 12 },
  action: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start' }
});