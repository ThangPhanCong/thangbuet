import React from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, Image, TouchableHighlight } from 'react-native'
import BaseScreen from '../BaseScreen'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { CheckBox, Divider } from 'react-native-elements'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import { formatCurrency, getCurrencyName } from '../../utils/Filters'
import Modal from "react-native-modal"
import { CommonColors, CommonSize, CommonStyles, Fonts } from '../../utils/CommonStyles'
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import Consts from "../../utils/Consts";

export default class KRWScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      checked: false,
      amount: 0,
      krwConfirm: false
    }
    this.currency = 'krw'
  }

  componentWillReceiveProps() {
    this.setState({
      checked: false,
      amount: 0,
      krwConfirm: false
    })
  }

  async _execute() {
    try {
      let currency = this.currency
      let amount = this.state.amount
      const parseAmount = parseFloat(amount);

      let depositKrw = await rf.getRequest('TransactionRequest').depositKrw({ currency, amount: parseAmount })
      if (depositKrw.success) {

        Alert.alert(
          I18n.t('deposit.info'),
          I18n.t('deposit.successMessage'),
          [{
            text: I18n.t('deposit.accept'), onPress: () => {
              this.setState({ krwConfirm: false })
              this.props.onExecute(true)
            }
          },],
          { cancelable: false }
        )
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

  async _doDeposit() {
    try {
      let securitySettings = await rf.getRequest('UserRequest').getSecuritySettings()
      if (securitySettings.data.bank_account_verified === 0) {
        Alert.alert(
          I18n.t('deposit.warning'),
          I18n.t('deposit.bankAccount'),
          [{ text: I18n.t('deposit.accept'), onPress: () => { } },],
          { cancelable: false }
        )
      } else {
        // console.log('state', this.state.krwConfirm)
        this.setState({ krwConfirm: true })
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
    const { symbol, isPending } = this.props;
    const { amount } = this.state;
    const amountValue = amount !== 0 ? formatCurrency(amount, Consts.CURRENCY_KRW, '0') : '';

    return (
      <View style={!isPending ? styles.visible : styles.unvisible}>
        {!isPending &&
          <ScrollView>
            <View style={styles.alignCenter}>
              <Text style={styles.textHeader}>{getCurrencyName(symbol.code) + " " + I18n.t('deposit.title')}</Text>
            </View>
            <View style={styles.mainContent}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[{ flex: 0.7 }, styles.textLeft]}>{I18n.t('deposit.account')}</Text>
                <View style={{ flex: 1, alignContent: 'flex-end' }}>
                  <Text style={[{ flex: 1, alignSelf: 'flex-end' }, styles.numberRight]}>
                    {formatCurrency(symbol.balance, this.currency)}
                    <Text style={styles.symbol}>{I18n.t('funds.currency')}</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.rowItem}>
                <Text style={[{ flex: 0.7 }, styles.textLeft]}>{I18n.t('deposit.amount')}</Text>
                <View style={styles.amountWrapper}>
                  <TextInput
                    style={styles.inputAmount}
                    value={amountValue}
                    onChangeText={(text) => {
                      this.setState({ amount: text })
                    }}
                    keyboardType='numeric'
                    underlineColorAndroid='rgba(0, 0, 0, 0)'
                    autoCorrect={false} />
                  <Image style={styles.iconWon} source={require('../../../assets/won/won.png')}/>
                </View>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.setState({ checked: !this.state.checked })}
              style={styles.buttonStyle}>
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
              <TouchableOpacity>
                <Text style={[styles.depositNote, styles.fontSize12]}>
                  {I18n.t('deposit.note')}
                </Text>
              </TouchableOpacity>
              <Text style={[{ ...Fonts.NanumGothic_Regular }, styles.fontSize12]}>{I18n.t('deposit.check')}</Text>
            </TouchableOpacity>
            <TouchableHighlight
              underlayColor='#BFBFBF'
              disabled={!(this.state.checked && parseFloat(amount) > 0)}
              onPress={this._doDeposit.bind(this)}
              style={[
                styles.buttonStyle,
                this.state.checked && parseFloat(amount) > 0 ?
                  { backgroundColor: 'rgba(0, 112, 191, 1)' } : { backgroundColor: 'rgba(191, 191, 191, 1)' }
              ]}>
              <Text style={[{ color: 'rgba(255, 255, 255, 1)', ...Fonts.NanumGothic_Regular }, styles.fontSize12]}>
                {I18n.t('deposit.apply')}
              </Text>
            </TouchableHighlight>

            <Divider style={styles.divider} />

            <View style={styles.noteWrapper}>
              <View style={styles.noteTitleWrapper}>
                <Text style={styles.noteTitleContent}>{I18n.t('deposit.noteTitle')}</Text>
              </View>
              {/* Note 1 */}
              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>1.&nbsp;
                  <Text style={{ color: 'red' }}>{I18n.t('deposit.note1Key')}</Text>
                  <Text>{I18n.t('deposit.note1Title')}</Text>
                </Text>
                <Text style={styles.noteTextInside}>{I18n.t('deposit.note1Content')}</Text>
              </View>
              {/* Note 2 */}
              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>2.&nbsp;
                <Text style={{ color: 'red' }}>{I18n.t('deposit.note2Key')}</Text>
                  <Text>{I18n.t('deposit.note2Title')}</Text>
                </Text>

                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.noteTextInside}>{I18n.t('deposit.note2Content')}</Text>
                  <Text style={[styles.noteTextInside, {...Fonts.NanumGothic_Bold}]}>{I18n.t('deposit.note2Content1')}</Text>
                  <Text style={styles.noteTextInside}>{I18n.t('deposit.note2Content2')}</Text>
                  <Text style={[styles.noteTextInside, {...Fonts.NanumGothic_Bold}]}>{I18n.t('deposit.note2Content3')}</Text>
                  <Text style={styles.noteTextInside}>{I18n.t('deposit.note2Content4')}</Text>
                </View>
                <Text style={styles.noteTextInside}>{I18n.t('deposit.note2Content5')}</Text>

              </View>
              {/* Note 3 */}
              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>3.&nbsp;
                <Text style={{ color: 'red' }}>{I18n.t('deposit.note3Key')}</Text>
                  <Text>{I18n.t('deposit.note3Title')}</Text>
                </Text>
                <Text style={styles.noteTextInside}>{I18n.t('deposit.note3Content')}</Text>
              </View>
              {/* Note 4 */}
              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>4.&nbsp;
                <Text style={{ color: 'red' }}>{I18n.t('deposit.note4Key')}</Text>
                  <Text>{I18n.t('deposit.note4Title')}</Text>
                </Text>
                <Text style={styles.noteTextInside}>{I18n.t('deposit.note4Content')}</Text>
              </View>
              {/* Note 5 */}
              <View style={styles.noteContainer}>
                <Text style={styles.noteTitle}>5.&nbsp;
                <Text style={{ color: 'red' }}>{I18n.t('deposit.note5Key')}</Text>
                  <Text>{I18n.t('deposit.note5Title')}</Text>
                </Text>
                <Text style={styles.noteTextInside}>
                  {I18n.t('deposit.note5Content')}
                  <Text style={styles.note5Phone}>{I18n.t('deposit.note5Contenta')}</Text>
                  <Text style={styles.noteTextInside}>{I18n.t('deposit.note5Contentb')}</Text>
                  &nbsp;&nbsp;&nbsp;
                  <Text style={styles.linkText}>{I18n.t('deposit.note5Link')}</Text>
                </Text>

              </View>
              {/* More */}
              <View style={styles.noteContainer}>
                <Text style={[styles.noteTextInside, styles.noteMoreTitle]}>*&nbsp;{I18n.t('deposit.noteMore')}</Text>
                <Text style={[styles.noteTitle, styles.noteMoreContent]}>{I18n.t('deposit.noteTimeMore')}</Text>
              </View>
            </View>
          </ScrollView>
        }
        {/* Confirm deposit */}
        <Modal
          isVisible={this.state.krwConfirm}
          onBackdropPress={() => this.setState({ krwConfirm: false })}>
          <View style={styles.modalStyle}>
            <View style={styles.headerModalStyle}>
              <Text style={[styles.fontSize12, styles.modalText]}>{I18n.t('deposit.confirmTitle')}</Text>
            </View>

            <View style={styles.rowWrapper}>
              <Text style={[styles.fontSize12, styles.modalText, styles.marginRight10]}>{I18n.t('deposit.amountToDeposit')}</Text>
              <Text style={[styles.modalText, {fontSize: scale(14), paddingBottom: scale(2), ...Fonts.NanumGothic_Bold }]}>
                {formatCurrency(this.state.amount, this.currency) + " "}
              </Text>
              <Text style={[styles.fontSize12, styles.modalText, { ...Fonts.NanumGothic_Regular }]}>{I18n.t('funds.currency')}</Text>
            </View>
            <Text style={[styles.fontSize12, styles.modalText, styles.marginBoth10]}>
              {I18n.t('deposit.confirmContent')}
            </Text>
            <View style={styles.questionWapper}>
              <TouchableOpacity
                onPress={() => this.setState({ krwConfirm: false })}
                style={[styles.modalConfirmBtn, styles.btnCancel]}>
                <Text style={styles.modalConfirmText}>{I18n.t('deposit.actionCancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this._execute.bind(this)}
                style={[styles.modalConfirmBtn, styles.btnAccept]}>
                <Text style={styles.modalConfirmText}>{I18n.t('deposit.actionConfirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    )
  }
}

const styles = ScaledSheet.create({
  fullScreen: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, flexDirection: "column" },
  header: { height: '40@s', flexDirection: "row" },
  logo: { flex: 1, flexDirection: "row", alignItems: 'center', justifyContent: 'center' },
  info: { flex: 2, flexDirection: "column", alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: "row", alignItems: 'center', justifyContent: 'center' },
  infoRowLeft: { flex: 1 },
  infoRowRight: { flex: 1.5 },
  tableHeader: {
    flexDirection: "row", height: '30@s', backgroundColor: '#c7d2e2',
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: '1@s'
  },
  tableRow: {
    flexDirection: "row", height: '40@s',
    alignItems: 'center', justifyContent: 'center', borderBottomWidth: '1@s'
  },
  tableRowDetail: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  noteContainer: { marginTop: '10@s', flexDirection: 'column', width: '100%' },
  visible: { flex: 1 },
  unvisible: { flex: 0 },
  alignCenter: { alignItems: 'center', justifyContent: 'center' },
  mainContent: {
    flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center',
    marginTop: '10@s', marginLeft: '30@s', marginRight: '30@s'
  },
  noteTitle: { flexWrap: 'wrap', fontSize: '11@s', ...Fonts.NanumGothic_Bold },
  noteTextInside: {
    flexWrap: 'wrap', fontSize: '10@s', ...Fonts.NanumGothic_Regular,
    marginTop: '5@s', lineHeight: '13@s'
  },
  noteMoreTitle: { fontSize: '10.5@s' },
  noteMoreContent: { marginTop: '5@s', fontSize: '9@s', ...Fonts.NanumGothic_Bold, paddingBottom: '10@s' },
  modalStyle: {
    backgroundColor: "white", justifyContent: "center", alignItems: "center",
    alignContent: 'center', borderRadius: '4@s', borderColor: "rgba(0, 0, 0, 0.1)"
  },
  headerModalStyle: {
    borderBottomWidth: '1@s', borderColor: 'rgba(235, 235, 235, 1)', height: '50@s', width: '100%',
    justifyContent: 'center', alignItems: 'center'
  },
  textHeader: {
    ...Fonts.NotoSans_Bold, fontSize: '14@s'
  },
  textLeft: {
    ...Fonts.NanumGothic_Regular, fontSize: '12@s'
  },
  numberRight: {
    ...Fonts.OpenSans_Bold, fontSize: '16@s'
  },
  symbol: { fontSize: '10@s', fontWeight: 'bold', ...Fonts.OpenSans },
  rowItem: {
    flexDirection: 'row', flex: 1, justifyContent: 'center',
    alignItems: 'center', marginTop: '10@s'
  },
  inputAmount: {
    flex: 1, textAlign: 'right', height: '30@s',
    paddingTop: '5@s', fontSize: '13@s', ...Fonts.NanumGothic_Regular
  },
  inlineSymbol: {
    fontSize: '10@s', ...Fonts.NanumGothic_Regular, textAlignVertical: 'center',
    justifyContent: 'center', alignContent: 'center', padding: '5@s'
  },
  amountWrapper: {
    flexDirection: 'row', borderWidth: '1@s', flex: 1, borderColor: 'rgba(222, 227, 235, 1)',
    alignContent: 'center', justifyContent: 'center', borderRadius: '4@s'
  },
  buttonStyle: {
    marginTop: '20@s', backgroundColor: 'rgba(242, 242, 242, 1)', height: '35@s', flexDirection: 'row', borderRadius: '4@s',
    flex: 1, marginLeft: '30@s', marginRight: '30@s', justifyContent: 'center', alignItems: 'center'
  },
  iconLogo: { height: '15@s', width: '15@s', margin: '2@s', marginRight: '5@s' },
  divider: { backgroundColor: 'rgba(222, 227, 235, 1)', flex: 1, marginTop: '30@s', marginBottom: '20@s' },
  noteWrapper: { marginLeft: '30@s', marginRight: '30@s', justifyContent: 'center', alignItems: 'center' },
  noteTitleWrapper: {
    borderBottomWidth: '1@s', borderBottomColor: 'rgba(222, 227, 235, 1)',
    width: '100%', justifyContent: 'center', alignItems: 'center'
  },
  noteTitleContent: { paddingBottom: '5@s', ...Fonts.NanumGothic_Bold, fontSize: '12@s' },
  linkText: {
    flexWrap: 'wrap',
    fontSize: '10@s',
    ...Fonts.NanumGothic_Bold,
    lineHeight: '13@s',
    color: 'rgba(0, 112, 192, 1)',
  },
  fontSize12: { fontSize: '12@s' },
  modalText: { ...Fonts.NanumGothic_Regular, alignContent: 'flex-end' },
  rowWrapper: {
    width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
    marginBottom: '10@s', marginTop: '20@s'
  },
  marginRight10: { marginRight: '10@s' },
  marginBoth10: { marginTop: '10@s', marginBottom: '10@s' },
  questionWapper: {
    width: '70%', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row',
    marginBottom: '20@s', marginTop: '10@s'
  },
  modalConfirmBtn: {
    width: '45%', justifyContent: 'center', height: '35@s',
    borderColor: 'rgba(222, 227, 235, 1)', borderRadius: '4@s', borderWidth: '1@s'
  },
  modalConfirmText: { color: 'white', textAlign: 'center', ...Fonts.NanumGothic_Regular, fontSize: '12@s' },
  btnCancel: { backgroundColor: 'rgba(127, 127, 127, 1)' },
  btnAccept: { backgroundColor: 'rgba(0, 112, 192, 1)' },
  depositNote: {
    color: 'rgba(0, 112, 192, 1)',
    ...Fonts.NanumGothic_Bold,
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(0, 112, 192, 1)'
  },
  iconWon: {
    width: '23@s',
    height: '23@s',
    marginTop: '5@s',
    marginRight: '7@s',
  },
  note5Phone: {
    ...Fonts.NanumGothic_Bold
  }
});