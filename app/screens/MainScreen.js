import React from 'react';
import { TabNavigator, TabBarBottom, StackNavigator } from 'react-navigation';
import I18n from "../i18n/i18n";
import Icon from 'react-native-vector-icons/FontAwesome';
import { PixelRatio } from 'react-native';
import TradingScreen from './trade/TradingScreen'
import FundsScreen from './funds/FundsScreen'
import TransactionScreen from './transaction/TransactionScreen'
import BalanceScreen from './balances/BalanceScreen'
import MyPageScreen from './my-page/MyPageScreen'
import DepositScreen from './balances/DepositScreen'
import DepositQRCodeScreen from './balances/DepositQRCodeScreen'
import DepositKRWScreen from './balances/DepositKRWScreen'
import WithdrawalKRWScreen from './balances/WithdrawalKRWScreen'

export const BalanceStack = StackNavigator({
  Balance: {
    screen: BalanceScreen,
  },
  Deposit: {
    screen: DepositScreen,
  },
  DepositQRCode: {
    screen: DepositQRCodeScreen,
  },
  DepositKRW: {
    screen: DepositKRWScreen,
  },
  WithdrawalKRW: {
    screen: WithdrawalKRWScreen
  }
});
import MarketSearchScreen from './market/MarketSearchScreen';

export default TabNavigator(
  {
    MarketSearchScreen: {
      screen: MarketSearchScreen,
      navigationOptions: () => ({
        tabBarLabel: I18n.t('tabBar.trading'),
      })
    },
    FundsScreen: {
      screen: FundsScreen,
      navigationOptions: () => ({
        tabBarLabel: I18n.t('tabBar.funds'),
      })
    },
    BalanceScreen: {
      screen: BalanceStack,
      navigationOptions: () => ({
        tabBarLabel: I18n.t('tabBar.balance'),
      })
    },
    TransactionScreen: {
      screen: TransactionScreen,
      navigationOptions: () => ({
        tabBarLabel: I18n.t('tabBar.transaction'),
      })
    },
    MyPageScreen: {
      screen: MyPageScreen,
      navigationOptions: () => ({
        title: I18n.t('tabBar.myPage'),
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
    initialRouteName: 'BalanceScreen',
  }
);