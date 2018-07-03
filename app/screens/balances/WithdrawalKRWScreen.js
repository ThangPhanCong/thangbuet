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
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import AppConfig from '../../utils/AppConfig'
import AppPreferences from '../../utils/AppPreferences'
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters'
import { withNavigationFocus } from 'react-navigation'
import HeaderBalance from './HeaderBalance'
import { Icon, CheckBox, Divider } from 'react-native-elements'

class WithdrawalKRWScreen extends BaseScreen {
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
    this.setState({ isComplete: true })
  }

  componentWillUnmount() {
    this.setState({ isComplete: false })
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
                      {formatCurrency(symbol.balance, this.currency)}
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
                  <TextInput style={{ flex: 1, height: 30, textAlign: 'right' }} />
                  <TouchableOpacity
                    style={{
                      borderLeftWidth: 1, borderColor: "rgba(0, 0, 0, 0.3)",
                      height: 30, justifyContent: 'center', padding: 5
                    }}
                    onPress={() => { }}>
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
                    value='abc'
                    style={{ flex: 1, height: 30, textAlign: 'right', opacity: 0.7 }} />
                </View>
              </View>

              <TouchableOpacity
                style={{
                  flex: 1, alignItems: 'center', height: 35, justifyContent: 'center',
                  borderLeftWidth: 1, borderRadius: 4, backgroundColor: 'blue', borderColor: 'blue',
                  marginTop: 20, marginLeft: 40, marginRight: 40,
                }}
                onPress={() => { }}>
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
                  <View style={[styles.table, { backgroundColor: '#b3e0ff', borderTopWidth: 1, }]}>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleDepost')}</Text>
                    <Text style={[styles.tbRow, styles.tbArrow, styles.tbHeader]}></Text>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleTrades')}</Text>
                    <Text style={[styles.tbRow, styles.tbArrow, styles.tbHeader]}></Text>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbtitleWithdrawal')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}> {I18n.t('withdrawal.tbTitleLimit')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleDepost')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbHeader]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleTrades')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbHeader]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbtitleWithdrawal')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}> {I18n.t('withdrawal.tbTitleLimit')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleDepost')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbHeader]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleTrades')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbHeader]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbtitleWithdrawal')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}> {I18n.t('withdrawal.tbTitleLimit')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleDepost')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbHeader]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleTrades')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbHeader]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbtitleWithdrawal')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}> {I18n.t('withdrawal.tbTitleLimit')}</Text>
                  </View>

                  <View style={styles.table}>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleDepost')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbHeader]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbTitleTrades')}</Text>
                    <Icon style={[styles.tbRow, styles.tbArrow, styles.tbHeader]} type="feather" name="arrow-right" />
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}>{I18n.t('withdrawal.tbtitleWithdrawal')}</Text>
                    <Text style={[styles.tbRow, styles.tbContent, styles.tbHeader]}> {I18n.t('withdrawal.tbTitleLimit')}</Text>
                  </View>


                </View>
              </View>
            </ScrollView>
          </View>
        }
      </SafeAreaView>
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
  tbHeader: {
    textAlign: 'center'
  },
  tbRow: {
    height: 30, lineHeight: 30,
    textAlign: "left", textAlignVertical: "center"
  },
  table: {
    flexDirection: 'row', borderBottomWidth: 1, justifyContent: 'center', alignItems: 'center'
  }
});