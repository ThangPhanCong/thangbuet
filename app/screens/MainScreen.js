import React from 'react';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import I18n from "../i18n/i18n";
import Icon from 'react-native-vector-icons/FontAwesome';
import { PixelRatio } from 'react-native';
import TradingScreen from './trade/TradingScreen'
import FundsScreen from './funds/FundsScreen'
import TransactionScreen from './transaction/TransactionScreen'
import BalanceScreen from './balances/BalanceScreen'
import MyPageScreen from './my-page/MyPageScreen'
import MarketSearchScreen from './market/MarketSearchScreen';

export default TabNavigator(
  {
    MarketSearchScreen: {
      screen: MarketSearchScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Trading',
      })
    },
    FundsScreen: {
      screen: FundsScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Funds',
      })
    },
    BalanceScreen: {
      screen: BalanceScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Balance',
      })
    },
    TransactionScreen: {
      screen: TransactionScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Transaction',
      })
    },
    MyPageScreen: {
      screen: MyPageScreen,
      navigationOptions: () => ({
        title: 'My page',
      })
    },
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;

        return <Icon name={iconName} size={PixelRatio.getPixelSizeForLayoutSize(8)} color={tintColor} />;
      },
      gesturesEnabled: false
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: '#EBB50C',
      inactiveTintColor: 'gray',
      style: {
        backgroundColor: '#1F2833'
      },
    },
    animationEnabled: false,
    swipeEnabled: false,
    // initialRouteName: 'FundsScreen',
  }
);