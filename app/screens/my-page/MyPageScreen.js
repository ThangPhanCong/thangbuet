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

const TabBarNavigator = TabNavigator({
  BasicInfoScreen: {
    screen: BasicInfoScreen,
    navigationOptions: () => ({
      tabBarLabel: I18n.t('myPage.tab.basic'),
    })
  },
  SecurityScreen: {
    screen: SecurityScreen,
    navigationOptions: () => ({
      tabBarLabel: I18n.t('myPage.tab.security'),
    })
  },
  ConnectionScreen: {
    screen: ConnectionScreen,
    navigationOptions: () => ({
      tabBarLabel: I18n.t('myPage.tab.connection'),
    })
  },
  WalletScreen: {
    screen: WalletScreen,
    navigationOptions: () => ({
      tabBarLabel: I18n.t('myPage.tab.wallet'),
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
      height: 48
    },
    indicatorStyle: {
      backgroundColor: '#FFC000'
    },
    labelStyle: {
      fontSize: 13,
      alignSelf: 'center'
    },
    tabStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
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