import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard
} from 'react-native';
import BaseScreen from '../../BaseScreen'
import { CommonStyles } from '../../../utils/CommonStyles';
import I18n from '../../../i18n/i18n';

export default class OTPSecretCodeScreen extends BaseScreen {
  render() {
    let { secretCode } = this.props.navigation.state.params;

    return(
      <View style={styles.screen}>
        <Text style={styles.textHeader}>
          {I18n.t('myPage.security.recoveryGuide')}
        </Text>
        <Text style={styles.recoveryCodeText}>
          {I18n.t('myPage.security.recoveryCode').toLocaleUpperCase()}
        </Text>
        <TouchableOpacity style={styles.secretCodeContainer}
          onPress={this._onCopySecretCode.bind(this)}>
          <Text style={styles.secretCode}>
            {secretCode}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  async _onCopySecretCode() {
    let { secretCode } = this.props.navigation.state.params;
    await Clipboard.setString(secretCode);
  }
}

const styles = StyleSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  textHeader: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 13
  },
  recoveryCodeText: {
    marginTop: 60,
    marginBottom: 40,
    alignSelf: 'center',
    fontSize: 16
  },
  secretCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: '#F2F2F2',
    borderBottomWidth: 1,
    borderColor: '#595959',
    marginStart: 30,
    marginEnd: 30
  },
  secretCode: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});