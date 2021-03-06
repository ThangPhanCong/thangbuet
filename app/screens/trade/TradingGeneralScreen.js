import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import BaseScreen from '../BaseScreen'
import I18n from '../../i18n/i18n';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import Utils from '../../utils/Utils';
import Consts from '../../utils/Consts'
import { CommonColors, CommonSize, CommonStyles, Fonts } from '../../utils/CommonStyles';
import OrderBook from './OrderBook';
import OrderBookSettingModal from './OrderBookSettingModal';
import OrderForm from './OrderForm';
import OpenOrders from './OpenOrders';
import CurrencyInput from '../common/CurrencyInput';

export default class TradingGeneralScreen extends BaseScreen {

  static OPEN_ORDERS_TAB = 'open_orders'

  constructor(props) {
    super(props)
    this.state = {
      selectedTab: Consts.TRADE_TYPE_BUY,
      currency: props.screenProps.currency,
      coin: props.screenProps.coin
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { currency, coin } = this.props.screenProps;
    if (currency != this.state.currency || coin != this.state.coin) {
      this.setState({ currency, coin });
    }
  }

  _getCurrency() {
    return this.state.currency;
  }

  _getCoin() {
    return this.state.coin;
  }

  render() {
    return (
      <View style={CommonStyles.matchParent}>
        {this._renderOrderBookSettingModal()}
        <View style={styles.content}>
          <View style={styles.orderBook}>
            <OrderBook currency={this._getCurrency()} coin={this._getCoin()} type={OrderBook.TYPE_SMALL}/>
          </View>
          {this._renderOrderForm()}
        </View>
      </View>
    )
  }


  _renderOrderBookSettingModal() {
    return (
      <OrderBookSettingModal
        ref={ref => this._orderBookSettingModal = ref}
        currency={this._getCurrency()}
        coin={this._getCoin()}/>
    );
  }

  _openOrderBookSettingModal() {
    this._orderBookSettingModal.setModalVisible(true);
  }

  _renderOrderForm() {
    const isSelectedBuy = this.state.selectedTab == Consts.TRADE_TYPE_BUY;
    const isSelectedSell = this.state.selectedTab == Consts.TRADE_TYPE_SELL;
    const isSelectedOpenOrders = !(isSelectedBuy || isSelectedSell);
    return (
      <View style={styles.trades}>
        {this._renderTypeTabs()}
        <View style={[CommonStyles.matchParent, isSelectedBuy ? {} : { display: 'none' }]}>
          <OrderForm currency={this._getCurrency()} coin={this._getCoin()} tradeType={Consts.TRADE_TYPE_BUY}/>
        </View>
        <View style={[CommonStyles.matchParent, isSelectedSell ? {} : { display: 'none' }]}>
          <OrderForm currency={this._getCurrency()} coin={this._getCoin()} tradeType={Consts.TRADE_TYPE_SELL}/>
        </View>
        <View style={[CommonStyles.matchParent, isSelectedOpenOrders ? {} : { display: 'none' }]}>
          <OpenOrders currency={this._getCurrency()} coin={this._getCoin()}/>
        </View>
      </View>
    );
  }

  _renderTypeTabs() {
    const isSelectedBuy = this.state.selectedTab == Consts.TRADE_TYPE_BUY;
    const isSelectedSell = this.state.selectedTab == Consts.TRADE_TYPE_SELL;
    const isSelectedOpenOrders = !(isSelectedBuy || isSelectedSell);
    return (
      <View style={styles.tabs}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.tab, isSelectedBuy ? styles.selectedBuy : {}]}
          onPress={() => this.setState({selectedTab: Consts.TRADE_TYPE_BUY})}>
          <Text style={[styles.tabLabel, CommonStyles.priceIncreased, isSelectedBuy ? styles.selectedLabel : {}]}>
            {I18n.t('orderForm.buy')}
          </Text>
        </TouchableOpacity>

        <View style={styles.tabSeparator}/>

        <TouchableOpacity
          activeOpacity={1}
          style={[styles.tab, isSelectedSell ? styles.selectedSell : {}]}
          onPress={() => this.setState({selectedTab: Consts.TRADE_TYPE_SELL})}>
          <Text style={[styles.tabLabel, CommonStyles.priceDecreased, isSelectedSell ? styles.selectedLabel : {}]}>
            {I18n.t('orderForm.sell')}
          </Text>
        </TouchableOpacity>

        <View style={styles.tabSeparator}/>

        <TouchableOpacity
          activeOpacity={1}
          style={[styles.tab, isSelectedOpenOrders ? styles.selectedOpenOrders : {}]}
          onPress={() => this.setState({selectedTab: TradingGeneralScreen.OPEN_ORDERS_TAB})}>
          <Text style={[styles.tabLabel, styles.openOrdersLabel, isSelectedOpenOrders ? styles.selectedLabel : {}]}>
            {I18n.t('orderForm.pendingOrder')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = ScaledSheet.create({
  quantityAndSettingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '38@vs',
    paddingTop: '1@s',
    paddingLeft: '10@s',
    paddingRight: '10@s',
    borderBottomColor: '#DAE0E9',
    borderBottomWidth: '1@s',
    backgroundColor: '#F7F8FA'
  },
  headerLabel: {
    fontSize: '10@s',
    ...Fonts.NotoSans
  },
  input: {
    height: '25@s',
    paddingLeft: '5@s',
    paddingRight: '5@s',
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: '5@s',
    marginRight: '5@s',
    borderWidth: 1,
    borderColor: CommonColors.border,
    borderRadius: '3@s',
    textAlign: 'right',
    fontSize: '11@s',
    ...Fonts.OpenSans
  },
  percentText: {
    fontSize: '8@s',
    marginRight: '10@s',
    ...Fonts.OpenSans
  },
  setting: {
    width: '18@s'
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  orderBook: {
    flex: 0.735
  },
  trades: {
    flex: 1
  },
  tabs: {
    flexDirection: 'row',
    height: '37@vs',
    alignItems: 'stretch',
    paddingTop: '2@s'
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#EEF1F5',
    marginBottom: -1
  },
  tabLabel: {
    fontSize: '14@s',
    ...Fonts.NotoSans
  },
  tabSeparator: {
    width: 1,
    height: '16@s',
    marginBottom: 3,
    alignSelf: 'center',
    backgroundColor: '#515151'
  },
  selectedBuy: {
    borderBottomWidth: '2@s',
    borderColor: '#FF2C0D',
    marginBottom: 0
  },
  selectedSell: {
    borderBottomWidth: '2@s',
    borderColor: '#007AC5',
    marginBottom: 0
  },
  selectedOpenOrders: {
    borderBottomWidth: '2@s',
    borderColor: '#70AD47',
    marginBottom: 0
  },
  openOrdersLabel: {
    color: '#70AD47'
  },
  selectedLabel: {
    ...Fonts.NotoSans_Bold
  }
});