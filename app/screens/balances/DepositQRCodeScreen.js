import React from 'react';
import {
  Text,
  Clipboard,
  TouchableOpacity,
  View,
  SafeAreaView,
  ToastAndroid
} from 'react-native';
import BaseScreen from '../BaseScreen'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import I18n from '../../i18n/i18n'
import { withNavigationFocus } from 'react-navigation'
import HeaderBalance from './HeaderBalance'
import { scale } from "../../libs/reactSizeMatter/scalingUtils"
import QRCode from 'react-native-qrcode-svg'

class DepositQRCodeScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
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

  _doCopy(symbol, hasTag) {
    if (hasTag) {
      Clipboard.setString(symbol.blockchain_tag)
    } else {
      Clipboard.setString(symbol.blockchain_address)
    }

    ToastAndroid.showWithGravity(
      I18n.t('deposit.copyInfo'),
      ToastAndroid.SHORT,
      ToastAndroid.CENTER
    )
  }

  render() {
    const { navigation } = this.props;
    const symbol = navigation.getParam('symbol', {})

    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.content}>
          <HeaderBalance />
          {this.state.isComplete &&
            <View style={[styles.alignCenter, { marginTop: 20 }]}>
              <View style={styles.alignCenter}>
                <Text style={{ fontWeight: 'bold' }}>{symbol.code.toUpperCase() + " " + I18n.t('deposit.title')}</Text>
              </View>
              {symbol.blockchain_address && symbol.blockchain_address != null &&
                <View style={[styles.alignCenter, { width: '70%', marginTop: 20 }]}>
                  <View>
                    <QRCode
                      size={scale(150)}
                      value={symbol.blockchain_address ? symbol.blockchain_address : 'No address'} />

                    <Text style={{ margin: 10, marginBottom: 5 }}>
                      {symbol.blockchain_address}
                    </Text>
                    {symbol.blockchain_tag && symbol.blockchain_tag != null &&
                      <Text style={{ margin: 5, marginBottom: 20 }}>
                        {I18n.t('deposit.tagAddress') + " " + symbol.blockchain_tag}
                      </Text>
                    }
                  </View>
                  <View style={{ flexDirection: 'row', width: '100%', height: 45, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => this._doCopy(symbol, false)}
                      style={[styles.alignCenter, {
                        marginTop: 10, flex: 1, height: 40,
                        backgroundColor: 'blue', borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.1)'
                      }]}>
                      <Text style={{ color: 'white' }}>{I18n.t('deposit.copyAddress')}</Text>
                    </TouchableOpacity>
                    {symbol.blockchain_tag && symbol.blockchain_tag != null &&
                      <TouchableOpacity
                        onPress={() => this._doCopy(symbol, true)}
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

export default withNavigationFocus(DepositQRCodeScreen)

const styles = ScaledSheet.create({
  fullScreen: { flex: 1 },
  content: { flex: 1, flexDirection: "column" },
  alignCenter: { alignItems: 'center', justifyContent: 'center' },
  noteContainer: { marginTop: 10, flexDirection: 'column', width: '100%' },
  noteTitle: { flexWrap: 'wrap', fontSize: 13, fontWeight: 'normal' },
});