import React from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
  Button
} from 'react-native';
import BaseScreen from '../BaseScreen'
import MasterdataUtils from '../../utils/MasterdataUtils'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { Icon } from 'react-native-elements'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import AppConfig from '../../utils/AppConfig'
import AppPreferences from '../../utils/AppPreferences'
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters'
import { withNavigationFocus } from 'react-navigation'
import KRWScreen from './KRWScreen'
import KRWPendingScreen from './KRWPendingScreen'
import HeaderBalance from './HeaderBalance'

class DepositKRWScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      isPending: false,
      transaction: {},
      isComplete: false,
    }
    this.currency = 'krw'
  }

  componentDidMount() {
    this._getPendingTransaction()
  }

  componentWillUnmount() {
    this.setState({ isComplete: false })
  }

  async _getPendingTransaction() {
    try {
      let pendingDepositTransaction = await rf.getRequest('TransactionRequest').getPendingDepositTransaction()
      if (!pendingDepositTransaction.data || pendingDepositTransaction.data === null) {
        this.setState({ isPending: false, transaction: {}, isComplete: true })
      } else {
        this.setState({ isPending: true, transaction: pendingDepositTransaction.data, isComplete: true })
      }
    } catch (err) {
      console.log('Some errors has occurred in DepositKRWScreen ', err)
      Alert.alert(
        I18n.t('deposit.error'),
        err.message,
        [{ text: I18n.t('deposit.accept'), onPress: () => { } },],
        { cancelable: false }
      )
    }
  }

  async _onExecute(result) {
    try {
      let transaction = {}
      if (result) {
        let pendingDepositTransaction = await rf.getRequest('TransactionRequest').getPendingDepositTransaction()
        transaction = pendingDepositTransaction.data
      }
      this.setState({ isPending: result, transaction: transaction })
    } catch (err) {
      console.log('Some errors has occurred in DepositKRWScreen ', err)
      Alert.alert(
        I18n.t('deposit.error'),
        err.message,
        [{ text: I18n.t('deposit.accept'), onPress: () => { } },],
        { cancelable: false }
      )
    }
  }

  render() {
    const { navigation } = this.props;
    const symbol = navigation.getParam('symbol', {})

    return (
      <SafeAreaView style={styles.fullScreen}>
        {this.state.isComplete &&
          <View style={styles.content}>
            <HeaderBalance />
            <KRWScreen
              isPending={this.state.isPending}
              symbol={symbol}
              onExecute={this._onExecute.bind(this)} />
            <KRWPendingScreen
              isPending={this.state.isPending}
              transaction={this.state.transaction}
              symbol={symbol}
              onExecute={this._onExecute.bind(this)} />
          </View>
        }
      </SafeAreaView>
    )
  }
}

export default withNavigationFocus(DepositKRWScreen)

const styles = ScaledSheet.create({
  fullScreen: { flex: 1 },
  content: { flex: 1, flexDirection: "column" },
});