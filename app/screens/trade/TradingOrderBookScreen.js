import React from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import {
  createBottomTabNavigator,
  createStackNavigator,
} from 'react-navigation'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import I18n from '../../i18n/i18n';
import BaseScreen from '../BaseScreen'
import OrderBook from './OrderBook';
import OrderBookSettingModal from './OrderBookSettingModal';
import OrderQuantityModal from './OrderQuantityModal';
import CurrencyInput from '../common/CurrencyInput';
import Events from '../../utils/Events';


export default class TradingOrderBookScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
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

  getDataEventHandlers() {
    return {
      [Events.ORDER_BOOK_ROW_PRESSED]: this._onOrderBookRowClicked.bind(this)
    };
  }

  _getCurrency() {
    return this.state.currency;
  }

  _getCoin() {
    return this.state.coin;
  }

  _onOrderBookRowClicked(data) {
    this._orderQuantityModal.showModal(data.tradeType, data.price);
  }

  render() {
    return (
      <View style={CommonStyles.matchParent}>
        {this._renderOrderBookSettingModal()}
        {this._renderQuantityModal()}
        {this._renderQuantityAndSetting()}
        <OrderBook currency={this._getCurrency()} coin={this._getCoin()} type={OrderBook.TYPE_FULL}/>
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

  _renderQuantityModal() {
    return (
      <OrderQuantityModal
        ref={ref => this._orderQuantityModal = ref}
        currency={this._getCurrency()}
        coin={this._getCoin()}/>
    );
  }

  _renderQuantityAndSetting() {
    return (
      <View style={styles.quantityAndSettingGroup}>
        <Text style={styles.quantityLabel}>{I18n.t('orderBook.quantity')}</Text>
        <CurrencyInput
            keyboardType='numeric'
            style={styles.quantityInput}
            underlineColorAndroid='transparent'
            placeholderTextColor='#4E545E'/>

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

  _openOrderBookSettingModal() {
    this._orderBookSettingModal.setModalVisible(true);
  }
}

const styles = ScaledSheet.create({
  quantityAndSettingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '30@s'
  },
  quantityLabel: {
    marginLeft: '10@s'
  },
  quantityInput: {
    flex: 1
  },
  setting: {
    width: '20@s'
  }
});