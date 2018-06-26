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
import { withNavigationFocus } from 'react-navigation';

class DepositScreen extends BaseScreen {
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
    const assetsValuation = symbols.reduce(function (total, symbol) {
      return total + parseFloat(symbol.balance * symbol.price)
    }, 0)

    this.setState({ symbols, assetsValuation })
  }

  render() {
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.content}>
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
          <View style={{ height: 40, marginLeft: 5, marginRight: 5, marginBottom: 10, marginTop: 5, borderWidth: 1, flexDirection: 'row' }}>
            <TextInput style={{ flex: 1, textAlign: 'center' }} placeholder='검색' underlineColorAndroid='rgba(0, 0, 0, 0)' autoCorrect={false} />
            <Icon name="search" size={20} />
          </View>
          <ScrollView style={{ flex: 1 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}><Text>BTC {I18n.t('deposit.title')}</Text></View>
            <View style={{ flexDirection: 'column' }}>
              <View style={{ flexDirection: 'row' }}>
                <Text>{I18n.t('disposit.account')}</Text>
                <Text>13123123123<Text>{I18n.t('funds.currency')}</Text></Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }
}

export default withNavigationFocus(DepositScreen)

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