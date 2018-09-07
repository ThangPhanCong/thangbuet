import React from 'react';
import { SafeAreaView } from 'react-native';
import { TabNavigator, TabBarBottom, StackNavigator } from 'react-navigation';
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
import { handleBackAction } from '../../App';

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

        return <Image resizeMode={'contain'} style={{ width: scale(15), height: scale(15), marginTop: scale(5) }} source={iconName}/>
      },
      gesturesEnabled: false
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      activeTintColor: '#FFF',
      inactiveTintColor: '#FFF',
      activeBackgroundColor: '#0f2d6b',
      style: {
        backgroundColor: '#00358f',
        height: scale(50),
        
      },
      labelStyle: {
        fontSize: scale(11),
        paddingBottom: scale(5)
      }
    },
    animationEnabled: false,
    swipeEnabled: false,
    initialRouteName: 'MarketSearchScreen',
  }
)

export default class MainScreen extends BaseScreen {
  componentDidMount() {
    super.componentDidMount();
    
    handleBackAction();
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <MainTabNavigator screenProps={{navigation: this.props.navigation}}/>
      </SafeAreaView>
    )
  }
}