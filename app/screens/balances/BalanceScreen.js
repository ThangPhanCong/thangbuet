import React from 'react';
import { TouchableOpacity, Image, SafeAreaView, ScrollView, Text, View } from 'react-native';
import BaseScreen from '../BaseScreen'
import MasterdataUtils from '../../utils/MasterdataUtils'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import AppConfig from '../../utils/AppConfig'
import HeaderBalance from './HeaderBalance'
import { getCurrencyName } from '../../utils/Filters'
import { Icon } from 'react-native-elements'
import { CommonColors, CommonSize, CommonStyles, Fonts } from '../../utils/CommonStyles'

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
          <View style={styles.logo}>
            <Image
              resizeMode="contain"
              style={styles.iconLogo}
              source={require('../../../assets/balance/logo_tab3.png')} />
            <Text style={[styles.fontNotoSansBold]}>
              {I18n.t('balances.depositAndWithdrawal')}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.textHeader]}>{I18n.t('balances.coin')}</Text>
              <Text style={[styles.textHeader, { textAlign: 'right' }]}> {I18n.t('balances.quantity')}</Text>
              <Text style={[styles.textHeader, { flex: 1.4}]}>{I18n.t('balances.action')}</Text>
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
                      <Text style={styles.rowCoinName}>{getCurrencyName(symbol.code)}</Text>
                    </View>
                    <Text style={[styles.balance, styles.rowNumber]}>
                      {symbol.code !== 'krw' && parseFloat(symbol.balance)}
                    </Text>
                    <View style={styles.action}>
                      <TouchableOpacity
                        style={styles.btnRow}
                        onPress={() => {
                          if (symbol.code == 'krw') {
                            this.navigate('DepositKRW', { symbol })
                          } else {
                            this.navigate('Deposit', { symbol })
                          }
                        }}>
                        <Text style={styles.btnText}>{I18n.t('balances.deposit')}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnRow}
                        onPress={() => {
                          if (symbol.code == 'krw') {
                            this.navigate('WithdrawalKRW', { symbol })
                          } else {
                            this.navigate('Withdrawal', { symbol })
                          }
                        }}>
                        <Text style={styles.btnText}>{I18n.t('balances.withdrawal')}</Text>
                      </TouchableOpacity>
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
  fullScreen: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, flexDirection: "column" },
  header: { height: '80@s', flexDirection: "row", },
  logo: {
    height: '50@s', flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start',
    borderBottomWidth: '1@s', borderColor: 'rgba(222, 227, 235, 1)'
  },
  info: { flex: 2, flexDirection: "column", alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: "row", alignItems: 'center', justifyContent: 'center' },
  infoRowLeft: { flex: 1 },
  infoRowRight: { flex: 1.5 },
  tableHeader: {
    flexDirection: "row", height: '30@s', backgroundColor: 'rgba(248, 249, 251, 1)',
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: '1@s',
    borderColor: 'rgba(239, 241, 245, 1)'
  },
  tableRow: {
    flexDirection: "row", height: '40@s', borderColor: 'rgba(239, 241, 245, 1)',
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: '1@s'
  },
  tableRowDetail: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  imageSize: { width: '20@s', height: '20@s', margin: '10@s' },
  balance: { flex: 1 },
  action: { flex: 1.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconLogo: { height: '20@s', width: '20@s', margin: '2@s', marginLeft: '15@s', },
  fontNotoSansRegular: { ...Fonts.NotoSans_Regular, fontSize: '14@s' },
  fontNotoSansBold: { ...Fonts.NotoSans_Bold, fontSize: '14@s' },
  fontSize12: { fontSize: '12@s' },
  textHeader: { flex: 1, textAlign: 'center', ...Fonts.NotoSans_Regular, fontSize: '12@s' },
  rowCoinName: { ...Fonts.OpenSans, fontWeight: 'bold', fontSize: '12@s', textAlign: 'left' },
  rowNumber: { ...Fonts.OpenSans, fontSize: '12@s', textAlign: 'right' },
  btnText: {
    ...Fonts.NanumGothic_Bold, fontSize: '12@s', color: 'rgba(0, 0, 0, 1)',
    paddingLeft: '15@s', paddingRight: '15@s'
  },
  btnRow: {
    height: '25@s', margin: '5@s', backgroundColor: 'rgba(222, 227, 235, 1)',
    justifyContent: 'center', alignItems: 'center', borderWidth: '1@s', borderRadius: '4@s',
    borderColor: 'rgba(222, 227, 235, 0.1)'

  }
});