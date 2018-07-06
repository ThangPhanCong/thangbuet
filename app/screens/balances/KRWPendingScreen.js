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

export default class KRWPendingScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      checked: true,
      amount: 0,
      modalConfirm: false,
    }
    this.currency = 'krw'
  }

  componentDidMount() {
    const { isPending } = this.props
    if (isPending) {
      Alert.alert(
        I18n.t('deposit.info'),
        I18n.t('deposit.pendingInfo'),
        [{ text: I18n.t('deposit.accept'), onPress: () => { } },],
        { cancelable: false }
      )
    }
  }

  componentWillReceiveProps() {
    this.setState({
      checked: true,
      amount: 0,
      modalConfirm: false,
    })
  }

  async _execute() {
    try {
      const { symbol, transaction } = this.props
      let params = {
        "bankName": transaction.bank_name,
        "accountNumber": transaction.foreign_bank_account,
        "accountName": transaction.foreign_bank_account_holder,
        "code": transaction.deposit_code,
        "amount": transaction.amount,
        "currency": this.currency,
        "id": transaction.id
      }

      let pendingCancelRequest = await rf.getRequest('TransactionRequest').cancelKrwDepositTransaction(params)
      if (pendingCancelRequest.success) {
        this.setState({ modalConfirm: false })
        this.props.onExecute(false)
      }
    } catch (err) {
      console.log('Some errors has occurred in KRWPendingScreen ', err)
      Alert.alert(
        I18n.t('deposit.error'),
        err.message,
        [{ text: I18n.t('deposit.accept'), onPress: () => { } },],
        { cancelable: false }
      )
    }
  }

  render() {
    const { symbol, transaction, isPending } = this.props
    return (
      <View style={isPending ? styles.visible : styles.unvisible}>
        {isPending &&
          <ScrollView >
            <View style={styles.alignCenter}>
              <Text style={{ fontWeight: 'bold' }}>{symbol.code.toUpperCase() + " " + I18n.t('deposit.title')}</Text>
            </View>

            <View style={[styles.alignCenter, styles.directionColumn, styles.containerMargin]}>
              <View style={[styles.directionRow, styles.marginTopBottom10]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingAccount')}</Text>
                <View style={styles.rightView}>
                  <Text style={[styles.rightContent, { fontWeight: 'bold' }]}> {formatCurrency(symbol.balance, this.currency)}
                    <Text style={{ fontSize: 11 }}>{I18n.t('funds.currency')}</Text>
                  </Text>
                </View>
              </View>

              <View style={[styles.directionRow, styles.marginTopBottom10]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingAmount')}</Text>
                <View style={styles.rightView}>
                  <Text style={styles.rightContent}>
                    <Text>{I18n.t('common.fiatSymbol')}</Text>{formatCurrency(transaction.amount, this.currency)}
                  </Text>
                </View>
              </View>

              <View style={[styles.directionRow, styles.marginTopBottom10]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingBankName')}</Text>
                <View style={styles.rightView}>
                  <Text style={styles.rightContent}>
                    {transaction.bank_name}
                  </Text>
                </View>
              </View>

              {/* //TODO check lable 입금할 계좌 */}
              <View style={[styles.directionRow, styles.marginTopBottom10]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingBankAccount')}</Text>
                <View style={styles.rightView}>
                  <Text style={styles.rightContent}>
                    {transaction.foreign_bank_account}
                  </Text>
                </View>
              </View>

              <View style={[styles.directionRow, styles.marginTopBottom10]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingAccountNote')}</Text>
                <View style={styles.rightView}>
                  <Text style={styles.rightContent}>
                    {transaction.foreign_bank_account_holder}
                  </Text>
                </View>
              </View>

              <View style={[styles.directionRow, styles.marginTopBottom10]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingDepositCode')}</Text>
                <View style={styles.rightView}>
                  <Text style={[styles.rightContent, { color: 'red', fontWeight: 'bold' }]}>
                    {transaction.deposit_code}
                  </Text>
                </View>
              </View>

            </View>
            <TouchableOpacity
              onPress={() => this.setState({ checked: !this.state.checked })}
              style={styles.checkboxOutline}>
              <CheckBox
                containerStyle={{ backgroundColor: '#aaaaaa', borderWidth: 0 }}
                checkedColor='blue'
                uncheckedColor='blue'
                size={15}
                iconRight
                checked={this.state.checked}
                onPress={() => this.setState({ checked: !this.state.checked })} />
              <TouchableOpacity style={{ marginLeft: -15 }}>
                <Text style={{ color: 'blue' }}>{I18n.t('deposit.pendingNote')}</Text>
              </TouchableOpacity>
              <Text style={{}}>{I18n.t('deposit.pendingCheck')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!this.state.checked}
              onPress={() => this.setState({ modalConfirm: true })}
              style={[styles.confirm, this.state.checked ? styles.enable : styles.disable]}>
              <Text style={this.state.checked ? styles.textEnable : styles.textDisbale}>{I18n.t('deposit.pendingCancel')}</Text>
            </TouchableOpacity>
          </ScrollView >
        }
        {/* Confirm deposit */}
        <Modal
          isVisible={this.state.modalConfirm}
          onBackdropPress={() => this.setState({ modalConfirm: false })}>
          <View style={styles.modalStyle}>
            <View style={styles.headerModal}>
              <Text>{I18n.t('deposit.confirmTitle')}</Text>
            </View>

            <View style={styles.krwStyle}>
              <Text style={{ marginRight: 10 }}>{I18n.t('deposit.amountToDeposit')}</Text>
              <Text>{formatCurrency(transaction.amount, this.currency)}
                <Text style={{ fontSize: 11 }}>{I18n.t('funds.currency')}</Text>
              </Text>
            </View>
            <Text style={{ marginTop: 10, marginBottom: 10 }}>{I18n.t('deposit.pendingConfirmContent')}</Text>
            <View style={styles.modalAction}>
              <TouchableOpacity
                onPress={() => this.setState({ modalConfirm: false })}
                style={styles.note}>
                <Text style={styles.textNote}>{I18n.t('deposit.actionCancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this._execute.bind(this)}
                style={styles.confirmStyle}>
                <Text style={styles.textConfirmStyle}>{I18n.t('deposit.actionConfirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View >
    )
  }
}

// export default withNavigationFocus(KRWPendingScreen)

const styles = ScaledSheet.create({
  alignCenter: { alignItems: 'center', justifyContent: 'center' },
  directionColumn: { flexDirection: 'column', flex: 1 },
  directionRow: { flexDirection: 'row' },
  containerMargin: { marginTop: 10, marginLeft: 40, marginRight: 40 },
  marginTopBottom10: { marginBottom: 10, marginTop: 10 },
  leftView: { flex: 0.7 },
  rightView: { flex: 1, alignContent: 'flex-end' },
  rightContent: { flex: 1, alignSelf: 'flex-end' },
  confirm: {
    flexDirection: 'row', height: 45, marginTop: 20,
    flex: 1, marginLeft: 20, marginRight: 20, justifyContent: 'center', alignItems: 'center',
  },
  enable: { backgroundColor: '#e58d29' },
  disable: { backgroundColor: '#aaaaaa' },
  textEnable: { color: 'white' },
  textDisbale: { color: 'black' },
  modalStyle: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    alignContent: 'center',
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  },
  headerModal: {
    borderBottomWidth: 1, borderColor: '#aaa', height: 50, width: '100%',
    justifyContent: 'center', alignItems: 'center'
  },
  krwStyle: {
    width: '100%', justifyContent: 'center',
    alignItems: 'center', flexDirection: 'row',
    marginBottom: 10, marginTop: 20
  },
  note: { width: '45%', justifyContent: 'center', backgroundColor: '#aaa', height: 45 },
  modalAction: {
    width: '70%', justifyContent: 'space-between',
    alignItems: 'center', flexDirection: 'row',
    marginBottom: 20, marginTop: 10
  },
  textNote: { color: 'white', textAlign: 'center' },
  confirmStyle: { width: '45%', justifyContent: 'center', backgroundColor: 'blue', height: 45 },
  textConfirmStyle: { color: 'white', textAlign: 'center' },
  checkboxOutline: {
    marginTop: 20, backgroundColor: '#aaaaaa', height: 45, flexDirection: 'row',
    flex: 1, marginLeft: 20, marginRight: 20, justifyContent: 'center', alignItems: 'center'
  },
  visible: { flex: 1 },
  unvisible: { flex: 0 }
});