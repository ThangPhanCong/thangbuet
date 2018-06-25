import React from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import BaseScreen from '../BaseScreen';
import { CommonStyles } from '../../utils/CommonStyles';

import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import BasicInfoScreen from './tabs/BasicInfoScreen';
import ConnectionScreen from './tabs/ConnectionScreen';
import SecurityScreen from './tabs/SecurityScreen';
import WalletScreen from './tabs/WalletScreen';

const TabBarNavigator = TabNavigator({
  BasicInfoScreen: {
    screen: BasicInfoScreen,
    navigationOptions: () => ({
      tabBarLabel: '내 정보',
    })
  },
  SecurityScreen: {
    screen: SecurityScreen,
    navigationOptions: () => ({
      tabBarLabel: '보안설정',
    })
  },
  ConnectionScreen: {
    screen: ConnectionScreen,
    navigationOptions: () => ({
      tabBarLabel: '접속관리',
    })
  },
  WalletScreen: {
    screen: WalletScreen,
    navigationOptions: () => ({
      tabBarLabel: '출금주소록',
    })
  }
},{
  navigationOptions: ({ navigation }) => ({
    gesturesEnabled: false
  }),
  tabBarComponent: TabBarTop,
  tabBarPosition: 'top',
  tabBarOptions: {
    upperCaseLabel: true,
    activeTintColor: '#FFC000',
    inactiveTintColor: '#D9D9D9',
    style: {
      backgroundColor: '#3B3838',
    },
    indicatorStyle: {
      backgroundColor: '#FFC000'
    },
    labelStyle: {
      fontSize: 14
    }
  },
  animationEnabled: false,
  swipeEnabled: false
})

export default class MyPageScreen extends BaseScreen {
  render() {
    return(
      <SafeAreaView style={styles.screen}>
        {this._renderHeader()}
        <TabBarNavigator/>
      </SafeAreaView>
    )
  }

  _renderHeader() {
    return (
      <View style={styles.header}>
        
      </View>
    )
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  header: {
    height: '60@s',
    flexDirection: 'row'
  },
});