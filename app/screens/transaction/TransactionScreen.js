import React from 'react';
import { Image, Text, View } from 'react-native';
import BaseScreen from '../BaseScreen'

import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { TabBarTop, TabNavigator } from "react-navigation";
import TransactionContainerScreen from "./TransactionContainerScreen";
import { CommonColors, CommonStyles } from "../../utils/CommonStyles";
import I18n from "../../i18n/i18n";
import FundsHistoryScreen from "./FundsHistoryScreen";
import ProfitAndLossScreen from "./ProfitAndLossScreen";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";

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
          screen: (props) => <TransactionContainerScreen {...props} title={I18n.t('transactions.orderHistoryTab')}/>,
          navigationOptions: () => ({
            tabBarLabel: I18n.t('transactions.orderHistoryTab'),
          })
        },
        OpenOrderScreen: {
          screen: (props) => <TransactionContainerScreen {...props} title={I18n.t('transactions.openOrderTab')}/>,
          navigationOptions: () => ({
            tabBarLabel: I18n.t('transactions.openOrderTab'),
          })
        },
        FundsHistory: {
          screen: (props) => <FundsHistoryScreen {...props} title={I18n.t('transactions.fundsHistoryTab')}/>,
          navigationOptions: () => ({
            tabBarLabel: I18n.t('transactions.fundsHistoryTab'),
          })
        },
        ProfitScreen: {
          screen: (props) => <ProfitAndLossScreen {...props} title={I18n.t('transactions.profitLostTab')}/>,
          navigationOptions: () => ({
            tabBarLabel: I18n.t('transactions.profitLostTab'),
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
            fontSize: scale(12)
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
        <View style={styles.viewHeader}>
          <Image
            resizeMode={'contain'}
            style={styles.imgBook}
            source={require('../../../assets/common/book/imgBook.png')}
          />
          <Text style={styles.textHeader}>{I18n.t('transactions.title')}</Text>

        </View>
        <TabBarNavigatorTransaction/>
      </View>

    )
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  viewHeader: {
    height: '60@s',
    alignItems: 'center',
    backgroundColor: '#FFF',
    flexDirection: 'row'
  },
  textHeader: {
    fontSize: '14@s',
    color: CommonColors.mainText,
    fontFamily: 'NotoSans-Regular'
  },
  imgBook: {
    marginLeft: '10@s',
    marginRight: '10@s',
  }

});