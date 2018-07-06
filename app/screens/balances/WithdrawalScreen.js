import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { withNavigationFocus } from 'react-navigation';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import BaseScreen from '../BaseScreen';
import HeaderBalance from './HeaderBalance';

class WithdrawalScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
    }
    this.currency = 'krw'
  }

  render() {
    const { navigation } = this.props;
    const symbol = navigation.getParam('symbol', {})

    return (
      <SafeAreaView style={styles.fullScreen}>
        <View style={styles.content}>
          <HeaderBalance />
          {symbol && symbol.code === 'krw' && <KRWScreen symbol={symbol} navigation={navigation} />}
          {/* {symbol && symbol.code !== 'krw' && <KRWScreen symbol={symbol} />} */}
        </View>
      </SafeAreaView>
    )
  }
}

export default withNavigationFocus(WithdrawalScreen)

const styles = ScaledSheet.create({
  fullScreen: { flex: 1 },
  content: { flex: 1, flexDirection: "column" },
});