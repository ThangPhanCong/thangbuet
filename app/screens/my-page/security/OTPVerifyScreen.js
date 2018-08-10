import React from 'react';
import {
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
import BaseScreen from '../../BaseScreen'
import { CommonStyles, Fonts } from '../../../utils/CommonStyles';
import rf from '../../../libs/RequestFactory';
import I18n from '../../../i18n/i18n';
import { isEmpty } from 'lodash';
import UIUtils from "../../../utils/UIUtils";
import Events from "../../../utils/Events";

export default class OTPVerifyScreen extends BaseScreen {
  _otpCode = '';
  _secretCode = '';

  constructor(props) {
    super(props);
    this.state = {
      isShowSecretCode: false,
      qrCodeUrl: '',
      otpWrong: false,
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

  _renderOtpWrong() {
    return(
      <View style={styles.otpWrongContainer}>
        <Text style={styles.otpWrongMessage}>{I18n.t('myPage.security.otpWrong')}</Text>
      </View>
    )
  }

  render() {
    const { otpWrong } = this.state;
    let guideText = I18n.t('myPage.security.verificationGuide');
    let guideTextSubstr = guideText.split('(+)');

    return(
      <KeyboardAvoidingView
        style={styles.screen}
        behavior='position'
        keyboardVerticalOffset={Platform.select({
          ios: 104,
          android: 200
        })}>
        {otpWrong ? this._renderOtpWrong() : null}
        <Text style={styles.textHeader}>
          {guideTextSubstr[0] + ' '}
          <Image
            style={styles.iconAdd}
            source={require('../../../../assets/myPage/security/add.png')}/>
          <Text>
            {' ' + guideTextSubstr[1]}
          </Text>
        </Text>
        <View style={styles.qrcodeContainer}>
          {
            !isEmpty(this.state.qrCodeUrl) &&
            <Image
              style={{flex: 1,}}
              source={{uri: this.state.qrCodeUrl}}/>
          }
        </View>
        <View style={styles.functionContainer}>
          <View style={{flex: 1, flexDirection: 'column'}}>
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
                  keyboardType= 'numeric'
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
    if (isEmpty(this._otpCode)) {
      this.setState({otpWrong: true});
      setTimeout(() =>this.setState({otpWrong: false}), 500);

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
      this.notify(Events.SECURITY_SETTINGS_UPDATED);
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
      this.setState({otpWrong: true});
      setTimeout(() =>this.setState({otpWrong: false}), 500);
      console.log('OTPVerifyScreen._verifyOTP', err);
    }
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  textHeader: {
    marginTop: '20@s',
    marginStart: '20@s',
    marginEnd: '20@s',
    textAlign: 'center',
    fontSize: '13@s',
    lineHeight: '22@s',
    ...Fonts.NanumGothic_Regular,
    position: 'relative'
  },
  qrcodeContainer: {
    marginBottom: '20@s',
    aspectRatio: 1,
    width: '140@s',
    height: '140@s',
    alignSelf: 'center',
    padding: '3@s',
    borderWidth: 0,
    ...UIUtils.generatePopupShadow()
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
    marginTop: '30@s'
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
    paddingLeft: '16@s',
    paddingRight: '16@s',
    height: '40@s',
    borderRadius: '5@s',
    borderWidth: '1@s',
    borderColor: '#BFBFBF',
    fontSize: '12@s',
    ...Fonts.NanumGothic_Regular
  },
  iconAdd: {
    width: '35@s',
    height: '35@s',
  },
  otpWrongContainer: {
    backgroundColor: '#ff3333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '180@s',
    height: '40@s',
    position: 'absolute',
    top: '50@s',
    left: '90@s',
    zIndex: 2
  },
  otpWrongMessage: {
    ...Fonts.NanumGothic_Regular,
    fontSize: '12@s',
    color: '#FFF'
  }
});