import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Clipboard
} from 'react-native';
import BaseScreen from '../../BaseScreen'
import { CommonStyles, Fonts } from '../../../utils/CommonStyles';
import I18n from '../../../i18n/i18n';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';

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

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  textHeader: {
    marginTop: '30@s',
    textAlign: 'center',
    fontSize: '13@s',
    ...Fonts.NanumGothic_Regular
  },
  recoveryCodeText: {
    marginTop: '60@s',
    marginBottom: '40@s',
    alignSelf: 'center',
    fontSize: '16@s',
    fontWeight: 'bold',
    ...Fonts.OpenSans_Light
  },
  secretCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '40@s',
    backgroundColor: '#F2F2F2',
    borderBottomWidth: '1@s',
    borderColor: '#595959',
    marginStart: '30@s',
    marginEnd: '30@s'
  },
  secretCode: {
    fontSize: '16@s',
    ...Fonts.OpenSans_Bold,
  }
});