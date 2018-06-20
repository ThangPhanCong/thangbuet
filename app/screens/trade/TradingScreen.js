import React from 'react';
import {
  PixelRatio,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  FlatList,
  SafeAreaView
} from 'react-native';
import BaseScreen from '../BaseScreen'
import { TabNavigator, TabBarBottom } from 'react-navigation'
import rf from '../../libs/RequestFactory'
import MasterdataUtils from '../../utils/MasterdataUtils';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { filter, pickBy, startsWith, orderBy } from 'lodash';
import Utils from '../../utils/Utils';
import TradingGeneralScreen from './TradingGeneralScreen'
import TradingOrderScreen from './TradingOrderScreen'
import TradingChartScreen from './TradingChartScreen'
import TradingConclusionScreen from './TradingConclusionScreen'
import I18n from '../../i18n/i18n';
import Consts from '../../utils/Consts';
import { ListItem, List } from 'react-native-elements'

const TradeTabs = TabNavigator(
  {
    General: {
      screen: TradingGeneralScreen,
      navigationOptions: () => ({
        tabBarLabel: 'General'
      })
    },
    Order: {
      screen: TradingOrderScreen,
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
      symbols: [],
      prices: {},
    }
  }

  componentDidMount() {
    super.componentDidMount()
    this._loadData()
  }

  getSocketEventHandlers() {
    return {
      PricesUpdated: this._onPriceUpdated.bind(this),
    };
  }

  async _loadData() {
    await this._getSymbols()
    await this._getPrices()
    await this._getBalance()
    this.setState({ itemSelected: this.state.symbols[0] })
    console.log('this.state.symbols[0]', this.state.symbols[0])
  }

  _onPriceUpdated(data) {
    const prices = Object.assign({}, this.state.prices, data);

    let symbols = this.state.symbols;
    for (let symbolKey in data) {
      let [currency, coin] = symbolKey.split('_');
      this._updateSymbolData(symbols, currency, coin, data[symbolKey]);
    }

    this.setState({
      prices,
      symbols: orderBy(symbols, 'price', 'desc')
    });
  }

  _updateSymbolData(symbols, currency, coin, data) {
    let index = symbols.findIndex((item) => {
      return item.currency == currency && item.coin == coin;
    });
    if (index >= 0) {
      Object.assign(symbols[index], data);
    }
  }

  async _getBalance() {
    try {
      let result = await rf.getRequest('UserRequest').getBalance()
      console.log('_getBalance', result)

      let symbols = this.state.symbols;
      for (let symbolKey in result.data) {
        this._updateSymbolData(symbols, this.state.currency, symbolKey, result.data[symbolKey]);
      }

      this.setState({
        symbols: orderBy(symbols, 'price', 'desc')
      });

    } catch (err) {
      console.log('TradingScreen._getBalance', err);
    }
  }

  _getPrice(currency, coin) {
    let key = Utils.getPriceKey(currency, coin);
    const priceObject = this.state.prices[key];
    return priceObject ? priceObject.price : 1;
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

      console.log('symbols', symbols)
    } catch (err) {
      console.log('TradingScreen._getSymbols', err);
    }
  }

  async _getPrices() {
    try {
      let priceResponse = await rf.getRequest('PriceRequest').getPrices();
      let prices = priceResponse.data;

      if (this.state.currency != Consts.CURRENCY_KRW) {
        let key = Utils.getPriceKey(Consts.CURRENCY_KRW, this.state.currency);
        if (prices[key]) {
          this.setState({ currencyPrice: prices[key].price });
        }
      }

      this._onPriceUpdated(prices);
    } catch (err) {
      console.log('TradingScreen._getPrices', err);
    }
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.main}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.headerContent}
                onPress={() => this.setState({ modalVisible: true })}>
                <Image
                  style={{ width: 30, height: 30 }}
                  source={{ uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png' }} />
                <Text>
                  {(this.state.itemSelected.coin + "/" + this.state.itemSelected.currency).toUpperCase()}
                </Text>
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text>{this.state.itemSelected.available_balance * this.state.itemSelected.price}</Text>
                <Image
                  style={{ width: 15, height: 15 }}
                  source={{ uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png' }} />
                <Text>{this.state.itemSelected.change + "%"}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.headerContent}>
                <Text>{"보유 잔고  " + this.state.itemSelected.available_balance + " BTC"}</Text>
              </View>
              <View style={styles.headerContent}>
                {/* //TODO */}
                <Text>수익률 11.26 %</Text>
              </View>
            </View>
          </View>
          <TradeTabs style={styles.body} />

          <Modal
            animationType="slide"
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => { }}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  onPress={() => this.setState({ modalVisible: false })}>
                  <Text style={{ color: '#FFFFFF' }}>Close</Text>
                </TouchableOpacity>
                <FlatList
                  data={this.state.symbols}
                  keyExtractor={item => item.key + "_" + item.id}
                  ItemSeparatorComponent={() => <View style={styles.saparator} />}
                  renderItem={({ item }) =>
                    <TouchableOpacity
                      onPress={() => this.setState({ itemSelected: item, modalVisible: false })}>
                      <Text
                        style={styles.item}
                        key={item.key + "_" + item.id}>
                        {(item.coin + "/" + item.currency).toString().toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  } />
              </View>
            </View>
          </Modal>

        </View>
      </SafeAreaView>
    )
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
    flex: 1,
    // backgroundColor: 'red',
    flexDirection: 'column',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  headerRight: {
    flex: 1,
    // backgroundColor: 'blue'
  },
  modalContent: {
    width: 200,
    height: 400,
    backgroundColor: '#11151C',
    justifyContent: "center",
    alignItems: "center"
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  item: {
    color: '#FFFFFF',
    display: 'flex',
    width: '100%'
  },
  saparator: {
    height: 1,
    width: "100%",
    backgroundColor: "#CED0CE"
  },
  containerItem: {

  },
  body: {
  }
});