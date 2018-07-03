import React from 'react';
import {
  PixelRatio,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  SafeAreaView
} from 'react-native';
import Modal from "react-native-modal";
import BaseScreen from '../BaseScreen';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import rf from '../../libs/RequestFactory';
import Numeral from '../../libs/numeral';
import MasterdataUtils from '../../utils/MasterdataUtils';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import { filter, pickBy, startsWith, orderBy } from 'lodash'
import Utils from '../../utils/Utils'
import TradingGeneralScreen from './TradingGeneralScreen';
import TradingOrderBookScreen from './TradingOrderBookScreen';
import TradingChartScreen from './TradingChartScreen';
import TradingConclusionScreen from './TradingConclusionScreen';
import I18n from '../../i18n/i18n';
import Consts from '../../utils/Consts';
import { ListItem, List, Icon } from 'react-native-elements';
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters';
import { CommonColors, CommonStyles } from '../../utils/CommonStyles';

const TradeTabs = TabNavigator(
  {
    General: {
      screen: props => <TradingGeneralScreen {...props}/>,
      navigationOptions: () => ({
        tabBarLabel: 'General'
      })
    },
    Order: {
      screen: TradingOrderBookScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Order'
      })
    },
    Chart: {
      screen: TradingChartScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Chart'
      })
    },
    Conclusion: {
      screen: TradingConclusionScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Conclusion'
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;

      },
      header: null,
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'top',
    tabBarOptions: {
      style: {
        backgroundColor: '#11151C',
        height: PixelRatio.getPixelSizeForLayoutSize(15),
        elevation: 0,
        borderTopWidth: 0,
      },
      labelStyle: {
        fontSize: 14 * PixelRatio.getFontScale(),
      },
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
    animationEnabled: false,
    swipeEnabled: true,
  })

export default class TradingScreen extends BaseScreen {

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      itemSelected: {},
      currency: 'krw',
      coin: 'btc',
      symbols: [],
      prices: {},
      balances: {}
    }
  }

  componentDidMount() {
    super.componentDidMount()
    this._loadData()
  }

  getSocketEventHandlers() {
    return {
      PricesUpdated: this._onPriceUpdated.bind(this),
      BalanceUpdated: this._onBalanceUpdated.bind(this)
    };
  }

  _getCurrency() {
    return this.state.currency;
  }

  _getCoin() {
    return this.state.coin;
  }

  async _loadData() {
    await this._getSymbols()
    await this._getPrices()
    await this._getBalance()
  }

  async _getSymbols() {
    try {
      let symbolResponse = await rf.getRequest('MasterdataRequest').getAll();
      let symbols = filter(symbolResponse.coin_settings, ['currency', this.state.currency]);
      symbols.map(symbol => {
        symbol.key = symbol.currency + '_' + symbol.coin;
        return symbol;
      });

      this.setState({ symbols });
    } catch (err) {
      console.log('TradingScreen._getSymbols', err);
    }
  }

  async _getPrices() {
    try {
      let priceResponse = await rf.getRequest('PriceRequest').getPrices();
      let prices = priceResponse.data;

      this._onPriceUpdated(prices);
    } catch (err) {
      console.log('TradingScreen._getPrices', err);
    }
  }

  _onPriceUpdated(data) {
    const prices = Object.assign({}, this.state.prices, data);
    this.setState({ prices });
  }

  async _getBalance() {
    try {
      let response = await rf.getRequest('UserRequest').getBalance()
      this._onBalanceUpdated(response.data);
    } catch (err) {
      console.log('TradingScreen._getBalance', err);
    }
  }

  _onBalanceUpdated(data) {
    const balances = Object.assign({}, this.state.balances, data);
    this.setState({ balances });
  }

  _getPrice() {
    const key = Utils.getPriceKey(this._getCurrency(), this._getCoin());
    return this.state.prices[key] || {};
  }

  _getCoinBalance() {
    return this.state.balances[this._getCoin()] || {};
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.main}>
          {this._renderHeader()}
          <TradeTabs
            style={styles.body}
            screenProps={{
              coin: this._getCoin(),
              currency: this._getCurrency()
            }}/>
          {this._renderSymbolSelector()}
        </View>
      </SafeAreaView>
    );
  }

  _renderHeader() {
    const priceData = this._getPrice();
    const balanceData = this._getCoinBalance();
    const priceColor = this._getChangeColor(priceData.change);
    const profit = this._getProfit(balanceData);
    const profitColor = this._getChangeColor(profit);

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerContent}
            onPress={() => this.setState({ modalVisible: true })}>
            <View style={styles.caretContainer}>
              <Icon name='triangle-down' type='entypo' size={scale(18)}/>
            </View>
            <Text>{this._getCurrencyName(this._getCoin())}</Text>
            <Text style={CommonStyles.bold}>{' / ' + getCurrencyName(this._getCurrency())}</Text>
          </TouchableOpacity>
          <View style={[styles.headerContent, priceData.price ? {} : {opacity: 0}]}>
            <Text style={[styles.price, {color: priceColor}]}>{formatCurrency(priceData.price, this._getCurrency)}</Text>
            <Icon
              name={priceData.change >= 0 ? 'triangle-up' : 'triangle-down'}
              type='entypo'
              color={priceColor}
              size={scale(15)}
              containerStyle={styles.changeIndicator}/>
            <Text style={[styles.pricePercent, {color: priceColor}]}>{formatPercent(priceData.change)}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.headerContent}>
            <Text style={styles.balanceLabel}>{I18n.t('tradeScreen.balance')}</Text>
            <Text style={styles.balance}>{formatCurrency(balanceData.balance, this._getCoin())}</Text>
            <Text style={styles.balanceCurrency}>{getCurrencyName(this._getCurrency())}</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.balanceLabel}>{I18n.t('tradeScreen.profit')}</Text>
            <Text style={[styles.profit, {color: profitColor}]}>{Numeral(profit).format("0.00")}</Text>
            <Text style={[styles.balanceCurrency, {color: profitColor}]}>%</Text>
          </View>
        </View>
      </View>
    );
  }

  _getCurrencyName(currency) {
    const key = 'currency.' + currency + '.fullname';
    return I18n.t(key);
  }

  _getChangeColor(value) {
    let color = '#000';
    if (value > 0) {
      color = CommonColors.increased;
    } else if (value < 0) {
      color = CommonColors.decreased;
    }
    return color;
  }

  _getProfit(balanceData) {
    let profit = 0;
    if (balanceData.krm_amount) {
      profit = (balanceData.krm_amount - balanceData.balance * priceData.price) / balanceData.krm_amount;
    }
    return profit;
  }

  _renderSymbolSelector() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => { }}>
        <View style={styles.popup}>
          <List containerStyle={styles.coinList} >
            <FlatList
              data={this.state.symbols}
              keyExtractor={item => item.key + "_" + item.id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <ListItem
                  onPress={() => this.setState({ currency: item.currency, coin: item.coin, modalVisible: false })}
                  hideChevron
                  key={item.key + "_" + item.id}
                  title={this._getCurrencyName(item.coin) + ' ' + getCurrencyName(item.coin) + '/' + getCurrencyName(item.currency)}
                  titleStyle={styles.itemText}
                  containerStyle={styles.item} />
              )} />
          </List>
        </View>
      </Modal>
    );
  }
}

const styles = ScaledSheet.create({
  main: {
    flex: 1,
    flexDirection: 'column'
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerLeft: {
    flex: 0.8,
    marginLeft: '10@s'
  },
  headerRight: {
    flex: 1
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  caretContainer: {
    width: '20@s',
    height: '20@s',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBCBCB',
    borderRadius: '3@s',
    marginRight: '10@s'
  },
  price: {
    fontSize: '16@s'
  },
  pricePercent: {
    fontSize: '10@s',
    marginTop: '5@s'
  },
  changeIndicator: {
    marginTop: '5@s'
  },
  balanceLabel: {
    color: '#595959',
    fontSize: '12@s'
  },
  balance: {
    flex: 1,
    textAlign: 'right'
  },
  profit: {
    flex: 1,
    textAlign: 'right'
  },
  balanceCurrency: {
    width: '30@s',
    fontSize: '10@s',
    marginLeft: '5@s'
  },

  popup: {
    justifyContent: "center",
    alignItems: "center"
  },
  coinList: {
    width: '270@s',
    backgroundColor: '#515151'
  },
  item: {
    height: '50@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemText: {
    color: '#D9D9D9',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  separator: {
    height: 0.5,
    width: '100%',
    backgroundColor: "#5F5F5F"
  }
});