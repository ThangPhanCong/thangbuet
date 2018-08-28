import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  FlatList,
  SafeAreaView
} from 'react-native';
import Modal from "react-native-modal";
import BaseScreen from '../BaseScreen';
import { TabNavigator, TabBarTop } from 'react-navigation';
import rf from '../../libs/RequestFactory';
import Events from '../../utils/Events';
import Numeral from '../../libs/numeral';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import { filter } from 'lodash';
import Utils from '../../utils/Utils';
import UIUtils from '../../utils/UIUtils';
import TradingGeneralScreen from './TradingGeneralScreen';
import TradingOrderBookScreen from './TradingOrderBookScreen';
import TradingChartScreen from './TradingChartScreen';
import TradingTransactionsScreen from './TradingTransactionsScreen';
import I18n from '../../i18n/i18n';
import { ListItem, List, Icon } from 'react-native-elements';
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters';
import { CommonColors, CommonStyles, Fonts } from '../../utils/CommonStyles';
import DropdownMenu from '../common/DropdownMenu';
import ModalHelp from '../common/ModalHelp';
import Consts from "../../utils/Consts";

const TradeTabs = TabNavigator(
  {
    Order: {
      screen: props => <TradingGeneralScreen {...props}/>,
      navigationOptions: () => ({
        tabBarLabel: (options) => UIUtils.renderTabItem(I18n.t('tradeScreen.order'), options)
      })
    },
    OrderBook: {
      screen: props => <TradingOrderBookScreen {...props}/>,
      navigationOptions: () => ({
        tabBarLabel: (options) => UIUtils.renderTabItem(I18n.t('tradeScreen.orderBook'), options)
      })
    },
    Chart: {
      screen: TradingChartScreen,
      navigationOptions: () => ({
        tabBarLabel: (options) => UIUtils.renderTabItem(I18n.t('tradeScreen.chart'), options)
      })
    },
    Transaction: {
      screen: TradingTransactionsScreen,
      navigationOptions: () => ({
        tabBarLabel: (options) => UIUtils.renderTabItem(I18n.t('tradeScreen.transaction'), options, false)
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      gesturesEnabled: false
    }),
    tabBarComponent: TabBarTop,
    tabBarPosition: 'top',
    ...CommonStyles.tabOptions
  });

export default class TradingScreen extends BaseScreen {

  constructor(props) {
    super(props)

    let params = this.props.navigation.state.params;
    this.state = {
      modalVisible: false,
      itemSelected: {},
      currency: params.currency,
      coin: params.coin,
      symbols: [],
      prices: {},
      balances: {},
      isShowModalHelp: false
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

  getDataEventHandlers() {
    return {
      [Events.SHOW_TRADE_SCREEN_DROPDOWN]: this._showDropdown.bind(this)
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
      this._onError(err, Consts.TITLE_SCREEN.ALLOW_SEE);
      return this._onBalanceUpdated([]);
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

  _showDropdown(data) {
    this._typeDropdown.show(data.items, data.options);
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
          {this._renderTypeDropdown()}
        </View>
      </SafeAreaView>
    );
  }

  _onOpenModalHelp() {
    this.setState({ isShowModalHelp: true })
  }

  _closeModalHelp() {
    this.setState({ isShowModalHelp: false })
  }

  _renderModalOpenHelp() {
    const { isShowModalHelp } = this.state;
    const helpContent = [I18n.t('tradeScreen.help1'), I18n.t('tradeScreen.help2'), I18n.t('tradeScreen.help3'), I18n.t('tradeScreen.help4'),
      I18n.t('tradeScreen.help5'), I18n.t('tradeScreen.help6')];

    return (
      <ModalHelp isShowModalHelp={isShowModalHelp} closeModalHelp={() => this._closeModalHelp()}
                 helpContent={helpContent}/>
    )
  }

  _renderHeader() {
    const priceData = this._getPrice();
    const balanceData = this._getCoinBalance();
    const priceColor = this._getChangeColor(priceData.change);
    const profit = this._getProfit(balanceData, priceData);
    const profitColor = this._getChangeColor(profit);

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.headerContent}
            onPress={() => this.setState({ modalVisible: true })}>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.caretContainer}>
                <Icon name='triangle-down' type='entypo' size={scale(15)}/>
              </View>
              <Text numberOfLines={1} style={styles.coin}>{this._getCurrencyName(this._getCoin())}</Text>
              <Text numberOfLines={1} style={styles.currency}>{' / ' + getCurrencyName(this._getCurrency())}</Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.headerContent, priceData.price ? {} : { opacity: 0 }]}>
            <Text
              style={[styles.price, { color: priceColor }]}>{formatCurrency(priceData.price, this._getCurrency)}</Text>
            <Icon
              name={priceData.change >= 0 ? 'triangle-up' : 'triangle-down'}
              type='entypo'
              color={priceColor}
              size={scale(16)}
              containerStyle={styles.changeIndicator}/>
            <Text style={[styles.pricePercent, { color: priceColor }]}>{formatPercent(priceData.change)}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.headerContent}>
            <Text style={styles.balanceLabel}>{I18n.t('tradeScreen.balance')}</Text>
            <Text style={styles.balance}>{formatCurrency(balanceData.balance, this._getCoin())}</Text>
            <Text style={styles.balanceCurrency}>{getCurrencyName(this._getCoin())}</Text>
          </View>

          <View style={styles.headerContent}>
            <TouchableWithoutFeedback onPress={() => this._onOpenModalHelp()}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.balanceLabel}>{I18n.t('tradeScreen.profit')}</Text>
                <Icon
                  name='help'
                  type='ionicons'
                  color='#000'
                  size={scale(13)}
                  containerStyle={styles.helpIcon}/>
              </View>
            </TouchableWithoutFeedback>

            <Text style={[styles.profit, { color: profitColor }]}>{Numeral(profit).format("0.00")}</Text>
            <Text style={[styles.balanceCurrency, { color: profitColor }]}>%</Text>
          </View>

          {this._renderModalOpenHelp()}
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

  _getProfit(balanceData, priceData) {
    let profit = 0;
    if (balanceData.krw_amount) {
      profit = (balanceData.balance * priceData.price - balanceData.krw_amount)*100 / balanceData.krw_amount;
    }

    return profit;
  }

  _renderSymbolSelector() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.modalVisible}
        onBackButtonPress={this._closeSymbolSelector.bind(this)}
        onBackdropPress={this._closeSymbolSelector.bind(this)}>
        <View style={styles.popup}>
          <List containerStyle={styles.coinList}>
            <FlatList
              data={this.state.symbols}
              keyExtractor={item => item.key + "_" + item.id}
              ItemSeparatorComponent={() => <View style={styles.separator}/>}
              renderItem={({ item }) => (
                <ListItem
                  onPress={() => this.setState({ currency: item.currency, coin: item.coin, modalVisible: false })}
                  hideChevron
                  key={item.key + "_" + item.id}
                  title={this._getCurrencyName(item.coin) + ' ' + getCurrencyName(item.coin) + '/' + getCurrencyName(item.currency)}
                  titleStyle={styles.itemText}
                  containerStyle={styles.item}
                  underlayColor='#6C6C6C'/>
              )}/>
          </List>
        </View>
      </Modal>
    );
  }

  _closeSymbolSelector() {
    this.setState({ modalVisible: false });
  }

  _renderTypeDropdown() {
    return (
      <DropdownMenu ref={ref => this._typeDropdown = ref}/>
    );
  }
}

const margin = scale(10);

const styles = ScaledSheet.create({
  main: {
    flex: 1,
    flexDirection: 'column'
  },
  header: {
    height: '90@vs',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerLeft: {
    flex: 1,
    marginLeft: margin,
    marginTop: margin * 1.2,
    marginBottom: margin * 1.2
  },
  headerRight: {
    flex: 1,
    marginLeft: margin / 2,
    marginTop: margin * 1.2,
    marginBottom: margin * 1.2
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  caretContainer: {
    width: '21@s',
    height: '21@s',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBCBCB',
    borderRadius: '2@s',
    marginRight: '10@s'
  },
  coin: {
    fontSize: '16@s',
    ...Fonts.NanumSquareOTF_ExtraBold
  },
  currency: {
    flex: 1,
    fontSize: '16@s',
    ...Fonts.OpenSans_Bold
  },
  price: {
    fontSize: '20@s',
    ...Fonts.OpenSans
  },
  pricePercent: {
    fontSize: '11@s',
    marginTop: '5@s'
  },
  changeIndicator: {
    marginTop: '7@s',
    marginLeft: '7@s'
  },
  helpIcon: {
    marginLeft: '5@s',
    marginBottom: '1@s'
  },
  balanceLabel: {
    color: '#595959',
    fontSize: '10.5@s',
    ...Fonts.NotoSans
  },
  balance: {
    flex: 1,
    textAlign: 'right',
    fontSize: '16@s',
    ...Fonts.OpenSans
  },
  profit: {
    flex: 1,
    textAlign: 'right',
    fontSize: '20@s',
    ...Fonts.OpenSans
  },
  balanceCurrency: {
    width: '30@s',
    fontSize: '8@s',
    marginLeft: '5@s',
    ...Fonts.OpenSans
  },

  popup: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: '0@s',
    marginBottom: '20@s'
  },
  coinList: {
    width: '245@s',
    backgroundColor: '#515151',
    ...UIUtils.generatePopupShadow()
  },
  item: {
    height: '55@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemText: {
    color: '#D9D9D9',
    textAlign: 'center',
    paddingRight: '8@s',
    fontSize: '16@s',
    ...Fonts.OpenSan_Bold
  },
  separator: {
    width: '100%',
    backgroundColor: "#606060"
  }
});