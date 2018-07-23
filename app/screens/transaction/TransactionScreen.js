import React from 'react';
import { Image, Text, View } from 'react-native';
import BaseScreen from '../BaseScreen'

import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { TabBarTop, TabNavigator } from "react-navigation";
import TransactionContainerScreen from "./TransactionContainerScreen";
import { CommonColors, CommonStyles, Fonts } from "../../utils/CommonStyles";
import I18n from "../../i18n/i18n";
import FundsHistoryScreen from "./FundsHistoryScreen";
import ProfitAndLossScreen from "./ProfitAndLossScreen";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import UIUtils from "../../utils/UIUtils";

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
            tabBarLabel: (options) => UIUtils.renderTabItem(I18n.t('transactions.orderHistoryTab'), {fontSize: 14, ...options})
          })
        },
        OpenOrderScreen: {
          screen: (props) => <TransactionContainerScreen {...props} title={I18n.t('transactions.openOrderTab')}/>,
          navigationOptions: () => ({
            tabBarLabel: (options) => UIUtils.renderTabItem(I18n.t('transactions.openOrderTab'),{fontSize: 14, ...options})
          })
        },
        FundsHistory: {
          screen: (props) => <FundsHistoryScreen {...props} title={I18n.t('transactions.fundsHistoryTab')}/>,
          navigationOptions: () => ({
            tabBarLabel: (options) => UIUtils.renderTabItem(I18n.t('transactions.fundsHistoryTab'), {fontSize: 14, ...options})
          })
        },
        ProfitScreen: {
          screen: (props) => <ProfitAndLossScreen {...props} title={I18n.t('transactions.profitLostTab')}/>,
          navigationOptions: () => ({
            tabBarLabel: (options) => UIUtils.renderTabItem(I18n.t('transactions.profitLostTab'), {fontSize: 14, ...options}, false)
          })
        }
      },
      {
        navigationOptions: ({ navigation }) => ({
          gesturesEnabled: false
        }),
        tabBarComponent: TabBarTop,
        tabBarPosition: 'top',
        ...CommonStyles.tabOptions,
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
    ...Fonts.NotoSans_Bold
  },
  imgBook: {
    width: '20@s',
    height: '20@s',
    marginLeft: '15@s',
    marginRight: '10@s',
  }

});