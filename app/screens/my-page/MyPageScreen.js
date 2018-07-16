import React from 'react';
import {
  StyleSheet,
  PixelRatio,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image
} from 'react-native';
import { TabNavigator, TabBarTop } from 'react-navigation';
import BaseScreen from '../BaseScreen';
import { CommonStyles } from '../../utils/CommonStyles';
import I18n from '../../i18n/i18n';
import BasicInfoScreen from './basic/BasicInfoScreen';
import ConnectionScreen from './connection/ConnectionScreen';
import SecurityScreen from './security/SecurityScreen';
import WalletScreen from './wallet/WalletScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNRestart from 'react-native-restart';
import AppPreferences from '../../utils/AppPreferences';
import UIUtils from '../../utils/UIUtils';

const TabBarNavigator = TabNavigator({
  BasicInfoScreen: {
    screen: BasicInfoScreen,
    navigationOptions: () => ({
      tabBarLabel: options => UIUtils.renderTabItem(I18n.t('myPage.tab.basic'), {fontSize: 14, ...options})
    })
  },
  SecurityScreen: {
    screen: SecurityScreen,
    navigationOptions: () => ({
      tabBarLabel: options => UIUtils.renderTabItem(I18n.t('myPage.tab.security'), {fontSize: 14, ...options})
    })
  },
  ConnectionScreen: {
    screen: ConnectionScreen,
    navigationOptions: () => ({
      tabBarLabel: options => UIUtils.renderTabItem(I18n.t('myPage.tab.connection'), {fontSize: 14, ...options})
    })
  },
  WalletScreen: {
    screen: WalletScreen,
    navigationOptions: () => ({
      tabBarLabel: options => UIUtils.renderTabItem(I18n.t('myPage.tab.wallet'), {fontSize: 14, ...options}, false)
    })
  }
},{
  navigationOptions: ({ navigation }) => ({
    gesturesEnabled: false
  }),
  tabBarComponent: TabBarTop,
  tabBarPosition: 'top',
  ...CommonStyles.tabOptions
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
        <Icon name="account"
          size={28}
          color='#000' />
        <Text style={styles.headerTitle}>
          MY PAGE
        </Text>
        <View style ={{flex: 1}}/>
        <View style={styles.logoutContainer}>
          <TouchableOpacity style = {styles.logoutButton}
            onPress={this._onLogout.bind(this)}>
            <Text style={styles.logoutText}>
              {I18n.t('myPage.logout')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _onLogout() {
    AppPreferences.removeAccessToken();
    window.GlobalSocket.disconnect();
    RNRestart.Restart();
  }
}

const styles = StyleSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  header: {
    height: 59,
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: 16
  },
  headerTitle: {
    fontWeight: 'bold',
    marginStart: 10,
    fontSize: 14
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10
  },
  logoutButton: {
    alignSelf: 'center',
    backgroundColor: '#3B3838',
    justifyContent: 'center',
    height: 36,
    borderRadius: 3
  },
  logoutText: {
    marginStart: 10,
    marginEnd: 10,
    fontSize: 13,
    color: '#FFF'
  }
});