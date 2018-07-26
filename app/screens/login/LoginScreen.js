import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  ImageBackground
} from 'react-native';
import { Icon } from 'react-native-elements'
import rf from '../../libs/RequestFactory';
import I18n from '../../i18n/i18n';
import AppPreferences from '../../utils/AppPreferences';
import BaseScreen from '../BaseScreen';
import LoginCommonStyle from './LoginCommonStyle'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import { CommonSize, CommonStyles, Fonts } from "../../utils/CommonStyles";

export default class LoginScreen extends BaseScreen {

  state = {
    email: '',
    emailValidation: null,
    passwordEmpty: null,
    messageUnCorrect: null,
    otpValidation: null,
    password: '',
    otp: '',
    checkOtp: false,
  }


  checkValidationLogin() {
    const { email, password } = this.state;

    if (!email.length) {
      this.setState({ emailValidation: I18n.t('login.emailEmpty') });
    } else if (!password.length) {
      this.setState({ emailValidation: null, passwordEmpty: I18n.t('login.passwordEmpty') });
    } else {
      this.setState({ emailValidation: I18n.t('login.emailValidation'), passwordEmpty: null });
    }
  }

  _checkEmail(email) {
    let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return reg.test(email);
  }


  async _onPressLogin() {
    try {
      const { email, password, otp } = this.state;
      const emailLogical = this._checkEmail(email);

      if (emailLogical && password.length) {
        let responseUser = await rf.getRequest('UserRequest').login(email, password, otp);

        AppPreferences.saveAccessToken(responseUser.access_token);
        window.GlobalSocket.connect();
        this.navigate('MainScreen', {});
      } else {
        this.checkValidationLogin();
      }
    } catch (err) {
      if (err.error == 'invalid_otp'){
        if (!this.state.checkOtp){
          this.setState({ checkOtp: true, emailValidation: null, passwordEmpty: null})
        } else {
          this.setState({ messageUnCorrect: I18n.t('login.otpUncorrect')})
          setTimeout(() => this.setState({ messageUnCorrect: null }), 1000);
        }

      }
      else {
        this.setState({
          emailValidation: null,
          passwordEmpty: null,
          messageUnCorrect: I18n.t('login.messageUnCorrect')
        });

        setTimeout(() => this.setState({ messageUnCorrect: null }), 1000);
      }
      console.log('err', err);


    }

  }

  onBackButtonPressAndroid() {
    if (this.state.checkOtp) {
      this.setState({ checkOtp: false });
      return true
    }
    else {
      return super.onBackButtonPressAndroid()
    }

  }

  render() {
    const {
      email,
      password,
      emailValidation,
      passwordEmpty,
      messageUnCorrect,
      otp,
      checkOtp,
      otpValidation
    } = this.state;
    let rawInput1;
    if (this.state.checkOtp) {
      rawInput1 =
        <View style={[styles.viewInput]}>
          <TextInput
            value={otp}
            keyboardType= 'numeric'
            placeholder={I18n.t('login.otp')}
            // blurOnSubmit={false}
            placeholderTextColor='#fff'
            underlineColorAndroid='transparent'
            autoCapitalize='none'
            style={[styles.inputLogin, {flex: 1, textAlign: 'center' }]}
            returnKeyType={"next"}
            onChangeText={(text) => this.setState({ otp: text })}/>
        </View>
    } else {
      rawInput1 =
        <View style={styles.viewInput}>
          <Image
            resizeMode={'contain'}
            style={styles.iconLogin}
            source={require('../../../assets/emailLogin/email.png')}
          />
          <TextInput
            value={email}
            keyboardType='email-address'
            placeholder={I18n.t('login.email')}
            // blurOnSubmit={false}
            placeholderTextColor='#fff'
            underlineColorAndroid='transparent'
            autoCapitalize='none'
            style={[styles.inputLogin]}
            returnKeyType={"next"}
            onChangeText={(text) => this.setState({ email: text })}/>
        </View>


    }
    return (
      <View style={styles.screen}>
        <Image
          resizeMode="cover"
          style={styles.backgroundLogin}
          source={require('../../../assets/background/bitkoex.png')}/>
        <View style={styles.viewLogo}>
          <Text style={styles.textLogo}>{I18n.t('login.textLogo')}</Text>
          <Text style={styles.titleLogo}>{I18n.t('login.titleLogo')}</Text>
        </View>

        {/*<View style={styles.rowFlexOne}/>*/}

        {rawInput1}
        <Text style={styles.emptyInforLogin}>{emailValidation}</Text>

        <View style={[styles.viewInput, styles.inputRowMarginTop]}>
          <Image
            resizeMode={'contain'}
            style={styles.iconLogin}
            source={require('../../../assets/password/password.png')}
          />
          <TextInput
            style={[styles.inputLogin]}
            value={password}
            secureTextEntry={true}
            placeholderTextColor='#fff'
            placeholder={I18n.t('login.password')}
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({ password: text })}/>

        </View>
        <Text style={styles.emptyInforLogin}>{passwordEmpty}</Text>

        <TouchableOpacity onPress={this._onPressLogin.bind(this)} style={styles.viewButtonLogin}>
          <View>
            <Text style={styles.textLogin}>{I18n.t('login.login')}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.emptyInforLogin}>{messageUnCorrect}</Text>

        <View style={styles.rowFlexTwo}>
        </View>

      </View>

    )
  }
}

const styles = ScaledSheet.create({
  ...LoginCommonStyle,
  screen: {
    flex: 1,
    ...LoginCommonStyle.screen,
  },
  loginBottom: {
    marginTop: "52@s",
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: "5@s",
  },
  textUnderline: {
    textDecorationLine: 'underline',
  },
  inputRowMarginTop: {
    marginTop: "15@s",
  },
  showPassword: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: "9@s"
  },
  viewLogo: {
    alignItems: 'center',
    marginTop: '120@s',
    flexDirection: 'column',
    marginBottom: '40@s'
  },
  textLogo: {
    color: '#FFF',
    fontSize: '40@s',
    ...Fonts.OpenSans_Bold
  },
  titleLogo: {
    color: '#FFF',
    fontSize: '10@s',
    ...Fonts.NotoSans_Regular
  },
  inputLogin: {
    height: '40@s',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    fontSize: '14@s',
    ...Fonts.OpenSans_Light
  },
  iconLogin: {
    position: 'absolute',
    width: '15@s',
    marginBottom: '3@s',
    flex: 0.2,
    height: '15@s',
    left: '22@s'
  },
  viewInput: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingLeft: '50@s',
    paddingRight: '50@s'
  },
  viewButtonLogin: {
    // flex: 1,
    width: '100%',
    marginTop: '37@s',
    height: '43@s',
    backgroundColor: '#467b92',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '5@s'
  },
  textLogin: {
    fontSize: '14@s',
    color: '#FFF',
    ...Fonts.OpenSans_Light
  },
  emptyInforLogin: {
    textAlign: 'center',
    color: 'red',
    fontSize: '12@s',
    marginLeft: '18@s',
    lineHeight: '22@s',
    ...Fonts.NotoSans_Regular,
  },
  backgroundLogin: {
    position: 'absolute',
    top: '0@s',
    bottom: '0@s',
    left: '0@s',
    right: '0@s',
    justifyContent: 'center',
    alignItems: 'center',
    width: null,
    height: null
  }
});