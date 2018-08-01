import React from 'react';
import { SafeAreaView, Platform } from 'react-native';
import { TabNavigator, TabBarBottom, StackNavigator, NavigationActions } from 'react-navigation';
import I18n from "../i18n/i18n";
import { Image } from 'react-native';
import TradingScreen from './trade/TradingScreen'
import FundsScreen from './funds/FundsScreen'
import TransactionScreen from './transaction/TransactionScreen'
import BalanceScreen from './balances/BalanceScreen'
import MyPageScreen from './my-page/MyPageScreen'
import DepositScreen from './balances/DepositScreen'
import DepositKRWScreen from './balances/DepositKRWScreen'
import WithdrawalKRWScreen from './balances/WithdrawalKRWScreen'
import WithdrawalScreen from './balances/WithdrawalScreen'
import { scale } from '../libs/reactSizeMatter/scalingUtils';
import MarketSearchScreen from './market/MarketSearchScreen';
import BaseScreen from './BaseScreen';
import App from '../../App';

export const BalanceStack = StackNavigator({
  Balance: {
    screen: BalanceScreen,
  },
  Deposit: {
    screen: DepositScreen,
  },
  DepositKRW: {
    screen: DepositKRWScreen,
  },
  WithdrawalKRW: {
    screen: WithdrawalKRWScreen
  },
  Withdrawal: {
    screen: WithdrawalScreen
  }
});

export const MarketStack = StackNavigator({
  MarketSearchScreen: {
    screen: MarketSearchScreen
  },
  TradingScreen: {
    screen: TradingScreen
  }
});

let MainTabNavigator = TabNavigator(
  {
    MarketSearchScreen: {
      screen: MarketStack,
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

        if (routeName === 'MarketSearchScreen') {
          iconName = require('../../assets/marketTab/marketTab.png');
        } else if (routeName === 'BalanceScreen') {
          iconName = require('../../assets/balanceTab/balanceTab.png')
        } else if (routeName === 'FundsScreen') {
          iconName = require('../../assets/fundsTab/fundsTab.png')
        } else if (routeName === 'TransactionScreen') {
          iconName = require('../../assets/transactionTab/transactionTab.png')
        } else if (routeName === 'MyPageScreen') {
          iconName = require('../../assets/myPageTab/mypageTab.png')
        }

        return <Image resizeMode={'contain'} style={{ width: scale(15), height: scale(15) }} source={iconName}/>
      },
      gesturesEnabled: false
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: '#FFF',
      inactiveTintColor: 'gray',
      activeBackgroundColor: '#000',
      style: {
        backgroundColor: '#131722',
        height: scale(40)
      },
      labelStyle: {
        fontSize: scale(11)
      }
    },
    animationEnabled: false,
    swipeEnabled: false,
    initialRouteName: 'MarketSearchScreen',
  }
)

let defaultGetStateForAction;

export default class MainScreen extends BaseScreen {
  componentDidMount() {
    super.componentDidMount();

    if (!defaultGetStateForAction) {
      defaultGetStateForAction = App.router.getStateForAction;
    }

    if (Platform.OS === 'android') {
      App.router.getStateForAction = (action, state) => {
        const screen = state ? state.routes[state.index] : null;
        const tab = screen && screen.routes ? screen.routes[screen.index] : null;
        const tabScreen = tab && tab.routes ? tab.routes[tab.index] : null;

        console.log(screen, tab, tabScreen);
  
        if (
            action.type === NavigationActions.BACK &&
            tab && tab.routeName === 'MainScreen'
        ) {
          // Option 1: will close the application
          return null;
          
          // Option 2: will keep the app open
          // const newRoutes = state.routes.filter(r => r.routeName !== 'auth');
          // const newIndex = newRoutes.length - 1;
          // return defaultGetStateForAction(action, {
          //   index: newIndex,
          //   routes: newRoutes
          // });
        }

        return defaultGetStateForAction(action, state);
      };
    }
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <MainTabNavigator/>
      </SafeAreaView>
    )
  }
}