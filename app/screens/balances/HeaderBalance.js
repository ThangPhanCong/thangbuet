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
  Modal,
  Button
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

export default class HeaderBalance extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      assetsValuation: 0,
      symbols: [],
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
      this.setState({ symbols, assetsValuation, prices })
    } else {
      this.setState({ symbols, assetsValuation })
    }
  }

  render() {
    return (
      <View>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Icon name="assessment" />
            <Text>{I18n.t('balances.depositAndWithdrawal')}</Text>
          </View>
          <View style={styles.info}>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLeft}>{I18n.t('balances.totalAssets')}</Text>
              <Text style={styles.infoRowRight}>
                {formatCurrency(this.state.assetsValuation, this.currency)}
                <Text style={{ fontSize: 11 }}>{I18n.t('balances.currency')}</Text>
              </Text>
            </View>
          </View>
        </View>
        <View style={{
          flexDirection: 'row', height: 25, marginLeft: 5, marginRight: 5, marginBottom: 10, marginTop: 5,
          borderWidth: 1, borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.3)"
        }}>
          <TextInput style={{ flex: 1, textAlign: 'center' }} placeholder='검색' underlineColorAndroid='rgba(0, 0, 0, 0)' autoCorrect={false} />
          <Icon name="search" size={20} />
        </View>
      </View>
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
  tableRowDetail: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }
});