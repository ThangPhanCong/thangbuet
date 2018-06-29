import React from 'react';
import {
  StyleSheet,
  PixelRatio,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Clipboard,
  Image,
  Platform,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import { BoxShadow } from 'react-native-shadow';
import BaseScreen from '../../BaseScreen'
import { CommonStyles } from '../../../utils/CommonStyles';
// import KeyboardAvoidingView from '../../../utils/KeyboardAvoidingView';
import rf from '../../../libs/RequestFactory';
import _ from 'lodash';

const shadowOpt = {
  width: 155,
  height: 155,
  color: "#000",
  opacity: 0.3,
  border: 5,
	radius: 5,
	x: 0,
	y: 0
}

export default class OTPVerifyScreen extends BaseScreen {
  _otpCode = '';
  _secretCode = '';

  constructor(props) {
    super(props);
    this.state = {
      isShowSecretCode: false,
      qrCodeUrl: ''
    }
  }

  componentWillMount() {
    super.componentWillMount();
    this._getGoogleAuthenKey();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    Keyboard.dismiss();
  }

  render() {
    return(
      <KeyboardAvoidingView
        style={styles.screen}
        behavior='position'
        keyboardVerticalOffset={Platform.select({
          ios: 104,
          android: 200
        })}>
        <Text style={styles.textHeader}>
          {`1. '추가' 를 선택하고 'SECRET KEY'를 입력하세요\n2. APP에 표시된 6자리의 OTP CODE를 입력하고 'ACTIVATE'를 클릭하세요`}
        </Text>
        <View style={styles.qrcodeContainer}>
          {
            Platform.select({
              ios: (
                <View style = {{flex: 1}}>
                  {
                    !_.isEmpty(this.state.qrCodeUrl) &&
                    <Image
                      style={{flex: 1}}
                      source={{uri: this.state.qrCodeUrl}}/>
                  }
                </View>
              ),
              android: (
                <BoxShadow setting={shadowOpt}>
                  {
                    !_.isEmpty(this.state.qrCodeUrl) &&
                    <Image
                      style={{flex: 1, padding: 10}}
                      source={{uri: this.state.qrCodeUrl}}/>
                  }
                </BoxShadow>
              )
            })
          }
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
                    {this.state.isShowSecretCode ? this._secretCode : 'VIEW SECRET KEY' }
                  </Text>
                </TouchableOpacity>
                <View style={styles.buttonSpace}/>
                <TouchableOpacity
                  style={[styles.button, this.state.isShowSecretCode ? {flex: 1, backgroundColor: '#0070C0'} : {flex: 1, backgroundColor: '#BFBFBF'}]}
                  onPress={this._onCopySecretCode.bind(this)}
                  disabled={!this.state.isShowSecretCode}>
                  <Text style = {styles.buttonText}>
                    {'COPY'}
                  </Text>
                </TouchableOpacity>
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
                  underlineColorAndroid='transparent'
                  onChangeText={this._onOTPTextChanged.bind(this)}
                  onSubmitEditing={Keyboard.dismiss}/>
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
      </KeyboardAvoidingView>
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
    if (_.isEmpty(this._otpCode)) {
      return;
    }

    this._verifyOTP();
  }

  _onOTPTextChanged(text) {
    this._otpCode = text;
  }

  async _getGoogleAuthenKey() {
    try {
      let res = await rf.getRequest('UserRequest').getQRCodeGoogleUrl();
      let key = res.data;
      this._secretCode = key.key;
      this.setState({
        qrCodeUrl: key.url
      })
    }
    catch(err) {
      console.log('OTPVerifyScreen._getGoogleAuthenKey', err);
    }
  }

  async _verifyOTP(code) {
    try {
      await rf.getRequest('UserRequest').verify(this._otpCode);
      this.navigate('OTPSecretCodeScreen', {
        secretCode: this._secretCode
      });
    }
    catch(err) {
      console.log('OTPVerifyScreen._verifyOTP', err);
    }
  }
}

const styles = StyleSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  textHeader: {
    marginTop: 30,
    marginStart: 20,
    marginEnd: 20,
    textAlign: 'center',
    fontSize: 13
  },
  qrcodeContainer: {
    marginTop: 40,
    marginBottom: 20,
    aspectRatio: 1,
    width: 160,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  functionContainer: {
    marginStart: 40,
    marginEnd: 40,
    height: 150
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  buttonRowContainer: {
    flex: 1
  },
  button: {
    height: 40,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonSpace: {
    width: 5
  },
  buttonAreaSpace: {
    height: 10
  },
  title: {
    marginBottom: 5,
    fontSize: 12
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12
  },
  otpInput: {
    flex: 2,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#BFBFBF'
  }
});