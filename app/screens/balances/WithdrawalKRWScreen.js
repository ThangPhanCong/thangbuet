import React from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import BaseScreen from '../BaseScreen'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import { formatCurrency, getCurrencyName } from '../../utils/Filters'
import { withNavigationFocus } from 'react-navigation'
import { Icon, Divider } from 'react-native-elements'
import Modal from "react-native-modal"
import { Fonts } from '../../utils/CommonStyles'

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
      const rpUser = await rf.getRequest('UserRequest').getCurrentUser();
      let currentUser = { ...rpUser.data };
      const { encodeAccount, decodeAccount } = this._getUserInfo(rpUser.data);

      currentUser.encodeAccount = encodeAccount;
      currentUser.decodeAccount = decodeAccount;

      this.setState({ currentUser })

      return rpUser.data.security_level
    } catch (err) {
      console.log('GetSecurityLevel:', err)
    }
  }

  async _getWithdrawalKrw() {
    try {
      let { daily } = this.state;
      const rpDailyKrw = await rf.getRequest('TransactionRequest').getWithdrawalDaily({ 'currency': this.currency })

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

    if(realAccount) {
      if (realAccount.length > 6) {
        encodeAccount += " " + realAccount.substring(0, 3) + "***" + realAccount.substring(6, realAccount.length)
      } else if (realAccount.length > 2) {
        encodeAccount += " " + realAccount.substring(0, 3) + "***"
      } else {
        encodeAccount += " " + realAccount + "***"
      }
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
            <View style={styles.logo}>
              <Image
                resizeMode="contain"
                style={styles.iconLogo}
                source={require('../../../assets/balance/logo_tab3.png')} />
              <Text style={[styles.fontNotoSansBold]}>
                {I18n.t('balances.depositAndWithdrawal')}
              </Text>
            </View>

            <ScrollView>
              <View style={styles.alignCenter}>
                <Text style={styles.title}>{getCurrencyName(symbol.code) + " " + I18n.t('deposit.title')}</Text>
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
                <Text style={[styles.amountText, styles.textInline]}>
                  {I18n.t('withdrawal.request')}
                  <Text>({I18n.t('funds.currency')})</Text>
                </Text>
                <View style={styles.amountWrapper}>
                  <TextInput
                    keyboardType='numeric'
                    autoCorrect={false}
                    underlineColorAndroid='rgba(0, 0, 0, 0)'
                    value={formatCurrency(this.state.amount, this.currency)}
                    onChangeText={(text) => this.setState({ amount: parseFloat(text.split(',').join('')) })}
                    style={[styles.amountInput, styles.amountText]} />
                  <Text style={styles.amountText}>{getCurrencyName(this.currency)}</Text>
                  <TouchableOpacity
                    style={styles.amountActionInline}
                    onPress={() => this.setState({ amount: this.state.daily.withdrawalLimit - this.state.daily.withdrawalKrw })}>
                    <Text style={styles.amountText}>{I18n.t('withdrawal.maximum')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.line, styles.amount]}>
                <Text style={[styles.amountText, styles.textInline]}>{I18n.t('withdrawal.accountRegister')}</Text>
                <View style={styles.accountWrapper}>
                  <TextInput
                    editable={false}
                    value={this.state.currentUser.encodeAccount}
                    autoCorrect={false}
                    underlineColorAndroid='rgba(0, 0, 0, 0)'
                    style={[styles.accountInput, styles.amountText]} />
                </View>
              </View>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={this._validateAmount.bind(this)}>
                <Text style={styles.actionText}>{I18n.t('withdrawal.confirm')}</Text>
              </TouchableOpacity>

              <Divider style={styles.divider} />

              <View style={styles.noteWrapper}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.noteHeader}>{I18n.t('withdrawal.noteTitle')}</Text>
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
                  <Text style={[styles.noteTitle, { ...Fonts.NanumGothic_Bold }]}>
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

                <View style={styles.noteWrapperMore}>
                  <Text style={styles.titleMore}>{I18n.t('withdrawal.noteTitle')}</Text>
                </View>

                <View style={styles.noteContainer}>
                  <Text style={[styles.noteTitle, styles.noteLineHeight]}>
                    {I18n.t('withdrawal.noteLine10')}
                  </Text>
                </View>

                <View style={[styles.noteContainer, styles.notephra]}>
                  <Text style={[styles.noteTitle, styles.noteLineHeight]}>
                    {I18n.t('withdrawal.noteLine11')}
                  </Text>
                </View>

                <View style={[styles.noteContainer, styles.noteTableSpace]}>
                  <View style={[styles.table, styles.tbHeader]}>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.tbTitleDepost')}</Text>
                    <Text style={[styles.tbRow, styles.tbArrow]}></Text>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.tbTitleTrades')}</Text>
                    <Text style={[styles.tbRow, styles.tbArrow]}></Text>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.tbtitleWithdrawal')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.tbTitleLimit')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row1Col1')}</Text>
                    <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')}/>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row1Col2')}</Text>
                    <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')}/>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row1Col3')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.row1Col4')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row2Col1')}</Text>
                    <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')}/>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row2Col2')}</Text>
                    <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')}/>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row2Col3')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.row2Col4')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row3Col1')}</Text>
                    <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')}/>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row3Col2')}</Text>
                    <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')}/>
                    <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row3Col3')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.row3Col4')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}>{I18n.t('withdrawal.row4Col1')}</Text>
                    <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')}/>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}>{I18n.t('withdrawal.row4Col2')}</Text>
                    <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')}/>
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
          <Text style={styles.headerModalTitle}>{I18n.t('withdrawal.amountConfirmTitle')}</Text>
        </View>
        <View style={{ width: '80%', justifyContent: 'center', alignItems: 'flex-start' }}>
          <Text style={styles.modalLine}>
            {'\u2022' + I18n.t('withdrawal.amountNumber')}
          </Text>
          <Text style={[styles.lineSpace, styles.modalAmount]}>
            {formatCurrency(this.state.amount, this.currency)}
            <Text>{getCurrencyName(this.currency)}</Text>
          </Text>
          <Text style={styles.modalLine}>
            {'\u2022' + I18n.t('withdrawal.amountAccount')}
          </Text>
          <Text style={styles.lineSpace}>
            {this.state.currentUser.decodeAccount}
          </Text>
          <Text style={styles.messageSpace}>{I18n.t('withdrawal.amountMessage')}</Text>

          <View style={styles.modalActionStyle}>
            <TouchableOpacity
              onPress={() => this.setState({ amountConfirm: false, agree: false })}
              style={styles.modalCancelBtn}>
              <Text style={styles.modalBtnText}>{I18n.t('withdrawal.amountCancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this._doConfirm.bind(this)}
              style={styles.modalAcceptBtn}>
              <Text style={styles.modalBtnText}>{I18n.t('withdrawal.amountAccept')}</Text>
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
          <Text style={styles.headerModalTitle}>
            <Text style={styles.titleSMS}>{I18n.t('withdrawal.smsConfirmTitle')}</Text>
            {I18n.t('withdrawal.smsConfirmTitle1')}</Text>
        </View>

        <Text style={styles.smsContent}>{I18n.t('withdrawal.smsContent')}</Text>

        <View style={styles.smsInputWrapper}>
          <TextInput
            autoCorrect={false}
            underlineColorAndroid='rgba(0, 0, 0, 0)'
            keyboardType='numeric'
            value={this.state.otp}
            onChangeText={(text) => this.setState({ otp: text })}
            style={styles.smsInput} />
          <TouchableOpacity
            onPress={this._doRequestSmsOtp.bind(this)}
            style={styles.smsConfirmBtn}>
            <Text style={styles.smsConfirmText}>{I18n.t('withdrawal.smsRequestCode')}</Text>
          </TouchableOpacity>
        </View>
        {
          this.state.optErr &&
          <Text style={styles.smsError}>
            {I18n.t('withdrawal.optErrMsg')}
          </Text>
        }
        <TouchableOpacity
          onPress={this._doWithdrawal.bind(this)}
          style={styles.executeBtn}>
          <Text style={styles.executeBtnText}>{I18n.t('withdrawal.smsAction')}</Text>
        </TouchableOpacity>
      </View >
    )
  }

  _renderOtpContent() {
    return (
      <View style={[styles.modalStyle, { alignContent: 'center', justifyContent: 'center', }]}>
        <View style={styles.headerModalStyle}>
          <Text style={styles.headerModalTitle}>{I18n.t('withdrawal.optConfirmTitle')}</Text>
        </View>

        <Text style={styles.optContent}>
          {I18n.t('withdrawal.optContent')}
        </Text>

        <View style={styles.optWrapper}>
          <TextInput
            autoCorrect={false}
            underlineColorAndroid='rgba(0, 0, 0, 0)'
            keyboardType='numeric'
            value={this.state.otp}
            onChangeText={(text) => this.setState({ otp: text })}
            style={styles.optInput} />
        </View>
        {
          this.state.optErr &&
          <Text style={styles.optError}>
            {I18n.t('withdrawal.optErrMsg')}
          </Text>
        }
        <TouchableOpacity
          onPress={this._doWithdrawal.bind(this)}
          style={styles.executeBtn}>
          <Text style={styles.executeBtnText}>{I18n.t('withdrawal.smsAction')}</Text>
        </TouchableOpacity>
      </View >
    )
  }
}

export default withNavigationFocus(WithdrawalKRWScreen)

const styles = ScaledSheet.create({
  fullScreen: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, flexDirection: "column" },
  alignCenter: { alignItems: 'center', justifyContent: 'center', marginTop: '10@s' },
  header: { flexDirection: 'column', flex: 1 },
  line: {
    justifyContent: 'center', alignItems: 'center', marginTop: '15@s', marginLeft: '40@s', marginRight: '40@s'
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: '5@s' },
  leftView: { flex: 0.9, fontSize: '12@s', ...Fonts.NanumGothic_Regular, paddingBottom: '3@s' },
  rightView: { flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' },
  rightContent: { flex: 1, alignSelf: 'flex-end', fontSize: '18@s', ...Fonts.OpenSans_Bold },
  symbol: { fontSize: '9@s' },
  amount: {
    flexDirection: 'column', flex: 1, alignItems: 'flex-start', justifyContent: 'center'
  },
  noteContainer: { marginTop: '10@s', flexDirection: 'column', width: '100%' },
  noteTitle: { flexWrap: 'wrap', fontSize: '11@s', ...Fonts.NanumGothic_Regular },
  tbContent: { flex: 1, ...Fonts.NanumGothic_Regular, fontSize: '11@s' },
  tbArrow: { flex: 0.5, },
  tbColor: { color: 'red' },
  tbRow: { height: '30@s', lineHeight: '30@s', textAlign: "center", textAlignVertical: "center", },
  table: {
    flexDirection: 'row', borderBottomWidth: '1@s', borderColor: 'rgba(217, 217, 217, 1)',
    justifyContent: 'center', alignItems: 'center'
  },
  modalStyle: {
    backgroundColor: "white", justifyContent: "center", alignItems: "center",
    alignContent: 'center', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)"
  },
  headerModalStyle: {
    borderBottomWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", height: '50@s', width: '100%',
    justifyContent: 'center', alignItems: 'center'
  },
  headerModalTitle: { fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  titleSMS: { fontSize: '12@s', ...Fonts.OpenSans_Bold },
  modalActionStyle: {
    width: '100%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row',
    marginBottom: '20@s', marginTop: '10@s'
  },
  logo: {
    height: '50@s', flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start',
    borderBottomWidth: '1@s', borderColor: 'rgba(222, 227, 235, 1)'
  },
  iconLogo: { height: '20@s', width: '20@s', margin: '2@s', marginLeft: '15@s', },
  title: { ...Fonts.NotoSans_Bold, fontSize: '14@s' },
  amountWrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: '1@s', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.3)"
  },
  amountText: { ...Fonts.NanumGothic_Regular, fontSize: '12@s', marginRight: '10@s' },
  amountInput: { flex: 1, height: '30@s', textAlign: 'right', paddingRight: '5@s' },
  amountSymbol: {},
  amountActionInline: {
    borderLeftWidth: 1, borderColor: "rgba(0, 0, 0, 0.3)", height: '30@s', justifyContent: 'center', padding: '5@s'
  },
  textInline: { marginBottom: '5@s' },
  accountWrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: '1@s', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.3)"
  },
  accountInput: { flex: 1, height: '30@s', textAlign: 'right', opacity: 0.9 },
  actionBtn: {
    flex: 1, alignItems: 'center', height: '35@s', justifyContent: 'center',
    borderWidth: '1@s', borderRadius: '4@s', backgroundColor: 'rgba(0, 112, 192, 1)',
    marginTop: '20@s', marginLeft: '40@s', marginRight: '40@s', borderColor: 'rgba(0, 112, 192, 1)',
  },
  actionText: { color: 'white', fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  divider: { backgroundColor: 'rgba(222, 227, 235, 1)', flex: 1, marginTop: '20@s', marginBottom: '20@s' },
  noteWrapper: { marginLeft: '20@s', marginRight: '20@s', justifyContent: 'center', alignItems: 'center' },
  titleWrapper: {
    borderBottomWidth: '1@s', borderBottomColor: 'rgba(222, 227, 235, 1)',
    width: '100%', justifyContent: 'center', alignItems: 'center'
  },
  noteHeader: { paddingBottom: '10@s', fontSize: '11@s', ...Fonts.NanumGothic_Bold },
  noteWrapperMore: {
    borderBottomWidth: '1@s', borderBottomColor: 'rgba(222, 227, 235, 1)', width: '100%',
    justifyContent: 'center', alignItems: 'center', marginTop: '30@s',
  },
  titleMore: { paddingBottom: '10@s', fontSize: '11@s', ...Fonts.NanumGothic_Bold },
  noteLineHeight: { lineHeight: '20@s' },
  notephra: { marginTop: '20@s' },
  noteTableSpace: { marginTop: '20@s', paddingBottom: '50@s' },
  tbHeader: { backgroundColor: 'rgba(228, 238, 248, 1)', borderTopWidth: '1@s', },
  modalLine: { marginTop: '10@s', marginBottom: '3@s', ...Fonts.OpenSans_Bold, fontSize: '12@s' },
  lineSpace: { marginBottom: '10@s' },
  messageSpace: { marginBottom: '10@s', marginTop: '10@s' },
  modalAmount: { ...Fonts.OpenSans_Bold, fontSize: '11@s' },
  modalCancelBtn: { width: '45%', justifyContent: 'center', backgroundColor: 'rgba(127, 127, 127, 1)', height: '30@s', borderRadius: '4@s' },
  modalBtnText: { color: 'white', textAlign: 'center', ...Fonts.NanumGothic_Regular, fontSize: '12@s' },
  modalAcceptBtn: { width: '45%', justifyContent: 'center', backgroundColor: 'rgba(0, 112, 192, 1)', height: '30@s', borderRadius: '4@s' },
  smsContent: { width: '80%', marginTop: '10@s', marginBottom: '10@s', textAlign: 'center', fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  smsInputWrapper: {
    width: '80%', alignContent: 'center', justifyContent: 'center', flexDirection: 'row',
    marginTop: '10@s', marginBottom: '10@s'
  },
  smsInput: {flex: 2, height: '30@s', textAlign: 'center', fontSize: '12@s', ...Fonts.NanumGothic_Regular, marginRight: '10@s',
    borderWidth: '1@s', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)"
  },
  smsConfirmBtn: {
    flex: 1,
    justifyContent: 'center', backgroundColor: 'rgba(237, 125, 49, 1)', height: '30@s', borderWidth: '1@s',
    borderColor: "rgba(237, 125, 49, 1)", borderRadius: '4@s', padding: '5@s'
  },
  smsConfirmText: { color: 'white', fontSize: '12@s', textAlign: 'center', ...Fonts.NanumGothic_Regular },
  smsError: { color: 'red', marginTop: '10@s', marginBottom: '10@s', fontSize: '12@s', textAlign: 'center', ...Fonts.NanumGothic_Regular },
  executeBtn: {
    width: '80%', justifyContent: 'center', backgroundColor: 'rgba(0, 112, 192, 1)', height: '35@s',
    marginTop: '10@s', marginBottom: '20@s', borderRadius: '4@s',
  },
  executeBtnText: { color: 'white', fontSize: '12@s', textAlign: 'center', ...Fonts.NanumGothic_Regular },
  optContent: { width: '80%', marginTop: '10@s', marginBottom: '10@s', textAlign: 'center', fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  optWrapper: {
    width: '80%', alignContent: 'center', justifyContent: 'center', flexDirection: 'row',
    borderWidth: '1@s', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)",
    marginTop: '10@s', marginBottom: '10@s'
  },
  optInput: { flex: 1, height: '30@s', textAlign: 'center', fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  optError: { color: 'red', marginTop: '10@s', marginBottom: '10@s', fontSize: '12@s', textAlign: 'center', ...Fonts.NanumGothic_Regular },
  fontNotoSansBold: { ...Fonts.NotoSans_Bold, fontSize: '14@s' },
  arrowRight: {
    width: '20@s',
    height: '20@s',
  }
});