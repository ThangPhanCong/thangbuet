import React from 'react';
import {
  Text,
  View,
} from 'react-native';
import BaseScreen from '../../BaseScreen'
import { CommonStyles } from '../../../utils/CommonStyles';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';

export default class OTPSecretCodeScreen extends BaseScreen {
  render() {
    let { secretCode } = this.props.navigation.state.params;

    return(
      <View style={styles.screen}>
        <Text style={styles.textHeader}>
          {`구글 OTP인증이 완료되었습니다. \n이 화면을 벗어나면 복구 코드는 다시 볼 수 없습니다.\n반드시 아래 복구코드를 다른 곳에 잘 보관하세요.`}
        </Text>
        <Text style={styles.recoveryCodeText}>
          {'RECOVERY CODE'}
        </Text>
        <View style={styles.secretCodeContainer}>
          <Text style={styles.secretCode}>
            {secretCode}
          </Text>
        </View>
      </View>
    )
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  textHeader: {
    marginTop: '30@s',
    textAlign: 'center',
    fontSize: '13@s'
  },
  recoveryCodeText: {
    marginTop: '60@s',
    marginBottom: '20@s',
    alignSelf: 'center',
    fontSize: '16@s'
  },
  secretCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '40@s',
    backgroundColor: '#F2F2F2',
    borderBottomWidth: 1,
    borderColor: '#595959',
    marginStart: '30@s',
    marginEnd: '30@s'
  },
  secretCode: {
    fontSize: '16@s',
    fontWeight: 'bold'
  }
});