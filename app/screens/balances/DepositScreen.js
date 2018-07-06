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
  Button,
  Alert
} from 'react-native';
import BaseScreen from '../BaseScreen'
import MasterdataUtils from '../../utils/MasterdataUtils'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { Icon } from 'react-native-elements'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n'
import AppConfig from '../../utils/AppConfig'
import AppPreferences from '../../utils/AppPreferences'
import { formatCurrency, formatPercent, getCurrencyName } from '../../utils/Filters'
import { withNavigationFocus } from 'react-navigation'
import KRWScreen from './KRWScreen'
import KRWPendingScreen from './KRWPendingScreen'
import HeaderBalance from './HeaderBalance'

class DepositScreen extends BaseScreen {
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
              <View style={[styles.alignCenter, { width: '80%', marginTop: 20 }]}>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('deposit.coinNote1')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('deposit.coinNote2')}
                  </Text>
                </View>
                <View style={styles.noteContainer}>
                  <Text style={styles.noteTitle}>
                    {'\u2022' + I18n.t('deposit.coinNote3')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => this.navigate('DepositQRCode', { symbol })}
                style={[styles.alignCenter, {
                  marginTop: 10, width: '70%', height: 40,
                  backgroundColor: 'blue', borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.1)'
                }]}>
                <Text style={{ color: 'white' }}>{I18n.t('deposit.coinBtn')}</Text>
              </TouchableOpacity>
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