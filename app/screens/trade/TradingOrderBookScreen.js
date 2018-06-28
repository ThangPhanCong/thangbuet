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
import TextInputMask from 'react-native-text-input-mask';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import I18n from '../../i18n/i18n';
import BaseScreen from '../BaseScreen'
import OrderBook from './OrderBook';
import OrderBookSettingModal from './OrderBookSettingModal';


export default class TradingOrderBookScreen extends BaseScreen {
  componentDidMount() {
    super.componentDidMount();
  }

  render() {
    return (
      <View style={CommonStyles.matchParent}>
        {this._renderOrderBookSettingModal()}
        {this._renderQuantityAndSetting()}
        <OrderBook currency='krw' coin='btc' type={OrderBook.TYPE_FULL}/>
      </View>
    )
  }

  _renderOrderBookSettingModal() {
    return (
      <OrderBookSettingModal ref={ref => this._orderBookSettingModal = ref} currency='krw' coin='btc'/>
    );
  }

  _renderQuantityAndSetting() {
    return (
      <View style={styles.quantityAndSettingGroup}>
        <Text style={styles.quantityLabel}>{I18n.t('orderBook.quantity')}</Text>
        <TextInputMask
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