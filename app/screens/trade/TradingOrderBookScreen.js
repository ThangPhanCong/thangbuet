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
import BaseScreen from '../BaseScreen'
import OrderBook from './OrderBook';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';

import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';

export default class TradingOrderBookScreen extends BaseScreen {
  render() {
    return (
      <View style={CommonStyles.matchParent}>
        <OrderBook currency='krw' coin='btc' type={OrderBook.TYPE_FULL}/>
      </View>
    )
  }
}

const styles = ScaledSheet.create({

});