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
  Button,
  Alert
} from 'react-native';
import BaseScreen from '../BaseScreen'
import MasterdataUtils from '../../utils/MasterdataUtils'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { Icon, CheckBox, Divider } from 'react-native-elements'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import AppConfig from '../../utils/AppConfig'
import AppPreferences from '../../utils/AppPreferences'
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters'
import { withNavigationFocus } from 'react-navigation'
import Modal from "react-native-modal"
import HeaderBalance from './HeaderBalance'

class KRWPendingScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      symbols: [],
      assetsValuation: 0,
      checked: false,
      amount: 0,
      modalConfirm: false,
    }
    this.currency = 'krw'
  }

  componentDidMount() {

  }

  async _execute() {
    let pendingDepositTransaction = await rf.getRequest('TransactionRequest').getPendingDepositTransaction()
    if (!pendingDepositTransaction.data || pendingDepositTransaction.data === null) {
      let currency = this.currency
      let amount = this.state.amount
      let depositKrw = await rf.getRequest('TransactionRequest').depositKrw({ currency, amount })
      if (depositKrw.success) {
        Alert.alert(
          I18n.t('deposit.info'),
          I18n.t('deposit.success'),
          [{ text: I18n.t('deposit.accept'), onPress: () => { } },],
          { cancelable: false }
        )
      }
    } else {
      this.navigate('KRWPendingScreen', { transaction: pendingDepositTransaction.data })
    }
  }

  async _doDeposit() {
    try {
      let securitySettings = await rf.getRequest('UserRequest').getSecuritySettings()
      if (securitySettings.data.bank_account_verified !== 0) {
        Alert.alert(
          I18n.t('deposit.warning'),
          I18n.t('deposit.bankAccount'),
          [{ text: I18n.t('deposit.accept'), onPress: () => { } },],
          { cancelable: false }
        )
      } else {
        this.setState({ modalConfirm: true })
      }
    } catch (err) {
      console.log('Some errors has occurred in KRWScreen ', err)
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
    // console.log('symbol', symbol)
    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.content}>
          <HeaderBalance />

          <ScrollView style={{ flex: 1 }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text>{symbol.code.toUpperCase() + " " + I18n.t('deposit.title')}</Text>
            </View>
            <View style={{ flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginLeft: 40, marginRight: 40 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ flex: 0.7 }}>{I18n.t('deposit.account')}</Text>
                <View style={{ flex: 1, alignContent: 'flex-end' }}>
                  <Text style={{ flex: 1, alignSelf: 'flex-end' }}> {formatCurrency(symbol.balance, this.currency)}
                    <Text>{I18n.t('funds.currency')}</Text>
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ flex: 0.7 }}>{I18n.t('deposit.amount')}</Text>
                <View style={{ flexDirection: 'row', borderWidth: 1, flex: 1, alignContent: 'center', justifyContent: 'center' }}>
                  <TextInput
                    style={{ flex: 1, textAlign: 'center', height: 25 }}
                    value={this.state.amount != 0 ? this.state.amount.toString() : ''}
                    onChangeText={(text) => {
                      if (!text || text === '' || isNaN(text)) {
                        text = '0'
                      }
                      this.setState({ amount: parseFloat(text) })
                    }}
                    keyboardType='numeric'
                    placeholder='검색'
                    underlineColorAndroid='rgba(0, 0, 0, 0)'
                    autoCorrect={false} />
                  <Text style={{ paddingTop: 5, fontSize: 11 }}>{I18n.t('deposit.currency')}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => this.setState({ checked: !this.state.checked })}
              style={{
                marginTop: 20, backgroundColor: '#aaaaaa', height: 45, flexDirection: 'row',
                flex: 1, marginLeft: 20, marginRight: 20, justifyContent: 'center', alignItems: 'center'
              }}>
              <CheckBox
                containerStyle={{
                  backgroundColor: '#aaaaaa', borderWidth: 0
                }}
                checkedColor='blue'
                uncheckedColor='blue'
                size={15}
                iconRight
                checked={this.state.checked}
                onPress={() => this.setState({ checked: !this.state.checked })} />
              <TouchableOpacity style={{ marginLeft: -15 }}><Text style={{ color: 'blue' }}>{I18n.t('deposit.note')}</Text></TouchableOpacity>
              <Text style={{}}>{I18n.t('deposit.check')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!(this.state.checked && this.state.amount > 0)}
              onPress={this._doDeposit.bind(this)}
              style={[{
                flexDirection: 'row', height: 45, marginTop: 20,
                flex: 1, marginLeft: 20, marginRight: 20, justifyContent: 'center', alignItems: 'center'
              }, this.state.checked && this.state.amount > 0 ? { backgroundColor: 'blue' } : { backgroundColor: '#aaaaaa' }]}>
              <Text style={this.state.checked && this.state.amount > 0 ? { color: '#fff' } : { color: '#000' }}>{I18n.t('deposit.apply')}</Text>
            </TouchableOpacity>

            {/* Confirm deposit */}
            <Modal
              isVisible={this.state.modalConfirm}
              onBackdropPress={() => this.setState({ modalConfirm: false })}>
              <View style={{
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
                alignContent: 'center',
                borderRadius: 4,
                borderColor: "rgba(0, 0, 0, 0.1)"
              }}>
                <View style={{
                  borderBottomWidth: 1, borderColor: '#aaa', height: 50, width: '100%',
                  justifyContent: 'center', alignItems: 'center'
                }}>
                  <Text>{I18n.t('deposit.confirmTitle')}</Text>
                </View>

                <View style={{
                  width: '100%', justifyContent: 'center',
                  alignItems: 'center', flexDirection: 'row',
                  marginBottom: 10, marginTop: 20
                }}>
                  <Text style={{ marginRight: 10 }}>{I18n.t('deposit.amountToDeposit')}</Text>
                  <Text>{formatCurrency(this.state.amount, this.currency)}<Text style={{ fontSize: 11 }}>{I18n.t('funds.currency')}</Text></Text>
                </View>
                <Text style={{ marginTop: 10, marginBottom: 10 }}>{I18n.t('deposit.confirmContent')}</Text>
                <View style={{
                  width: '70%', justifyContent: 'space-between',
                  alignItems: 'center', flexDirection: 'row',
                  marginBottom: 20, marginTop: 10
                }}>
                  <TouchableOpacity
                    onPress={() => this.setState({ modalConfirm: false })}
                    style={{ width: '45%', justifyContent: 'center', backgroundColor: '#aaa', height: 45 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>{I18n.t('deposit.actionCancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={this._execute.bind(this)}
                    style={{ width: '45%', justifyContent: 'center', backgroundColor: 'blue', height: 45 }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>{I18n.t('deposit.actionConfirm')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }
}

export default withNavigationFocus(KRWPendingScreen)

const styles = ScaledSheet.create({
  fullScreen: { flex: 1 },
  content: { flex: 1, flexDirection: "column" },
});