import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Clipboard, ToastAndroid } from 'react-native';
import BaseScreen from '../BaseScreen'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import I18n from '../../i18n/i18n'
import { withNavigationFocus } from 'react-navigation'
import HeaderBalance from './HeaderBalance'
import rf from '../../libs/RequestFactory'
import QRCode from 'react-native-qrcode-svg'
import { scale } from "../../libs/reactSizeMatter/scalingUtils"

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
          <HeaderBalance />
          {this.state.isComplete &&
            <View style={[styles.alignCenter, { marginTop: 20 }]}>
              <View style={styles.alignCenter}>
                <Text style={{ fontWeight: 'bold' }}>{this.state.symbol.code.toUpperCase() + " " + I18n.t('deposit.title')}</Text>
              </View>

              {this.state.isComplete && (!this.state.symbol.blockchain_address || this.state.symbol.blockchain_address == null) &&
                <View style={[styles.alignCenter, { width: '90%', marginTop: 20 }]}>
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
                    style={[styles.alignCenter, {
                      marginTop: 10, width: '70%', height: 40,
                      backgroundColor: 'blue', borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.1)'
                    }]}>
                    <Text style={{ color: 'white' }}>{I18n.t('deposit.coinBtn')}</Text>
                  </TouchableOpacity>
                </View>
              }
              {this.state.isComplete && this.state.symbol.blockchain_address && this.state.symbol.blockchain_address != null &&
                <View style={[styles.alignCenter, { width: '90%', marginTop: 20 }]}>
                  <QRCode
                    size={scale(150)}
                    value={this.state.symbol.blockchain_address ? this.state.symbol.blockchain_address : 'No address'} />

                  <Text style={{ margin: 10, marginBottom: 5 }}>
                    {this.state.symbol.blockchain_address}
                  </Text>
                  {this.state.symbol.blockchain_tag && this.state.symbol.blockchain_tag != null &&
                    <Text style={{ margin: 5, marginBottom: 20 }}>
                      {I18n.t('deposit.tagAddress') + " " + this.state.symbol.blockchain_tag}
                    </Text>
                  }
                  <View style={{ flexDirection: 'row', width: '70%', height: 45, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => this._doCopy(false)}
                      style={[styles.alignCenter, {
                        marginTop: 10, flex: 1, height: 40,
                        backgroundColor: 'blue', borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.1)'
                      }]}>
                      <Text style={{ color: 'white' }}>{I18n.t('deposit.copyAddress')}</Text>
                    </TouchableOpacity>
                    {this.state.symbol.blockchain_tag && this.state.symbol.blockchain_tag != null &&
                      <TouchableOpacity
                        onPress={() => this._doCopy(true)}
                        style={[styles.alignCenter, {
                          marginTop: 10, flex: 1, height: 40, marginLeft: 5,
                          backgroundColor: 'blue', borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.1)'
                        }]}>
                        <Text style={{ color: 'white' }}>{I18n.t('deposit.copyTag')}</Text>
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
  fullScreen: { flex: 1 },
  content: { flex: 1, flexDirection: "column" },
  alignCenter: { alignItems: 'center', justifyContent: 'center' },
  noteContainer: { marginTop: 10, flexDirection: 'column', width: '100%' },
  noteTitle: { flexWrap: 'wrap', fontSize: 13, fontWeight: 'normal' },

});