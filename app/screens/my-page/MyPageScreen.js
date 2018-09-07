import React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
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
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';

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
    screen: props => <WalletScreen {...props}  />,
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
        <TabBarNavigator screenProps={{navigation: this.props.screenProps.navigation}}/>
      </SafeAreaView>
    )
  }

  _renderHeader() {
    return (
      <View style={styles.header}>
        <Icon name="account"
          size={scale(28)}
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

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  header: {
    height: '60@s',
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: '16@s'
  },
  headerTitle: {
    fontWeight: 'bold',
    marginStart: '10@s',
    fontSize: '14@s'
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: '10@s'
  },
  logoutButton: {
    alignSelf: 'center',
    backgroundColor: '#3B3838',
    justifyContent: 'center',
    height: '36@s',
    borderRadius: '3@s'
  },
  logoutText: {
    marginStart: '10@s',
    marginEnd: '10@s',
    fontSize: '13@s',
    color: '#FFF'
  }
});