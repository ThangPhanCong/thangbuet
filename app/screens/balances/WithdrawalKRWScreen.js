import React from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import BaseScreen from '../BaseScreen'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import { formatCurrency, } from '../../utils/Filters'
import { withNavigationFocus } from 'react-navigation'
import HeaderBalance from './HeaderBalance'
import { Icon, Divider } from 'react-native-elements'
import Modal from "react-native-modal"

class WithdrawalKRWScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      isPending: false,
      transaction: {},
      isComplete: false,
      daily: {},
      amount: 0,
      modalConfirm: false,
      amountConfirm: false,
      smsConfirm: false,
      otpConfirm: false,
      agree: false,
      optErr: false,
    }
    this.currency = 'krw'
  }

  componentDidMount() {
    this._loadData()
  }

  async _loadData() {
    await this._getDailyLimit()
    await this._getWithdrawalKrw()
    await this._getAuth()
    this.setState({ isComplete: true, modalConfirm: false, amount: 0 })
  }

  componentWillUnmount() {
    this.setState({ isComplete: false, modalConfirm: false, amount: 0 })
  }

  getSocketEventHandlers() {
    return {
      BalanceUpdated: this._onBalanceUpdated.bind(this),
    };
  }

  _onBalanceUpdated(data) {
    //TODO
    console.log('WithdrawalKRWScreen update', data)
  }

  async _getAuth() {
    try {
      const securityRes = await rf.getRequest('UserRequest').getSecuritySettings()
      // console.log('securityRes', securityRes)
      this.setState({
        smsConfirm: securityRes.data.otp_verified == 0,
        otpConfirm: securityRes.data.otp_verified == 1,
      })
    } catch (err) {
      console.log('Some errors has occurred in _getAuth ', err)
    }
  }

  async _getDailyLimit() {
    try {
      let { daily } = this.state;
      const withdrawalLimit = await this._getItemDaily();

      daily.withdrawalLimit = parseFloat(withdrawalLimit.daily_limit)
      daily.minium = parseFloat(withdrawalLimit.minium_withdrawal)
      this.setState({ daily })
    } catch (err) {
      console.log("Some errors has occurred in  DailyLimit._error:", err)
    }
  }

  async _getItemDaily() {
    try {
      const securityLevel = await this._getSecurityLevel()

      if (securityLevel < 4) {
        return 0
      }

      const rpSymbol = await rf.getRequest('MasterdataRequest').getAll();
      const currency = this.currency
      const rpDaily = rpSymbol.withdrawal_limits.find(item => item.security_level === securityLevel && item.currency === currency);

      return rpDaily;

    } catch (err) {
      console.log('Some errors has occurred in  GetItemDaily:', err)
    }
  }

  async _getSecurityLevel() {
    try {
      const rpUser = await rf.getRequest('UserRequest').getCurrentUser()
      let currentUser = { ...rpUser.data }
      const { encodeAccount, decodeAccount } = this._getUserInfo(rpUser.data)
      currentUser.encodeAccount = encodeAccount
      currentUser.decodeAccount = decodeAccount
      // console.log('currentUser', currentUser)

      this.setState({ currentUser })

      return rpUser.data.security_level
    } catch (err) {
      console.log('GetSecurityLevel:', err)
    }
  }

  async _getWithdrawalKrw() {
    try {
      let { daily } = this.state;
      const rpDailyKrw = await rf.getRequest('TransactionRequest').getWithdrawalDailyKrw({ 'currency': this.currency })

      daily.withdrawalKrw = rpDailyKrw.data;
      this.setState({ daily })
    } catch (err) {
      console.log("_getWithdrawalKrw:", err)
    }
  }

  _getUserInfo(currentUser) {
    const realAccount = currentUser.real_account_no
    let encodeAccount = ''
    let decodeAccount = ''

    if (currentUser.bank && currentUser.bank != null) {
      encodeAccount += currentUser.bank
      decodeAccount += currentUser.bank
    }

    if (realAccount.length > 6) {
      encodeAccount += " " + realAccount.substring(0, 3) + "***" + realAccount.substring(6, realAccount.length)
    } else if (realAccount.length > 2) {
      encodeAccount += " " + realAccount.substring(0, 3) + "***"
    } else {
      encodeAccount += " " + realAccount + "***"
    }
    decodeAccount += " " + realAccount

    if (currentUser.name && currentUser.name != null) {
      encodeAccount += " " + currentUser.name
      decodeAccount += " " + currentUser.name
    }
    return { encodeAccount, decodeAccount }
  }

  _validateAmount() {
    const { amount, daily } = this.state
    let errMsg = ''

    if (daily.minium > amount) {
      errMsg = I18n.t('withdrawal.errMinium')
    } else if (amount > (daily.withdrawalLimit - daily.withdrawalKrw)) {
      errMsg = I18n.t('withdrawal.errMaximum')
    }

    if (errMsg === '') {
      this.setState({ amountConfirm: true })
    } else {
      Alert.alert(
        I18n.t('deposit.error'),
        errMsg,
        [{ text: I18n.t('deposit.accept'), onPress: () => { } },],
        { cancelable: false }
      )
    }
  }

  _doConfirm() {
    this.setState({ amountConfirm: false, agree: true })
  }

  async _doWithdrawal() {
    try {
      const { amount } = this.state
      let params = {
        amount: this.state.amount * -1 + '',
        currency: this.currency,
        otp: this.state.otpConfirm ? this.state.otp + '|' : '|' + this.state.otp
      }
      const withdrawalRes = await rf.getRequest('TransactionRequest').withdrawKrw(params)
      this.setState({ optErr: false })
      this._loadData()
    } catch (err) {
      console.log("_getWithdrawalKrw:", err)
      this.setState({ optErr: true })
    }
  }

  async _doRequestSmsOtp() {
    try {
      const smsOtpRes = await rf.getRequest('UserRequest').sendSmsOtp({})
    } catch (err) {
      console.log("_getWithdrawalKrw:", err)
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
            <ScrollView>
              <View style={styles.alignCenter}>
                <Text style={{ fontWeight: 'bold' }}>{symbol.code.toUpperCase() + " " + I18n.t('deposit.title')}</Text>
              </View>
              <View style={[styles.header, styles.line]}>
                <View style={styles.row}>
                  <Text style={styles.leftView}>{I18n.t('withdrawal.balance')}</Text>
                  <View style={styles.rightView}>
                    <Text style={styles.rightContent}>
                      {formatCurrency(symbol.balance, this.currency)}
                      <Text style={styles.symbol}>{I18n.t('funds.currency')}</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.leftView}>{I18n.t('withdrawal.available')}</Text>
                  <View style={styles.rightView}>
                    <Text style={styles.rightContent}>
                      {formatCurrency(this.state.daily.withdrawalLimit - this.state.daily.withdrawalKrw, this.currency)}
                      <Text style={styles.symbol}>{I18n.t('funds.currency')}</Text>
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[styles.line, styles.amount]}>
                <Text>
                  {I18n.t('withdrawal.request')}
                  <Text>({I18n.t('funds.currency')})</Text>
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.3)"
                }}>
                  <TextInput
                    keyboardType='numeric'
                    value={formatCurrency(this.state.amount, this.currency)}
                    // value={this.state.amount + ''}
                    onChangeText={(text) => {
                      // console.log(text, text.split(',').join(''))
                      this.setState({ amount: parseFloat(text.split(',').join('')) })
                    }}
                    // onChangeText={(text) => this.setState({ amount: parseFloat(text) })}
                    style={{ flex: 1, height: 30, textAlign: 'right', paddingRight: 5 }} />
                  <Text style={{ fontSize: 11 }}>{this.currency.toString().toUpperCase()}</Text>
                  <TouchableOpacity
                    style={{
                      borderLeftWidth: 1, borderColor: "rgba(0, 0, 0, 0.3)",
                      height: 30, justifyContent: 'center', padding: 5
                    }}
                    onPress={() => this.setState({ amount: this.state.daily.withdrawalLimit - this.state.daily.withdrawalKrw })}>
                    <Text>{I18n.t('withdrawal.maximum')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.line, styles.amount]}>
                <Text>{I18n.t('withdrawal.accountRegister')}</Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  borderWidth: 1, borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.3)"
                }}>
                  <TextInput
                    editable={false}
                    value={this.state.currentUser.encodeAccount}
                    style={{ flex: 1, height: 30, textAlign: 'right', opacity: 0.7 }} />
                </View>
              </View>

              <TouchableOpacity
                style={{
                  flex: 1, alignItems: 'center', height: 35, justifyContent: 'center',
                  borderLeftWidth: 1, borderRadius: 4, backgroundColor: 'blue', borderColor: 'blue',
                  marginTop: 20, marginLeft: 40, marginRight: 40,
                }}
                onPress={this._validateAmount.bind(this)}>
                <Text style={{ color: 'white' }}>{I18n.t('withdrawal.confirm')}</Text>
              </TouchableOpacity>

              <Divider style={{ backgroundColor: '#aaaaaa', flex: 1, marginTop: 20, marginBottom: 20 }} />

              <View style={{ marginLeft: 20, marginRight: 20, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{
                  borderBottomWidth: 1, borderBottomColor: '#aaaaaa', width: '100%',
                  justifyContent: 'center', alignItems: 'center'
                }}>
                  <Text style={{ paddingBottom: 10, fontWeight: 'bold' }}>{I18n.t('withdrawal.noteTitle')}</Text>
                </View>

                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('withdrawal.noteLine1')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('withdrawal.noteLine2')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('withdrawal.noteLine3')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={[styles.noteTitle, { fontWeight: 'bold' }]}>
                    {'\u2022' + I18n.t('withdrawal.noteLine4')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('withdrawal.noteLine5')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('withdrawal.noteLine6')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('withdrawal.noteLine7')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('withdrawal.noteLine8')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('withdrawal.noteLine9')}
                  </Text>
                </View>

                <View style={{
                  borderBottomWidth: 1, borderBottomColor: '#aaaaaa', width: '100%',
                  justifyContent: 'center', alignItems: 'center', marginTop: 30,
                }}>
                  <Text style={{ paddingBottom: 10, fontWeight: 'bold' }}>{I18n.t('withdrawal.noteTitle')}</Text>
                </View>

                <View style={styles.noteContainer}>
                  <Text style={[styles.noteTitle, { lineHeight: 20 }]}>
                    {I18n.t('withdrawal.noteLine10')}
                  </Text>
                </View>

                <View style={[styles.noteContainer, { marginTop: 20 }]}>
                  <Text style={[styles.noteTitle, { lineHeight: 20 }]}>
                    {I18n.t('withdrawal.noteLine11')}
                  </Text>
                </View>

                <View style={[styles.noteContainer, { marginTop: 20, paddingBottom: 50 }]}>
                  <View style={[styles.table, { backgroundColor: '#e4eef8', borderTopWidth: 1, }]}>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.tbTitleDepost')}</Text>
                    <Text style={[styles.tbRow, styles.tbArrow]}></Text>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.tbTitleTrades')}</Text>
                    <Text style={[styles.tbRow, styles.tbArrow]}></Text>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.tbtitleWithdrawal')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.tbTitleLimit')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row1Col1')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row1Col2')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row1Col3')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.row1Col4')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row2Col1')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row2Col2')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row2Col3')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.row2Col4')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row3Col1')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row3Col2')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row3Col3')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.row3Col4')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}>{I18n.t('withdrawal.row4Col1')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbColor]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}>{I18n.t('withdrawal.row4Col2')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbColor]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}>{I18n.t('withdrawal.row4Col3')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}> {I18n.t('withdrawal.row4Col4')}</Text>
                  </View>

                </View>
              </View>
            </ScrollView>

            <Modal
              isVisible={this.state.amountConfirm}
              onModalHide={() => {
                if (this.state.agree) {
                  this.setState({ modalConfirm: true })
                }
              }}
              onBackdropPress={() => this.setState({ amountConfirm: false, agree: false })}>
              {this._renderAmountContent()}
            </Modal>

            <Modal
              isVisible={this.state.smsConfirm && this.state.modalConfirm}
              onBackdropPress={() => this.setState({ modalConfirm: false, agree: false })}>
              {this._renderSmsContent()}
            </Modal>

            <Modal
              isVisible={this.state.otpConfirm && this.state.modalConfirm}
              onModalHide={() => {
                this.setState({ optErr: false, otp: '' })
              }}
              onBackdropPress={() => this.setState({ modalConfirm: false, agree: false })}>
              {this._renderOtpContent()}
            </Modal>
          </View>
        }
      </SafeAreaView>
    )
  }

  _renderAmountContent() {
    return (
      <View style={styles.modalStyle}>
        <View style={styles.headerModalStyle}>
          <Text>{I18n.t('withdrawal.amountConfirmTitle')}</Text>
        </View>
        <View>
          <Text style={{ marginTop: 10, marginBottom: 3 }}>
            {'\u2022' + I18n.t('withdrawal.amountNumber')}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            {formatCurrency(this.state.amount, this.currency)}
            <Text style={{ fontSize: 11 }}>{this.currency.toString().toUpperCase()}</Text>
          </Text>
          <Text style={{ marginTop: 10, marginBottom: 3 }}>
            {'\u2022' + I18n.t('withdrawal.amountAccount')}
          </Text>
          <Text style={{ marginBottom: 10 }}>
            {this.state.currentUser.decodeAccount}
          </Text>
          <Text style={{ marginBottom: 10, marginTop: 10 }}>{I18n.t('withdrawal.amountMessage')}</Text>

          <View style={styles.modalActionStyle}>
            <TouchableOpacity
              onPress={() => this.setState({ amountConfirm: false, agree: false })}
              style={{ width: '45%', justifyContent: 'center', backgroundColor: '#aaa', height: 30, borderRadius: 4, }}>
              <Text style={{ color: 'white', textAlign: 'center' }}>{I18n.t('withdrawal.amountCancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this._doConfirm.bind(this)}
              style={{ width: '45%', justifyContent: 'center', backgroundColor: 'blue', height: 30, borderRadius: 4, }}>
              <Text style={{ color: 'white', textAlign: 'center' }}>{I18n.t('withdrawal.amountAccept')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  _renderSmsContent() {
    return (
      <View style={[styles.modalStyle, { alignContent: 'center', justifyContent: 'center', }]}>
        <View style={styles.headerModalStyle}>
          <Text>{I18n.t('withdrawal.smsConfirmTitle')}</Text>
        </View>

        <Text style={{ width: '80%', marginTop: 10, marginBottom: 10, textAlign: 'center' }}>{I18n.t('withdrawal.smsContent')}</Text>

        <View style={{
          width: '80%', alignContent: 'center', justifyContent: 'center', flexDirection: 'row',
          borderWidth: 1, borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)",
          marginTop: 10, marginBottom: 10
        }}>
          <TextInput
            keyboardType='numeric'
            value={this.state.otp}
            onChangeText={(text) => this.setState({ otp: text })}
            style={{ flex: 1, height: 30, textAlign: 'center' }} />
          <TouchableOpacity
            onPress={this._doRequestSmsOtp.bind(this)}
            style={{
              justifyContent: 'center', backgroundColor: '#e0742c', height: 30, borderWidth: 0,
              borderColor: "rgba(0, 0, 0, 0.1)", borderTopRightRadius: 4, borderBottomRightRadius: 4, padding: 5
            }}>
            <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>{I18n.t('withdrawal.smsRequestCode')}</Text>
          </TouchableOpacity>
        </View>

        {
          this.state.optErr &&
          <Text style={{ color: 'red', marginTop: 10, marginBottom: 10, textAlign: 'center' }}>
            {I18n.t('withdrawal.optErrMsg')}
          </Text>
        }

        <TouchableOpacity
          onPress={this._doWithdrawal.bind(this)}
          style={{
            width: '80%', justifyContent: 'center', backgroundColor: 'blue', height: 30, borderRadius: 4,
            marginTop: 10, marginBottom: 20
          }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>{I18n.t('withdrawal.smsAction')}</Text>
        </TouchableOpacity>
      </View >
    )
  }

  _renderOtpContent() {
    return (
      <View style={[styles.modalStyle, { alignContent: 'center', justifyContent: 'center', }]}>
        <View style={styles.headerModalStyle}>
          <Text>{I18n.t('withdrawal.optConfirmTitle')}</Text>
        </View>

        <Text style={{ width: '80%', marginTop: 10, marginBottom: 10, textAlign: 'center' }}>
          {I18n.t('withdrawal.optContent')}
        </Text>

        <View style={{
          width: '80%', alignContent: 'center', justifyContent: 'center', flexDirection: 'row',
          borderWidth: 1, borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)",
          marginTop: 10, marginBottom: 10
        }}>
          <TextInput
            keyboardType='numeric'
            value={this.state.otp}
            onChangeText={(text) => this.setState({ otp: text })}
            style={{ flex: 1, height: 30, textAlign: 'center' }} />
        </View>

        {
          this.state.optErr &&
          <Text style={{ color: 'red', marginTop: 10, marginBottom: 10, textAlign: 'center' }}>
            {I18n.t('withdrawal.optErrMsg')}
          </Text>
        }

        <TouchableOpacity
          onPress={this._doWithdrawal.bind(this)}
          style={{
            width: '80%', justifyContent: 'center', backgroundColor: 'blue', height: 30, borderRadius: 4,
            marginTop: 10, marginBottom: 20
          }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>{I18n.t('withdrawal.smsAction')}</Text>
        </TouchableOpacity>
      </View >
    )
  }
}

export default withNavigationFocus(WithdrawalKRWScreen)

const styles = ScaledSheet.create({
  fullScreen: { flex: 1 },
  content: { flex: 1, flexDirection: "column" },
  alignCenter: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'column', flex: 1
  },
  line: {
    justifyContent: 'center', alignItems: 'center', marginTop: 10, marginLeft: 40, marginRight: 40
  },
  row: { flexDirection: 'row' },
  leftView: { flex: 0.9 },
  rightView: { flex: 1, alignContent: 'flex-end' },
  rightContent: { flex: 1, alignSelf: 'flex-end', fontWeight: 'bold' },
  symbol: { fontSize: 11 },
  amount: {
    flexDirection: 'column', flex: 1, alignItems: 'flex-start', justifyContent: 'center', marginTop: 20
  },
  noteContainer: { marginTop: 10, flexDirection: 'column', width: '100%' },
  noteTitle: { flexWrap: 'wrap', fontSize: 13, },
  tbContent: {
    flex: 1,
  },
  tbArrow: {
    flex: 0.5,
  },
  tbColor: {
    color: 'red'
  },
  tbRow: {
    height: 30, lineHeight: 30,
    textAlign: "center", textAlignVertical: "center",
  },
  table: {
    flexDirection: 'row', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center'
  },
  modalStyle: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    alignContent: 'center',
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)"
  },
  headerModalStyle: {
    borderBottomWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", height: 50, width: '100%',
    justifyContent: 'center', alignItems: 'center'
  },
  modalActionStyle: {
    width: '70%', justifyContent: 'space-between',
    alignItems: 'center', flexDirection: 'row',
    marginBottom: 20, marginTop: 10
  }
});