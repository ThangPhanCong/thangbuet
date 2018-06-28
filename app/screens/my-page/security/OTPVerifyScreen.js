import React from 'react';
import {
  PixelRatio,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Clipboard,
  KeyboardAvoidingView
} from 'react-native';
import BaseScreen from '../../BaseScreen'
import { CommonStyles } from '../../../utils/CommonStyles';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default class OTPVerifyScreen extends BaseScreen {
  _otpCode = '';

  constructor(props) {
    super(props);
    this.state = {
      isShowSecretCode: false,
      secretCode: '123456'
    }
  }

  render() {
    return(
      <KeyboardAwareScrollView
        style={styles.screen}
        enableOnAndroid={true}
        keyboardOpeningTime={0}
        extraHeight={PixelRatio.getPixelSizeForLayoutSize(20)}>
        <Text style={styles.textHeader}>
          {`1. '추가'        를 선택하고 'SECRET KEY'를 입력하세요\n2. APP에 표시된 6자리의 OTP CODE를 입력하고 'ACTIVATE'를 클릭하세요`}
        </Text>
        <View style={styles.qrcodeContainer}>
        </View>
        <View style={styles.functionContainer}>
          <View style={{flex: 1}}>
            <View style={styles.buttonRowContainer}>
              <Text style={styles.title}>
                {'SECRET KEY'}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, {flex: 2, backgroundColor: '#595959'}]}
                  onPress={this._onShowSecretCode.bind(this)}
                  disabled={this.state.isShowSecretCode}>
                  <Text style = {styles.buttonText}>
                    {this.state.isShowSecretCode ? this.state.secretCode : 'VIEW SECRET KEY' }
                  </Text>
                </TouchableOpacity>
                <View style={styles.buttonSpace}/>
                <TouchableHighlight
                  style={[styles.button, this.state.isShowSecretCode ? {flex: 1, backgroundColor: '#0070C0'} : {flex: 1, backgroundColor: '#BFBFBF'}]}
                  onPress={this._onCopySecretCode.bind(this)}
                  disabled={!this.state.isShowSecretCode}
                  underlayColor='#595959'>
                  <Text style = {styles.buttonText}>
                    {'COPY'}
                  </Text>
                </TouchableHighlight>
              </View>
            </View>

            <View style={styles.buttonAreaSpace}/>

            <View style={styles.buttonRowContainer}>
              <Text style={styles.title}>
                {'OTP CODE'}
              </Text>
              <View style={styles.buttonContainer}>
                <TextInput
                  style={styles.otpInput}
                  onChangeText={this._onOTPTextChanged.bind(this)}/>
                <View style={styles.buttonSpace}/>
                <TouchableOpacity
                  style={[styles.button, {flex: 1, backgroundColor: '#ED7D31'}]}
                  onPress={this._onActiveOTP.bind(this)}>
                  <Text style = {styles.buttonText}>
                    {'ACTIVATE'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    )
  }

  _onShowSecretCode() {
    this.setState({
      isShowSecretCode: true
    })
  }

  async _onCopySecretCode() {
    await Clipboard.setString(this.state.secretCode);
  }

  _onActiveOTP() {

  }

  _onOTPTextChanged(text) {
    this._otpCode = text;
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  textHeader: {
    marginTop: '30@s',
    marginStart: '20@s',
    marginEnd: '20@s',
    textAlign: 'center',
    fontSize: '13@s'
  },
  qrcodeContainer: {
    marginTop: '20@s',
    marginBottom: '20@s',
    aspectRatio: 1,
    width: '150@s'
  },
  functionContainer: {
    marginStart: '40@s',
    marginEnd: '40@s',
    height: '150@s'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  buttonRowContainer: {
    flex: 1
  },
  button: {
    height: '40@s',
    borderRadius: '5@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonSpace: {
    width: '5@s'
  },
  buttonAreaSpace: {
    height: '10@s'
  },
  title: {
    marginBottom: '5@s',
    fontSize: '12@s'
  },
  buttonText: {
    color: '#FFF',
    fontSize: '12@s'
  },
  otpInput: {
    flex: 2,
    height: '40@s',
    borderRadius: '5@s',
    borderWidth: 1,
    borderColor: '#BFBFBF'
  }
});