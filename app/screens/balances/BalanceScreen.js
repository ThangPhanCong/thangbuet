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
import AppConfig from '../../utils/AppConfig'
import AppPreferences from '../../utils/AppPreferences'
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters'
import HeaderBalance from './HeaderBalance'

export default class BalanceScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      symbols: [],
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
      });

      this._onBalanceUpdated(coinList);
    } catch (err) {
      console.log('Error in BalanceScreen._getSymbols: ', err)
    }
  }

  async _getPrices() {
    try {
      let priceResponse = await rf.getRequest('PriceRequest').getPrices();
      this._onPricesUpdated(priceResponse.data);
    } catch (err) {
      console.log('BalanceScreen._getPrices', err);
    }
  }

  getSocketEventHandlers() {
    return {
      PricesUpdated: this._onPricesUpdated.bind(this),
      BalanceUpdated: this._onBalanceUpdated.bind(this)
    }
  }

  _onBalanceUpdated(newAccountBalances, ) {
    console.log('newAccountBalances', newAccountBalances)
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
    // console.log('prices', prices)
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
    const assetsValuation = symbols.reduce(function (total, symbol) {
      return total + parseFloat(symbol.balance * symbol.price)
    }, 0)

    this.setState({ symbols, assetsValuation })
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
                this.state.symbols.map((symbol, index) => (
                  <View
                    key={symbol + "_" + index}
                    style={styles.tableRow}>
                    <View style={styles.tableRowDetail}>
                      <Image
                        style={styles.imageSize}
                        source={{ uri: symbol.icon }} />
                      <Text>{symbol.code.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.balance}>
                      {symbol.code.toUpperCase() !== 'KRW' && parseFloat(symbol.balance)}
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
                          this.navigate('WithdrawalKRW', { symbol })
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