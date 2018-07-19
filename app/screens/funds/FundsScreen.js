import React from 'react';
import { Image, Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import BaseScreen from '../BaseScreen'
import MasterdataUtils from '../../utils/MasterdataUtils'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { Icon } from 'react-native-elements'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import AppConfig from '../../utils/AppConfig'
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters'
import { CommonColors, CommonSize, CommonStyles, Fonts } from '../../utils/CommonStyles'
import { scale } from "../../libs/reactSizeMatter/scalingUtils";

export default class FundsScreen extends BaseScreen {

  constructor(props) {
    super(props)
    this.state = {
      symbols: {},
      amountTotal: 0,
      priceTotal: 0,
      yield: 0,
      openHelp: false,
      symbolArr: []
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

  _onBalanceUpdated(symbolsUpdate) {
    const data = this._fillData(symbolsUpdate)

    let symbols = this.state.symbols ? this.state.symbols : {}
    symbols = Object.assign({}, symbols, data)

    this._updateState(symbols)
  }

  _onPricesUpdated(prices) {
    let symbols = this.state.symbols

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
    let symbolArr = Object.values(symbols)

    const amountTotal = symbolArr.reduce(function (total, symbol) {
      if (symbol.code.toLowerCase() === 'krw') return total + parseFloat(symbol.balance)
      else return total + parseFloat(symbol.krw_amount)
    }, 0)
    const priceTotal = symbolArr.reduce(function (total, symbol) {
      return total + parseFloat(symbol.balance * symbol.price)
    }, 0)

    symbolArr.map((symbol, index) => {
      if (symbol.code.toLowerCase() !== 'krw') {
        if (symbol.krw_amount != 0) {
          symbolArr[index].yield = parseFloat((symbol.balance * symbol.price - symbol.krw_amount) / symbol.krw_amount)
        } else {
          symbolArr[index].yield = parseFloat(0)
        }
      }
    })

    this.setState({
      prices,
      symbolArr,
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
              {/* <Icon name="assessment" /> */}
              <Image
                resizeMode="contain"
                style={styles.iconLogo}
                source={require('../../../assets/funds/fundLogo.png')}/>
              <Text style={[styles.fontNotoSansRegular, styles.headerSize14]}>{I18n.t('funds.assetStatus')}</Text>
            </View>
            <View style={styles.info}>
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoRowLeft, styles.fontNotoSansRegular, styles.headerText]}>
                  {I18n.t('funds.totalNumberOfCoin')}
                </Text>
                <Text style={[styles.infoRowRight, styles.fontOpenSans, styles.headerNumber]}>
                  {formatCurrency(this.state.amountTotal, this.currency)}
                </Text>
                <Text style={styles.headerSymbol}>{I18n.t('funds.currency')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoRowLeft, styles.fontNotoSansRegular, styles.headerText]}>
                  {I18n.t('funds.coinValuation')}
                </Text>
                <Text style={[styles.infoRowRight, styles.fontOpenSans, styles.headerNumber, { color: 'red' }]}>
                  {formatCurrency(this.state.priceTotal, this.currency)}
                </Text>
                <Text style={styles.headerSymbol}>{I18n.t('funds.currency')}</Text>
              </View>
              <View style={styles.infoRow}>
                <TouchableOpacity
                  style={[styles.infoRowLeft, { flexDirection: 'row', justifyContent: 'flex-start' }]}
                  onPress={() => this.setState({ openHelp: true })}>
                  <Text style={[styles.fontNotoSansRegular, styles.headerText]}>{I18n.t('funds.ratingYeild')}</Text>
                </TouchableOpacity>

                <View style={styles.iconHelp}>
                  <Icon name="help"
                        size={scale(15)}/>
                </View>
                <Text
                  style={[styles.infoRowRight, styles.fontOpenSans, styles.headerNumber, { color: 'red' }]}>
                  {formatPercent(this.state.yield, true)}
                </Text>
                <Text style={styles.headerSymbol}>{I18n.t('funds.percent')}</Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.tableHeader}>
              <Text
                style={[{ flex: 0.5 }, styles.tableHeaderText]}>{I18n.t('funds.division')}</Text>
              <Text style={[{ flex: 1 }, styles.tableHeaderText]}> {I18n.t('funds.quantity')}</Text>
              <Text style={[{ flex: 0.5 }, styles.tableHeaderText]}>{I18n.t('funds.profitAndLoss')}
                <Text>{I18n.t('funds.percent')}</Text>
              </Text>
              <Text style={[{ flex: 1 }, styles.marginRight10, styles.tableHeaderText]}>{I18n.t('funds.valuation')}
                <Text>({I18n.t('funds.currency')})</Text>
              </Text>
            </View>
            <ScrollView>
              {
                this.state.symbolArr.map((symbol, index) => (
                  <View key={symbol + "_" + index} style={styles.tableRow}>
                    <View style={[{ flex: 0.5 }, styles.tableRowDetail]}>
                      <Image style={styles.iconRow} source={{ uri: symbol.icon }}/>
                      <Text style={styles.rowCoinName}>{getCurrencyName(symbol.code)}</Text>
                    </View>
                    <Text style={[{ flex: 1 }, styles.rowNumber]}>
                      {symbol.code !== 'krw' && parseFloat(symbol.balance)}
                    </Text>
                    <Text style={[
                      { flex: 0.5, fontWeight: 'bold' }, styles.rowNumber,
                      symbol.yield > 0 ? { color: 'red' } : { color: 'blue' }
                    ]}>
                      {symbol.code !== "krw" && formatPercent(symbol.yield)}
                    </Text>
                    <Text
                      style={[{ flex: 1, fontWeight: 'bold' },
                        styles.marginRight10, styles.rowNumber,
                        symbol.yield > 0 ? { color: 'red' } : { color: 'blue' },
                        symbol.code === 'krw' ? { color: 'black' } : {}]}>
                      {formatCurrency(parseFloat(symbol.balance * symbol.price), this.currency)}
                    </Text>
                  </View>
                ))
              }
            </ScrollView>
          </View>
          <View
            style={styles.footer}>
            <Text style={[{ flex: 0.5 }, styles.footerTotalField]}>{I18n.t('funds.total')}</Text>
            <Text style={{ flex: 1 }}></Text>
            <Text style={[{ flex: 0.5 }, styles.footerNumer, styles.footerYield]}>
              {formatPercent(this.state.yield)}
            </Text>
            <Text style={[{ flex: 1 }, styles.footerNumer, styles.marginRight10]}>
              {formatCurrency(this.state.priceTotal, this.currency)}
            </Text>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.openHelp}
          onRequestClose={() => {
          }}>
          <SafeAreaView>
            <View style={{ alignContent: 'flex-end', justifyContent: 'flex-end', borderBottomWidth: 1 }}>
              <TouchableOpacity onPress={() => this.setState({ openHelp: false })}>
                <Icon name="close" size={20}/>
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
  fullScreen: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, flexDirection: "column" },
  header: { height: '80@s', flexDirection: "row", borderBottomWidth: '1@s', borderColor: 'rgba(222, 227, 235, 1)' },
  logo: { flex: 1, flexDirection: "row", alignItems: 'center', justifyContent: 'center' },
  info: { flex: 2, flexDirection: "column", alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: "row", alignItems: 'center', justifyContent: 'center' },
  infoRowLeft: { flex: 1 },
  infoRowRight: { flex: 1.5, textAlign: 'right', marginRight: '5@s' },
  tableHeader: {
    flexDirection: "row", height: '30@s', backgroundColor: 'rgba(248, 249, 251, 1)',
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: '1@s',
    borderColor: 'rgba(239, 241, 245, 1)'
  },
  tableRow: {
    flexDirection: "row", height: '40@s', borderColor: 'rgba(239, 241, 245, 1)',
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: '1@s'
  },
  tableRowDetail: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  fontNotoSansRegular: { ...Fonts.NotoSans_Regular },
  headerText: { fontSize: '12@s', lineHeight: '20@s' },
  fontOpenSans: { ...Fonts.OpenSans },
  headerNumber: { fontSize: '14@s' },
  headerSymbol: { flex: 0.5, fontSize: '8@s', textAlign: 'left', ...Fonts.OpenSans },
  iconLogo: { height: '20@s', width: '20@s', margin: '2@s' },
  tableHeaderText: { ...Fonts.NotoSans_Regular, fontSize: '12@s', textAlign: 'right' },
  iconRow: { width: '20@s', height: '20@s', marginRight: '8@s', marginLeft: '8@s' },
  rowCoinName: { ...Fonts.OpenSans, fontWeight: 'bold', fontSize: '12@s', textAlign: 'left' },
  rowNumber: { ...Fonts.OpenSans, fontSize: '12@s', textAlign: 'right' },
  marginRight10: { marginRight: '10@s' },
  footer: {
    flexDirection: "row", height: '40@s', backgroundColor: 'rgba(255, 255, 255, 1)',
    alignItems: 'center', justifyContent: 'center', borderTopWidth: '1@s',
    borderColor: 'rgba(222, 227, 235, 1)'
  },
  footerTotalField: { fontWeight: 'bold', textAlign: 'left', marginLeft: '30@s', fontSize: '14@s' },
  footerNumer: { fontWeight: 'bold', color: 'red', textAlign: 'right', fontSize: '14@s' },
  footerYield: { marginRight: '8@s' },
  headerSize14: { fontSize: '14@s' },
  iconHelp: { marginBottom: scale(20), flex: 1, alignItems: 'flex-start'}
})