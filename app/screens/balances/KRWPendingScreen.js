import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View, Image } from 'react-native'
import BaseScreen from '../BaseScreen'

import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { CheckBox } from 'react-native-elements'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import { formatCurrency, getCurrencyName } from '../../utils/Filters'
import Modal from "react-native-modal"
import { CommonColors, CommonSize, CommonStyles, Fonts } from '../../utils/CommonStyles'
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import ModalNote from "./ModalNote";

export default class KRWPendingScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      checked: true,
      amount: 0,
      modalConfirm: false,
      noteDeposit: false
    }
    this.currency = 'krw'
  }

  componentDidMount() {
    super.componentDidMount()
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
      noteDeposit: false
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

  hideModalNote(){
    this.setState({ noteDeposit: false })
  }

  confirmChecked(){
    this.setState({ checked: true })
  }

  render() {
    const { symbol, transaction, isPending } = this.props
    return (
      <View style={isPending ? styles.visible : styles.unvisible}>
        {isPending &&
          <ScrollView >
            <View style={styles.alignCenter}>
              <Text style={styles.title}>{getCurrencyName(symbol.code) + " " + I18n.t('deposit.title')}</Text>
            </View>

            <View style={[styles.alignCenter, styles.directionColumn, styles.containerMargin]}>
              <View style={[styles.directionRow, styles.spaceRow]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingAccount')}</Text>
                <View style={styles.rightView}>
                  <Text style={[styles.rightContent, styles.amount]}> {formatCurrency(symbol.balance, this.currency)}
                    <Text style={styles.amountSymbol}>{" " + I18n.t('funds.currency')}</Text>
                  </Text>
                </View>
              </View>

              <View style={[styles.directionRow, styles.spaceRow]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingAmount')}</Text>
                <View style={styles.rightView}>
                  <Text style={styles.rightContent}>
                    <Text>{I18n.t('common.fiatSymbol')}</Text>{formatCurrency(transaction.amount, this.currency)}
                  </Text>
                </View>
              </View>

              <View style={[styles.directionRow, styles.spaceRow]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingBankName')}</Text>
                <View style={styles.rightView}>
                  <Text style={styles.rightContent}>
                    {transaction.bank_name}
                  </Text>
                </View>
              </View>

              {/* //TODO check lable 입금할 계좌 */}
              <View style={[styles.directionRow, styles.spaceRow]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingBankAccount')}</Text>
                <View style={styles.rightView}>
                  <Text style={styles.rightContent}>
                    {transaction.foreign_bank_account}
                  </Text>
                </View>
              </View>

              <View style={[styles.directionRow, styles.spaceRow]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingAccountNote')}</Text>
                <View style={styles.rightView}>
                  <Text style={styles.rightContent}>
                    {transaction.foreign_bank_account_holder}
                  </Text>
                </View>
              </View>

              <View style={[styles.directionRow, styles.spaceRow]}>
                <Text style={styles.leftView}>{I18n.t('deposit.pendingDepositCode')}</Text>
                <View style={styles.rightView}>
                  <Text style={[styles.rightContent, styles.depositCode]}>
                    {transaction.deposit_code}
                  </Text>
                </View>
              </View>

            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.setState({ checked: !this.state.checked })}
              style={styles.checkboxOutline}>
              {this.state.checked ?
                <Image
                  resizeMode="contain"
                  style={styles.iconLogo}
                  source={require('../../../assets/balance/checked.png')} />
                :
                <Image
                  resizeMode="contain"
                  style={styles.iconLogo}
                  source={require('../../../assets/balance/unchecked.png')} />
              }
              <TouchableOpacity onPress={() => this.setState({ noteDeposit: true })}>
                <Text style={[{ color: 'rgba(0, 112, 192, 1)' }, styles.pendingNote]}>{I18n.t('deposit.pendingNote')}</Text>
              </TouchableOpacity>
              <Text style={{fontSize: scale(11), ...Fonts.NanumGothic_Regular}}>{I18n.t('deposit.pendingCheck')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
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
              <Text style={[styles.fontSize12, styles.modalText]}>{I18n.t('deposit.confirmTitleKRW')}</Text>
            </View>

            <View style={styles.krwStyle}>
              <Text style={[styles.fontSize12, styles.modalText, styles.marginRight10]}>{I18n.t('deposit.amountToDeposit')}</Text>
              <Text style={[styles.fontSize12, styles.modalText, { ...Fonts.NanumGothic_Bold }]}>
                {formatCurrency(transaction.amount, this.currency)}
              </Text>
              <Text style={styles.currencyConfirm}>{' ' + I18n.t('funds.currency')}</Text>
            </View>
            <Text style={[styles.fontSize12, styles.modalText, styles.marginBoth10]}>
              <Text style={styles.pendingConfirmBold}>{I18n.t('deposit.pendingConfirmContent')}</Text>
              {I18n.t('deposit.pendingConfirmContent1')}
            </Text>
            <View style={styles.modalAction}>
              <TouchableOpacity
                onPress={() => this.setState({ modalConfirm: false })}
                style={[styles.modalConfirmBtn, styles.btnCancel]}>
                <Text style={styles.textNote}>{I18n.t('deposit.actionCancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this._execute.bind(this)}
                style={[styles.modalConfirmBtn, styles.btnAccept]}>
                <Text style={styles.textNote}>{I18n.t('deposit.actionConfirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/*Note on Deposit*/}
        <ModalNote noteDeposit={this.state.noteDeposit} checked={this.state.checked}
                   hideModalNote={this.hideModalNote.bind(this)} confirmChecked={this.confirmChecked.bind(this)}/>

      </View >
    )
  }
}

// export default withNavigationFocus(KRWPendingScreen)

const styles = ScaledSheet.create({
  alignCenter: { alignItems: 'center', justifyContent: 'center' },
  directionColumn: { flexDirection: 'column', flex: 1 },
  directionRow: { flexDirection: 'row', alignItems: 'flex-end' },
  containerMargin: { marginTop: '10@s', marginLeft: '40@s', marginRight: '40@s' },
  spaceRow: { marginBottom: '10@s', marginTop: '10@s' },
  leftView: { flex: 0.7, ...Fonts.NanumGothic_Regular, fontSize: '12@s' },
  rightView: { flex: 1, alignContent: 'flex-end' },
  rightContent: { flex: 1, alignSelf: 'flex-end', ...Fonts.NanumGothic_Regular, fontSize: '12@s' },
  confirm: {
    flexDirection: 'row', height: '35@s', marginTop: '20@s', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)",
    flex: 1, marginLeft: '40@s', marginRight: '40@s', justifyContent: 'center', alignItems: 'center',
  },
  enable: { backgroundColor: 'rgba(237, 125, 49, 1)' },
  disable: { backgroundColor: 'rgba(242, 242, 242, 1)' },
  textEnable: { color: 'white', fontSize: '11@s', ...Fonts.NanumGothic_Regular },
  textDisbale: { color: 'black', fontSize: '11@s', ...Fonts.NanumGothic_Regular },
  modalStyle: {
    backgroundColor: "white", justifyContent: "center", alignItems: "center",
    alignContent: 'center', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)"
  },
  headerModal: {
    borderBottomWidth: '1@s', borderColor: 'rgba(235, 235, 235, 1)', height: '50@s', width: '100%',
    justifyContent: 'center', alignItems: 'center'
  },
  krwStyle: {
    width: '100%', justifyContent: 'center', alignItems: 'flex-end', flexDirection: 'row',
    marginBottom: '10@s', marginTop: '20@s'
  },
  note: { width: '45%', justifyContent: 'center', backgroundColor: '#aaa', height: '45@s' },
  modalAction: {
    width: '70%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row',
    marginBottom: '20@s', marginTop: '10@s'
  },
  textNote: { color: 'white', textAlign: 'center', fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  confirmStyle: { width: '45%', justifyContent: 'center', backgroundColor: 'blue', height: '45@s' },
  checkboxOutline: {
    marginTop: '20@s', backgroundColor: 'rgba(242, 242, 242, 1)', height: '35@s', flexDirection: 'row',
    flex: 1, marginLeft: '40@s', marginRight: '40@s', justifyContent: 'center', alignItems: 'center',
    borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)"
  },
  visible: { flex: 1 },
  unvisible: { flex: 0 },
  title: { ...Fonts.NotoSans_Bold, fontSize: '14@s', marginTop: '10@s' },
  amount: { ...Fonts.OpenSans_Bold, fontSize: '16@s' },
  amountSymbol: { fontSize: '10@s' },
  depositCode: { color: 'red', ...Fonts.NanumSquareOTF_ExtraBold, fontSize: '16@s' },
  iconLogo: { height: '15@s', width: '15@s', margin: '2@s', marginRight: '5@s' },
  fontSize12: { fontSize: '12@s' },
  modalText: { ...Fonts.NanumGothic_Regular, alignContent: 'flex-end' },
  marginRight10: { marginRight: '10@s' },
  modalConfirmBtn: {
    width: '45%', justifyContent: 'center', height: '35@s',
    borderColor: 'rgba(222, 227, 235, 1)', borderRadius: '4@s', borderWidth: '1@s'
  },
  modalConfirmText: { color: 'white', textAlign: 'center', ...Fonts.NanumGothic_Regular, fontSize: '12@s' },
  btnCancel: { backgroundColor: 'rgba(127, 127, 127, 1)' },
  btnAccept: { backgroundColor: 'rgba(0, 112, 192, 1)' },
  pendingConfirmBold: {
    ...Fonts.NanumGothic_Bold
  },
  currencyConfirm: {
    fontSize: '12@s',
    ...Fonts.NanumGothic_Regular,
  },
  pendingNote: {
    fontSize: '11@s', ...Fonts.NanumGothic_Bold, textDecorationLine: 'underline'
  }
});