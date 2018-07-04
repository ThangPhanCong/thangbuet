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
import Utils from '../../utils/Utils';
import Consts from '../../utils/Consts'
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import OrderBook from './OrderBook';
import OrderBookSettingModal from './OrderBookSettingModal';
import OrderForm from './OrderForm';

export default class TradingGeneralScreen extends BaseScreen {

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
        {this._renderQuantityAndSetting()}
        <View style={styles.content}>
          <View style={styles.orderBook}>
            <OrderBook currency={this._getCurrency()} coin={this._getCoin()} type={OrderBook.TYPE_SMALL}/>
          </View>
          {this._renderOrderForm()}
        </View>
      </View>
    )
  }

  _renderQuantityAndSetting() {
    return (
      <View style={styles.quantityAndSettingGroup}>
        <View style={CommonStyles.matchParent}/>

        <Text>{I18n.t('orderBook.hand')}</Text>
        <TextInput value='-15'/>
        <Text>%</Text>

        <Text>{I18n.t('orderBook.fence')}</Text>
        <TextInput value='15'/>
        <Text>%</Text>

        <TouchableOpacity onPress={this._openOrderBookSettingModal.bind(this)}>
          <Image
            resizeMode={'contain'}
            style={styles.setting}
            source={require('../../../assets/orderBook/setting.png')}/>
        </TouchableOpacity>
      </View>
    );
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
    return (
      <View style={styles.trades}>
        {this._renderTypeTabs()}
        <View style={[CommonStyles.matchParent, isSelectedBuy ? {} : { display: 'none' }]}>
          <OrderForm currency={this._getCurrency()} coin={this._getCoin()} tradeType={Consts.TRADE_TYPE_BUY}/>
        </View>
        <View style={[CommonStyles.matchParent, !isSelectedBuy ? {} : { display: 'none' }]}>
          <OrderForm currency={this._getCurrency()} coin={this._getCoin()} tradeType={Consts.TRADE_TYPE_SELL}/>
        </View>
      </View>
    );
  }

  _renderTypeTabs() {
    const isSelectedBuy = this.state.selectedTab == Consts.TRADE_TYPE_BUY;
    const isSelectedSell = this.state.selectedTab == Consts.TRADE_TYPE_SELL;
    return (
      <View style={styles.tabs}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.tab, isSelectedBuy ? styles.selectedBuy : {}]}
          onPress={() => this.setState({selectedTab: Consts.TRADE_TYPE_BUY})}>
          <Text style={[CommonStyles.priceIncreased]}>{I18n.t('orderForm.buy')}</Text>
        </TouchableOpacity>

        <View style={styles.tabSeparator}/>

        <TouchableOpacity
          activeOpacity={1}
          style={[styles.tab, isSelectedSell ? styles.selectedSell : {}]}
          onPress={() => this.setState({selectedTab: Consts.TRADE_TYPE_SELL})}>
          <Text style={[CommonStyles.priceDecreased]}>{I18n.t('orderForm.sell')}</Text>
        </TouchableOpacity>

        <View style={styles.tabSeparator}/>

        <TouchableOpacity
          activeOpacity={1}
          style={styles.tab}>
          <Text>{I18n.t('orderForm.pendingOrder')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = ScaledSheet.create({
  quantityAndSettingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '30@s'
  },
  setting: {
    width: '20@s'
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  orderBook: {
    flex: 2
  },
  trades: {
    flex: 3
  },
  tabs: {
    flexDirection: 'row',
    height: '35@s',
    alignItems: 'stretch'
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#EEF1F5',
    marginBottom: 1,
    paddingBottom: 1
  },
  tabSeparator: {
    width: 1,
    height: '15@s',
    marginBottom: 3,
    alignSelf: 'center',
    backgroundColor: '#515151'
  },
  selectedBuy: {
    borderBottomWidth: 3,
    borderColor: '#FF2C0D',
    marginBottom: 0,
    paddingBottom: 0
  },
  selectedSell: {
    borderBottomWidth: 3,
    borderColor: '#007AC5',
    marginBottom: 0,
    paddingBottom: 0
  }
});