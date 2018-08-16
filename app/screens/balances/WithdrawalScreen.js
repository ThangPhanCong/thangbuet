import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, ScrollView, TextInput, Alert, Image } from 'react-native';
import BaseScreen from '../BaseScreen'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import I18n from '../../i18n/i18n'
import { withNavigationFocus } from 'react-navigation'
import { Divider, Icon } from 'react-native-elements'
import { formatCurrency, getCurrencyName } from '../../utils/Filters'
import rf from '../../libs/RequestFactory'
import Modal from "react-native-modal"
import Utils from '../../utils/Utils'
import { Fonts } from '../../utils/CommonStyles';
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import OrderUtils from '../../utils/OrderUtils';
import CurrencyInput from '../common/CurrencyInput';
import Events from '../../utils/Events';

class WithdrawalScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      isComplete: false,
      amount: 0,
      blockchainAddress: '',
      blockchainTag: null,
      daily: {},
      modalConfirm: false,
      amountConfirm: false,
      smsConfirm: false,
      otpConfirm: false,
      agree: false,
      optErr: false,
      quantityPrecision: 10,
    }
    this.currency = ''
  }

  componentDidMount() {
    super.componentDidMount()
    this._loadData()
  }

  async _loadData() {
    await this._getBalaceDetail()
    await this._getDailyLimit()
    await this._getWithdrawal()
    await this._getAuth()
    this.setState({ isComplete: true, modalConfirm: false, amount: 0 })
  }

  async _getBalaceDetail() {
    const { navigation } = this.props;
    let symbol = navigation.getParam('symbol', {});

    const res = await rf.getRequest('UserRequest').getDetailsBalance(symbol.code);
    symbol = Object.assign({}, symbol, res.data);

    this.currency = symbol.code;
    this.setState({
      symbol,
      blockchainAddress: symbol.wallet_address ? symbol.wallet_address : "",
      blockchainTag: symbol.tag ? symbol.tag : ""
    })
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.setState({ isComplete: false, modalConfirm: false, amount: 0 })
  }

  getSocketEventHandlers() {
    return {
      BalanceUpdated: this._onBalanceUpdated.bind(this),
    };
  }

  getDataEventHandlers() {
    return {
      [Events.SECURITY_SETTINGS_UPDATED]: this._loadData.bind(this)
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
      let { daily } = this.state
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
      const rpSymbol = await rf.getRequest('MasterdataRequest').getAll()
      const currency = this.currency
      const rpDaily = rpSymbol.withdrawal_limits.find(item => item.security_level === securityLevel && item.currency === currency)

      return rpDaily

    } catch (err) {
      console.log('Some errors has occurred in  GetItemDaily:', err)
    }
  }

  async _getSecurityLevel() {
    try {
      const rpUser = await rf.getRequest('UserRequest').getCurrentUser()

      return rpUser.data.security_level
    } catch (err) {
      console.log('GetSecurityLevel:', err)
    }
  }

  async _getWithdrawal() {
    try {
      let { daily } = this.state;
      const rpDaily = await rf.getRequest('TransactionRequest').getWithdrawalDaily({ 'currency': this.currency })

      daily.withdrawal = rpDaily.data;
      this.setState({ daily })
    } catch (err) {
      console.log("_getWithdrawal:", err)
    }
  }

  _validateAmount() {
    const { amount, daily, blockchainAddress, blockchainTag } = this.state
    let errMsg = ''

    if (daily.minium > amount) {
      errMsg = I18n.t('withdrawal.errMinium')
    } else if (amount > (daily.withdrawalLimit - daily.withdrawal)) {
      errMsg = I18n.t('withdrawal.errMaximum')
    } else if (amount <= 0) {
      errMsg = I18n.t('withdrawal.errMaximum')
    }

    //validate blockchain address
    if (!Utils.isWalletAddress(this.currency, blockchainAddress, blockchainTag)) {
      errMsg = I18n.t('withdrawal.errBlockchainAddress')
    }

    if (errMsg === '') {
      this.setState({ amountConfirm: true })
    } else {
      Alert.alert(
        I18n.t('deposit.error'),
        errMsg,
        [{
          text: I18n.t('deposit.accept'), onPress: () => {
          }
        },],
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
        foreign_blockchain_address: this.state.blockchainAddress,
        otp: this.state.otpConfirm ? this.state.otp + '|' : '|' + this.state.otp
      }
      if (this.state.blockchainTag) {
        params.destination_tag = this.state.blockchainTag
      }
      const withdrawalRes = await rf.getRequest('TransactionRequest').withdraw(params)
      this.setState({ optErr: false })
      this._loadData()
    } catch (err) {
      console.log("_getWithdrawal:", err)
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

  _onQuantityChanged(formatted, extracted) {
    let amount = OrderUtils.getMaskInputValue(formatted, extracted);
    this.setState({ amount });
  }

  render() {
    const { symbol } = this.state
    return (
      <SafeAreaView style={styles.fullScreen}>
        {this.state.isComplete &&
          <ScrollView style={styles.content}>
            <View style={styles.logo}>
              <Image
                resizeMode="contain"
                style={styles.iconLogo}
                source={require('../../../assets/balance/logo_tab3.png')} />
              <Text style={[styles.fontNotoSansBold]}>
                {I18n.t('balances.depositAndWithdrawal')}
              </Text>
            </View>

            <View style={[styles.alignCenter, styles.marginTop20]}>
              <View style={styles.alignCenter}>
                <Text style={styles.title}>{getCurrencyName(symbol.code) + " " + I18n.t('withdrawal.title')}</Text>
              </View>

              <View style={[styles.header, styles.line]}>
                <View style={styles.row}>
                  <Text style={styles.leftView}>{I18n.t('withdrawal.balance')}</Text>
                  <View style={[styles.rightView, { flexDirection: 'row' }]}>
                    <Text style={[styles.rightContent]}>
                      {formatCurrency(symbol.balance, this.currency)}
                    </Text>
                    <Text style={[styles.symbol]}>{getCurrencyName(this.currency)}</Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <Text style={styles.leftView}>{I18n.t('withdrawal.available')}</Text>
                  <View style={[styles.rightView, { flexDirection: 'row' }]}>
                    <Text style={[styles.rightContent, { marginLeft: scale(30) }]}>
                      {this.state.daily.withdrawalLimit - this.state.daily.withdrawal > 0 ?
                        formatCurrency(this.state.daily.withdrawalLimit - this.state.daily.withdrawal, this.currency) : 0}
                    </Text>
                    <Text style={[styles.symbol]}>{getCurrencyName(this.currency)}</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.line, styles.amount]}>
                <Text style={[styles.amountText, styles.textInline, { marginLeft: scale(10) }]}>
                  {I18n.t('withdrawal.amountRequest', { "coinName": getCurrencyName(symbol.code) })}
                </Text>
                <View style={styles.amountWrapper}>
                  {/* <TextInput
                    keyboardType='numeric'
                    autoCorrect={false}
                    underlineColorAndroid='transparent'
                    value={formatCurrency(this.state.amount, this.currency)}
                    onChangeText={(text) => {
                      this.setState({ amount: parseFloat(text.split(',').join('')) })
                    }}
                    style={styles.amountInput} /> */}
                  <CurrencyInput
                    value={this.state.amount}
                    precision={this.state.quantityPrecision}
                    onChangeText={this._onQuantityChanged.bind(this)}
                    keyboardType='numeric'
                    style={styles.inputText}
                    underlineColorAndroid='transparent' />
                  <Text style={styles.amountSymbol}>{getCurrencyName(this.currency)}</Text>
                  <TouchableOpacity
                    style={styles.amountMax}
                    onPress={() => this.setState({
                      amount: this.state.daily.withdrawalLimit - this.state.daily.withdrawal > 0 ? this.state.daily.withdrawalLimit - this.state.daily.withdrawal : 0
                    })}>
                    <Text style={styles.amountText}>{I18n.t('withdrawal.maximum')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.line, styles.amount]}>
                <Text style={[styles.amountText, styles.textInline, { marginLeft: scale(10) }]}>
                  {I18n.t('withdrawal.addressRequest', { "coinName": getCurrencyName(symbol.code) })}
                </Text>
                <View style={styles.addressWrapper}>
                  <TextInput
                    value={this.state.blockchainAddress}
                    onChangeText={(text) => {
                      this.setState({ blockchainAddress: text })
                    }}
                    autoCorrect={false}
                    underlineColorAndroid='transparent'
                    style={[styles.inputText, styles.addressInput]} />
                </View>
              </View>

              {symbol.code === 'xrp' &&
                <View style={styles.xrpGroup}>
                  <View style={{ flex: 1, marginRight: scale(15) }}>
                    <Text style={[styles.amountText, styles.textInline, { textAlign: 'right' }]}>{I18n.t('withdrawal.tagAddress')}</Text>
                  </View>
                  <View style={styles.tagWrapper}>
                    <TextInput
                      keyboardType='numeric'
                      value={this.state.blockchainTag}
                      onChangeText={(text) => {
                        this.setState({ blockchainTag: text })
                      }}
                      autoCorrect={false}
                      underlineColorAndroid='transparent'
                      style={styles.tagInput} />
                  </View>
                </View>
              }

              <TouchableOpacity
                style={[styles.alignCenter, styles.confirmBtn]}
                onPress={this._validateAmount.bind(this)}
              >
                <View>
                  <Text style={styles.confirmText}>{I18n.t('withdrawal.coinBtn')}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.noteWrapper}>
              <View style={styles.titleWrapper}>
                <Text style={styles.headerNote}>{I18n.t('withdrawal.noteTitle')}</Text>
              </View>

              <View style={{ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <Text style={[styles.paragraph, styles.marginTop20]}>{'\u2022' + I18n.t('withdrawal.coinNote1')}</Text>
                <Text style={styles.paragraph}>{'\u2022' + I18n.t('withdrawal.coinNote2')}</Text>
                <Text style={styles.paragraph}>{'\u2022' + I18n.t('withdrawal.coinNote3')}</Text>
                <Text style={styles.paragraph}>{'\u2022' + I18n.t('withdrawal.coinNote4')}</Text>
                <Text style={styles.paragraph}>{'\u2022' + I18n.t('withdrawal.coinNote5')}
                  <Text style={styles.paragraphRed}>{I18n.t('withdrawal.coinNote5a')}</Text>
                  <Text style={styles.paragraph}>{I18n.t('withdrawal.coinNote5b')}</Text>
                </Text>
                <Text style={styles.paragraph}>{'\u2022' + I18n.t('withdrawal.coinNote6')}</Text>
                <Text style={styles.paragraph}>{'\u2022' + I18n.t('withdrawal.coinNote7')}</Text>
                <Text style={styles.paragraph}>{'\u2022' + I18n.t('withdrawal.coinNote8')}</Text>
                <Text style={[styles.paragraph, styles.marginBottom20]}>{'\u2022' + I18n.t('withdrawal.coinNote9')}</Text>
              </View>

              <View style={styles.paragrahWapper}>
                <Text style={styles.headerNote}>{I18n.t('withdrawal.coinNote12')}</Text>
              </View>
              <Text style={[styles.paragraph, styles.marginTop20]}>{I18n.t('withdrawal.coinNote10')}</Text>
              <Text style={[styles.paragraph, styles.marginBottom20]}>{I18n.t('withdrawal.coinNote11')}</Text>

              <View style={[styles.noteContainer, styles.tableSpace]}>
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
                  <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')} />
                  <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row1Col2')}</Text>
                  <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')} />
                  <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row1Col3')}</Text>
                  <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.row1Col4')}</Text>
                </View>

                <View style={styles.table}>
                  <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row2Col1')}</Text>
                  <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')} />
                  <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row2Col2')}</Text>
                  <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')} />
                  <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row2Col3')}</Text>
                  <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.row2Col4')}</Text>
                </View>

                <View style={styles.table}>
                  <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row3Col1')}</Text>
                  <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')} />
                  <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row3Col2')}</Text>
                  <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')} />
                  <Text style={[styles.tbRow, styles.tbContent]}>{I18n.t('withdrawal.row3Col3')}</Text>
                  <Text style={[styles.tbRow, styles.tbContent]}> {I18n.t('withdrawal.row3Col4')}</Text>
                </View>

                <View style={styles.table}>
                  <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}>{I18n.t('withdrawal.row4Col1')}</Text>
                  <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')} />
                  <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}>{I18n.t('withdrawal.row4Col2')}</Text>
                  <Image style={styles.arrowRight} source={require('../../../assets/arrowRight/arrowRight.png')} />
                  <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}>{I18n.t('withdrawal.row4Col3')}</Text>
                  <Text style={[styles.tbRow, styles.tbContent, styles.tbColor]}> {I18n.t('withdrawal.row4Col4')}</Text>
                </View>

              </View>
            </View>

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

          </ScrollView>
        }
      </SafeAreaView>
    )
  }

  _renderAmountContent() {
    const { symbol } = this.state
    return (
      <View style={styles.modalStyle}>
        <View style={styles.headerModalStyle}>
          <Text style={styles.headerModalTitle}>{I18n.t('withdrawal.amountConfirmTitle')}</Text>
        </View>

        <View style={styles.titleAmountGroup}>
          <Text style={[styles.amoutTitleModal]}>
            {formatCurrency(this.state.amount, this.currency)}
          </Text>
          <Text style={styles.modalLineSymbol}>{getCurrencyName(this.currency)}</Text>
        </View>

        <Text style={styles.addressText}>
          {symbol.blockchain_address}
        </Text>

        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.messageSpace}>{I18n.t('withdrawal.amountMessage')}</Text>
          <Text style={styles.messageSpace1}>{I18n.t('withdrawal.amountMessage1')}</Text>
        </View>

        <View style={styles.modalActionStyle}>
          <TouchableOpacity
            onPress={() => this.setState({ amountConfirm: false, agree: false })}
            style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>{I18n.t('withdrawal.amountCancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._doConfirm.bind(this)}
            style={styles.acceptBtn}>
            <Text style={styles.acceptBtnText}>{I18n.t('withdrawal.amountAccept')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  _renderSmsContent() {
    return (
      <View style={[styles.modalStyle, { alignContent: 'center', justifyContent: 'center', }]}>
        <View style={styles.headerModalStyle}>
          <Text style={styles.headerModalTitleSms}>{I18n.t('withdrawal.smsConfirmTitle')}</Text>
          <Text style={styles.headerModalTitleSms1}>{I18n.t('withdrawal.smsConfirmTitle1')}</Text>
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
      </View>
    )
  }

  _renderOtpContent() {
    return (
      <View style={[styles.modalStyle, { alignContent: 'center', justifyContent: 'center', }]}>
        <View style={styles.headerModalStyle}>
          <Text style={styles.otpConfirmTitle}>{I18n.t('withdrawal.optConfirmTitle')}</Text>
          <Text style={styles.headerModalTitle}>{I18n.t('withdrawal.optConfirmTitle1')}</Text>
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
      </View>
    )
  }
}

export default withNavigationFocus(WithdrawalScreen)
const margin = scale(23);
const inputHeight = scale(30);
const styles = ScaledSheet.create({
  fullScreen: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, flexDirection: "column" },
  alignCenter: { alignItems: 'center', justifyContent: 'center' },
  noteContainer: { marginTop: '10@s', flexDirection: 'column', width: '100%' },
  noteTitle: { flexWrap: 'wrap', fontSize: 13, fontWeight: 'normal' },
  paragraph: {
    flexWrap: 'wrap',
    fontSize: '11@s',
    marginTop: '5@s',
    marginBottom: '5@s', ...Fonts.NanumGothic_Regular,
    lineHeight: '17@s'
  },
  paragraphRed: {
    flexWrap: 'wrap',
    fontSize: '11@s',
    marginTop: '5@s',
    color: 'red',
    marginBottom: '5@s', ...Fonts.NanumGothic_Regular,
    lineHeight: '17@s'
  },
  tbContent: { flex: 1, ...Fonts.NanumGothic_Regular, fontSize: '11@s' },
  tbArrow: { flex: 0.5, },
  tbColor: { color: 'red' },
  tbRow: { height: '30@s', lineHeight: '30@s', textAlign: "center", textAlignVertical: "center", },
  table: {
    flexDirection: 'row', borderBottomWidth: '1@s', borderColor: 'rgba(217, 217, 217, 1)',
    justifyContent: 'center', alignItems: 'center'
  },
  header: { flexDirection: 'column', flex: 1 },
  line: {
    justifyContent: 'center', alignItems: 'center', marginTop: '15@s', marginLeft: '40@s', marginRight: '40@s'
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: '5@s' },
  leftView: { flex: 0.9, fontSize: '12@s', ...Fonts.NanumGothic_Regular, paddingBottom: '3@s' },
  rightView: { flex: 3, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' },
  rightContent: { flex: 1, textAlign: 'right', fontSize: '18@s', ...Fonts.OpenSans_Bold, marginRight: '10@s' },
  symbol: { fontSize: '9@s', ...Fonts.OpenSans_Bold },
  amount: {
    flexDirection: 'column', flex: 1, alignItems: 'flex-start', justifyContent: 'center'
  },
  modalStyle: {
    backgroundColor: "white", justifyContent: "center", alignItems: "center",
    alignContent: 'center', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)"
  },
  headerModalStyle: {
    borderBottomWidth: '1@s', borderColor: "rgba(0, 0, 0, 0.1)", height: '50@s', width: '100%',
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row'
  },
  modalActionStyle: {
    width: '70%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row',
    marginBottom: '20@s', marginTop: '10@s'
  },
  logo: {
    height: '50@s', flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start',
    borderBottomWidth: '1@s', borderColor: 'rgba(222, 227, 235, 1)'
  },
  iconLogo: { height: '20@s', width: '20@s', margin: '2@s', marginLeft: '15@s', },
  marginTop20: { marginTop: '20@s' },
  title: { ...Fonts.NotoSans_Bold, fontSize: '14@s' },
  amountText: { ...Fonts.NanumGothic_Regular, fontSize: '12@s' },
  textInline: { marginBottom: '5@s' },
  amountWrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: '1@s', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.3)"
  },
  amountInput: {
    flex: 1,
    height: '30@s',
    textAlign: 'right',
    paddingRight: '5@s',
    fontSize: '12@s',
    ...Fonts.NanumGothic_Regular
  },
  amountSymbol: { ...Fonts.NanumGothic_Regular, fontSize: '12@s', marginRight: '10@s' },
  amountMax: {
    borderLeftWidth: '1@s', borderColor: "rgba(0, 0, 0, 0.3)", height: '30@s', justifyContent: 'center', padding: '5@s',
    backgroundColor: '#fafafa'
  },
  addressWrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: '1@s', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.3)"
  },
  addressInput: {
    flex: 1,
    height: '30@s',
    textAlign: 'right',
    paddingRight: '16@s',
    paddingLeft: '16@s',
    fontSize: '12@s',
    ...Fonts.NanumGothic_Regular
  },
  tagWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: '1@s',
    borderRadius: '4@s',
    borderColor: "rgba(0, 0, 0, 0.3)"
  },
  tagInput: {
    flex: 1,
    alignItems: 'center',
    height: '30@s',
    textAlign: 'right',
    paddingRight: '16@s',
    paddingLeft: '16@s',
    fontSize: '12@s',
    ...Fonts.NanumGothic_Regular
  },
  confirmBtn: {
    marginTop: '20@s',
    width: '78%',
    height: '35@s',
    backgroundColor: 'rgba(0, 112, 192, 1)',
    borderRadius: '4@s',
    borderColor: 'rgba(0, 0, 0, 0.1)'
  },
  confirmText: { ...Fonts.NanumGothic_Regular, fontSize: '12@s', color: 'white' },
  divider: { backgroundColor: 'rgba(222, 227, 235, 1)', flex: 1, marginTop: '20@s', marginBottom: '20@s' },
  noteWrapper: { marginLeft: '20@s', marginRight: '20@s', justifyContent: 'center', alignItems: 'center' },
  titleWrapper: {
    borderBottomWidth: '1@s',
    borderBottomColor: 'rgba(228, 238, 248, 1)',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerNote: { ...Fonts.NanumGothic_Bold, fontSize: '11@s', paddingBottom: '10@s' },
  marginBottom20: { marginBottom: '20@s' },
  paragrahWapper: {
    borderBottomWidth: '1@s',
    borderBottomColor: 'rgba(228, 238, 248, 1)',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tableSpace: { marginTop: '10@s', paddingBottom: '50@s' },
  tbHeader: { backgroundColor: 'rgba(228, 238, 248, 1)', borderTopWidth: '1@s', },
  headerModalTitle: { fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  headerModalTitleSms: { fontSize: '12@s', ...Fonts.NanumGothic_Bold },
  headerModalTitleSms1: { fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  modalLine: { marginTop: '10@s', marginBottom: '3@s', ...Fonts.OpenSans_Bold, fontSize: '12@s' },
  modalLineSymbol: { ...Fonts.OpenSans, fontSize: '12@s' },
  amoutTitleModal: { ...Fonts.OpenSans_Bold, fontSize: '12@s', marginRight: '3@s' },
  addressText: { fontSize: '11@s', marginTop: '10@s', marginBottom: '3@s', ...Fonts.OpenSans },
  tagText: { ...Fonts.NanumGothic_Regular, fontSize: '12@s' },
  messageSpace: { marginBottom: '10@s', marginTop: '10@s', fontSize: '12@s', ...Fonts.NanumGothic_Bold },
  messageSpace1: { marginBottom: '12@s', marginTop: '12@s', fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  cancelBtn: {
    width: '45%',
    justifyContent: 'center',
    backgroundColor: 'rgba(127, 127, 127, 1)',
    height: '30@s',
    borderRadius: '4@s'
  },
  cancelBtnText: { color: 'white', textAlign: 'center', ...Fonts.NanumGothic_Regular, fontSize: '12@s' },
  acceptBtn: {
    width: '45%',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 112, 192, 1)',
    height: '30@s',
    borderRadius: '4@s'
  },
  acceptBtnText: { color: 'white', textAlign: 'center', ...Fonts.NanumGothic_Regular, fontSize: '12@s' },
  smsContent: {
    width: '80%',
    marginTop: '10@s',
    marginBottom: '10@s',
    textAlign: 'center',
    fontSize: '12@s', ...Fonts.NanumGothic_Regular
  },
  smsInputWrapper: {
    width: '80%', alignContent: 'center', justifyContent: 'center', flexDirection: 'row',
    marginTop: '10@s', marginBottom: '10@s'
  },
  smsInput: {
    flex: 2, height: '30@s', textAlign: 'center', fontSize: '12@s', ...Fonts.NanumGothic_Regular, marginRight: '10@s',
    borderWidth: '1@s', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)"
  },
  smsConfirmBtn: {
    flex: 1,
    justifyContent: 'center', backgroundColor: 'rgba(237, 125, 49, 1)', height: '30@s', borderWidth: '1@s',
    borderColor: "rgba(237, 125, 49, 1)", borderRadius: '4@s', padding: '5@s'
  },
  smsConfirmText: { color: 'white', fontSize: '12@s', textAlign: 'center', ...Fonts.NanumGothic_Regular },
  smsError: {
    color: 'red',
    marginTop: '10@s',
    marginBottom: '10@s',
    fontSize: '12@s',
    textAlign: 'center', ...Fonts.NanumGothic_Regular
  },
  executeBtn: {
    width: '80%', justifyContent: 'center', backgroundColor: 'rgba(0, 112, 192, 1)', height: '35@s',
    marginTop: '10@s', marginBottom: '20@s', borderRadius: '4@s',
  },
  executeBtnText: { color: 'white', fontSize: '12@s', textAlign: 'center', ...Fonts.NanumGothic_Regular },
  optContent: {
    width: '80%',
    marginTop: '10@s',
    marginBottom: '10@s',
    textAlign: 'center',
    fontSize: '12@s', ...Fonts.NanumGothic_Regular
  },
  optWrapper: {
    width: '80%', alignContent: 'center', justifyContent: 'center', flexDirection: 'row',
    borderWidth: '1@s', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)",
    marginTop: '10@s', marginBottom: '10@s'
  },
  optInput: { flex: 1, height: '35@s', textAlign: 'center', fontSize: '12@s', ...Fonts.NanumGothic_Regular },
  optError: {
    color: 'red',
    marginTop: '10@s',
    marginBottom: '10@s',
    fontSize: '12@s',
    textAlign: 'center', ...Fonts.NanumGothic_Regular
  },
  fontNotoSansBold: { ...Fonts.NotoSans_Bold, fontSize: '14@s' },
  titleAmountGroup: { flexDirection: 'row', marginTop: '20@s' },
  xrpGroup: { flexDirection: 'row', alignItems: 'center', marginTop: '10@s', marginRight: '40@s' },
  arrowRight: {
    width: '20@s',
    height: '20@s',
  },
  otpConfirmTitle: {
    ...Fonts.OpenSans_Bold,
    fontSize: '11@s'
  },
  inputText: {
    flex: 1,
    height: inputHeight,
    paddingLeft: '5@s',
    paddingRight: '5@s',
    paddingTop: 0,
    paddingBottom: 0,
    textAlign: 'right',
    fontSize: '12@s',
    ...Fonts.OpenSans
  },
});