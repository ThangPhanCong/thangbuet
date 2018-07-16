import React from 'react';
import {
  StyleSheet,
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
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';
import { BoxShadow } from 'react-native-shadow';
import BaseScreen from '../../BaseScreen'
import { CommonStyles, Fonts } from '../../../utils/CommonStyles';
import rf from '../../../libs/RequestFactory';
import I18n from '../../../i18n/i18n';
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
          {I18n.t('myPage.security.verificationGuide')}
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
                {I18n.t('myPage.security.secretKey').toLocaleUpperCase()}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, {flex: 2, backgroundColor: '#595959'}]}
                  onPress={this._onShowSecretCode.bind(this)}
                  disabled={this.state.isShowSecretCode}>
                  <Text style = {styles.buttonText}>
                    {this.state.isShowSecretCode ? this._secretCode : I18n.t('myPage.security.viewSecretKey').toLocaleUpperCase()}
                  </Text>
                </TouchableOpacity>
                <View style={styles.buttonSpace}/>
                <TouchableOpacity
                  style={[styles.button, this.state.isShowSecretCode ? {flex: 1, backgroundColor: '#0070C0'} : {flex: 1, backgroundColor: '#BFBFBF'}]}
                  onPress={this._onCopySecretCode.bind(this)}
                  disabled={!this.state.isShowSecretCode}>
                  <Text style = {styles.buttonText}>
                    {I18n.t('myPage.security.copy').toLocaleUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonAreaSpace}/>

            <View style={styles.buttonRowContainer}>
              <Text style={styles.title}>
                {I18n.t('myPage.security.otpCode').toLocaleUpperCase()}
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
                    {I18n.t('myPage.security.activate').toLocaleUpperCase()}
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
    await Clipboard.setString(this._secretCode);
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
      await rf.getRequest('UserRequest').addSecuritySettingOtp(this._otpCode);
      Keyboard.dismiss();
      let { addOtpVerificationHandler } = this.props.navigation.state.params;
      if (addOtpVerificationHandler) {
        addOtpVerificationHandler();
      }
      
      this.navigate('OTPSecretCodeScreen', {
        secretCode: this._secretCode
      });
    }
    catch(err) {
      console.log('OTPVerifyScreen._verifyOTP', err);
    }
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
    fontSize: '13@s',
    ...Fonts.NanumGothic_Regular
  },
  qrcodeContainer: {
    marginTop: '10@s',
    marginBottom: '20@s',
    aspectRatio: 1,
    width: '160@s',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: '5@s'
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
    fontSize: '12@s',
    ...Fonts.OpenSans_Light
  },
  buttonText: {
    color: '#FFF',
    fontSize: '12@s',
    fontWeight: 'bold',
    ...Fonts.OpenSans
  },
  otpInput: {
    flex: 2,
    height: '40@s',
    borderRadius: '5@s',
    borderWidth: '1@s',
    borderColor: '#BFBFBF'
  }
});