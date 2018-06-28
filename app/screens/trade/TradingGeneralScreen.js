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
  }

  render() {
    return (
      <View style={CommonStyles.matchParent}>
        {this._renderOrderBookSettingModal()}
        {this._renderQuantityAndSetting()}
        <View style={styles.content}>
          <View style={styles.orderBook}>
            <OrderBook currency='krw' coin='btc' type={OrderBook.TYPE_SMALL}/>
          </View>
          <View style={styles.trades}>
            <OrderForm currency='krw' coin='btc'/>
          </View>
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
      <OrderBookSettingModal ref={ref => this._orderBookSettingModal = ref} currency='krw' coin='btc'/>
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
  }
});