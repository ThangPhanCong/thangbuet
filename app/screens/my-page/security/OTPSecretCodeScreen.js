import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BaseScreen from '../../BaseScreen'
import { CommonStyles } from '../../../utils/CommonStyles';

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
    marginBottom: 20,
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