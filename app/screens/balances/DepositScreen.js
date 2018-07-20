import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Clipboard, ToastAndroid, Image } from 'react-native';
import BaseScreen from '../BaseScreen'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import I18n from '../../i18n/i18n'
import { withNavigationFocus } from 'react-navigation'
import rf from '../../libs/RequestFactory'
import QRCode from 'react-native-qrcode-svg'
import { scale } from "../../libs/reactSizeMatter/scalingUtils"
import { getCurrencyName } from '../../utils/Filters'
import { Fonts } from '../../utils/CommonStyles';

class DepositScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      isComplete: false,
      symbol: {}
    }
  }

  async componentDidMount() {
    await this._loadData()
    this.setState({ isComplete: true })
  }

  componentWillUnmount() {
    this.setState({ isComplete: false })
  }

  async _loadData() {
    try {
      const { navigation } = this.props;
      let symbol = navigation.getParam('symbol', {})
      const res = await rf.getRequest('UserRequest').getDetailsBalance(symbol.code)

      symbol = Object.assign({}, symbol, res.data)
      this.setState({ symbol })

      return
    } catch (err) {
      console.log('Error in _loadData', err)
    }
  }

  async _doGetBlockchainAddress() {
    try {
      const res = await rf.getRequest('UserRequest').generateDepositAddress({ 'currency': this.state.symbol.code })
      await this._loadData()

      return
    } catch (err) {
      console.log('Error in _doGetBlockchainAddress', err)
    }
  }

  _doCopy(hasTag) {
    if (hasTag) {
      Clipboard.setString(this.state.symbol.blockchain_tag)
    } else {
      Clipboard.setString(this.state.symbol.blockchain_address)
    }

    ToastAndroid.showWithGravity(
      I18n.t('deposit.copyInfo'),
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    )
  }

  render() {

    return (
      <SafeAreaView style={styles.fullScreen}>
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

          {this.state.isComplete &&
            <View style={[styles.alignCenter, styles.marginTop20]}>
              <View style={styles.alignCenter}>
                <Text style={styles.title}>{getCurrencyName(this.state.symbol.code) + " " + I18n.t('deposit.title')}</Text>
              </View>

              {this.state.isComplete && (!this.state.symbol.blockchain_address || this.state.symbol.blockchain_address == null) &&
                <View style={[styles.alignCenter, { width: '80%' }]}>
                  <View style={[styles.alignCenter, { width: '100%' }]}>
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteTitle}>
                        {'\u2022' + I18n.t('deposit.' + this.state.symbol.code + '.coinNote1')}
                      </Text>
                    </View>
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteTitle}>
                        {'\u2022' + I18n.t('deposit.' + this.state.symbol.code + '.coinNote2')}
                      </Text>
                    </View>
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteTitle}>
                        {'\u2022' + I18n.t('deposit.' + this.state.symbol.code + '.coinNote3')}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={this._doGetBlockchainAddress.bind(this)}
                    style={[styles.alignCenter, styles.actionGetAddress]}>
                    <Text style={styles.actionGetAddressText}>{I18n.t('deposit.coinBtn')}</Text>
                  </TouchableOpacity>
                </View>
              }
              {this.state.isComplete && this.state.symbol.blockchain_address && this.state.symbol.blockchain_address != null &&
                <View style={[styles.alignCenter, styles.QRcodeWrapper]}>
                  <QRCode
                    size={scale(200)}
                    value={this.state.symbol.blockchain_address ? this.state.symbol.blockchain_address : 'No address'} />

                  <Text style={styles.addressSpace}>
                    {this.state.symbol.blockchain_address}
                  </Text>
                  {this.state.symbol.blockchain_tag && this.state.symbol.blockchain_tag != null &&
                    <Text style={styles.tagSpace}>
                      {I18n.t('deposit.tagAddress') + " " + this.state.symbol.blockchain_tag}
                    </Text>
                  }
                  <View style={styles.actionWapper}>
                    <TouchableOpacity
                      onPress={() => this._doCopy(false)}
                      style={[styles.alignCenter, styles.actionCopy]}>
                      <Text style={styles.actionText}>{I18n.t('deposit.copyAddress')}</Text>
                    </TouchableOpacity>
                    {this.state.symbol.blockchain_tag && this.state.symbol.blockchain_tag != null &&
                      <TouchableOpacity
                        onPress={() => this._doCopy(true)}
                        style={[styles.alignCenter, styles.actionCopy, styles.secondBtn]}>
                        <Text style={styles.actionText}>{I18n.t('deposit.copyTag')}</Text>
                      </TouchableOpacity>
                    }
                  </View>
                </View>
              }

            </View>
          }
        </View>
      </SafeAreaView>
    )
  }
}

export default withNavigationFocus(DepositScreen)

const styles = ScaledSheet.create({
  fullScreen: { flex: 1, backgroundColor: 'white' },
  content: { flex: 1, flexDirection: "column" },
  alignCenter: { alignItems: 'center', justifyContent: 'center' },
  noteContainer: { marginTop: '10@s', flexDirection: 'column', width: '100%' },
  noteTitle: { flexWrap: 'wrap', fontSize: '12@s', ...Fonts.NanumGothic_Regular, lineHeight: '17@s' },
  logo: {
    height: '50@s', flexDirection: "row", alignItems: 'center', justifyContent: 'flex-start',
    borderBottomWidth: '1@s', borderColor: 'rgba(222, 227, 235, 1)'
  },
  iconLogo: { height: '20@s', width: '20@s', margin: '2@s', marginLeft: '15@s', },
  marginTop20: { marginTop: '20@s' },
  title: { ...Fonts.NotoSans_Bold, fontSize: '14@s' },
  QRcodeWrapper: { width: '90%', marginTop: '20@s' },
  addressSpace: { margin: '20@s', marginBottom: '10@s' },
  tagSpace: { margin: '5@s', marginBottom: '20@s', marginTop: '0@s' },
  actionWapper: { flexDirection: 'row', width: '70%', height: '35@s', justifyContent: 'center', alignItems: 'center' },
  actionCopy: {
    marginTop: '10@s', flex: 1, height: '35@s',
    backgroundColor: 'rgba(0, 112, 192, 1)', borderRadius: '4@s', borderColor: 'rgba(0, 0, 0, 0.1)'
  },
  secondBtn: { marginLeft: '5@s' },
  actionText: { color: 'white', ...Fonts.OpenSans_Bold, fontSize: '14@s' },
  fontNotoSansBold: { ...Fonts.NotoSans_Bold, fontSize: '14@s' },
  actionGetAddress: {
    marginTop: '20@s', width: '80%', height: '35@s',
    backgroundColor: 'rgba(0, 112, 192, 1)', borderRadius: '4@s', borderColor: 'rgba(0, 0, 0, 0.1)'
  },
  actionGetAddressText: { color: 'white', ...Fonts.OpenSans_Bold, fontSize: '14@s' }
});