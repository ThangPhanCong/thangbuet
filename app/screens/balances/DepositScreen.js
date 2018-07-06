import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { withNavigationFocus } from 'react-navigation';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import BaseScreen from '../BaseScreen';
import HeaderBalance from './HeaderBalance';

class DepositScreen extends BaseScreen {
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
            <View>

            </View>
          </View>
        }
      </SafeAreaView>
    )
  }
}

export default withNavigationFocus(DepositScreen)

const styles = ScaledSheet.create({
  fullScreen: { flex: 1 },
  content: { flex: 1, flexDirection: "column" },
});