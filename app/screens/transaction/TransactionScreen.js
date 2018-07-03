import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import BaseScreen from '../BaseScreen'

import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { TabBarTop, TabNavigator } from "react-navigation";
import Consts from "../../utils/Consts";
import TransactionContainerScreen from "./TransactionContainerScreen";
import { CommonStyles } from "../../utils/CommonStyles";

let TabBarNavigatorTransaction;

export default class TransactionScreen extends BaseScreen {

  constructor(props) {
    super(props);
    TabBarNavigatorTransaction = this._initTabNavigator();
  }

  _initTabNavigator() {
    return TabNavigator(
      {
        OrderHistoryScreen: {
          screen: (props) => <TransactionContainerScreen {...props} title={Consts.ORDER_HISTORY}/>,
          navigationOptions: () => ({
            tabBarLabel: Consts.ORDER_HISTORY,
          })
        },
        OpenOrderScreen: {
          screen: (props) => <TransactionContainerScreen {...props} title={Consts.OPEN_ORDERS}/>,
          navigationOptions: () => ({
            tabBarLabel: Consts.OPEN_ORDERS,
          })
        },
        FundsHistory: {
          screen: (props) => <TransactionContainerScreen {...props} title={Consts.FUNDS_HISTORY}/>,
          navigationOptions: () => ({
            tabBarLabel: Consts.FUNDS_HISTORY,
          })
        },
        ProfitScreen: {
          screen: (props) => <TransactionContainerScreen {...props} title={Consts.PROFIT_LOST}/>,
          navigationOptions: () => ({
            tabBarLabel: Consts.PROFIT_LOST,
          })
        }
      },
      {
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
            fontSize: 16
          }
        },
        animationEnabled: false,
        swipeEnabled: false
      }
    );
  }

  render() {
    return (
      <View style={styles.screen}>
        <TabBarNavigatorTransaction/>
      </View>

    )
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  }

});