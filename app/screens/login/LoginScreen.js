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
import rf from '../../libs/RequestFactory';
import I18n from '../../i18n/i18n';
import AppPreferences from '../../utils/AppPreferences';
import BaseScreen from '../BaseScreen';
import LoginCommonStyle from './LoginCommonStyle'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { Fonts } from "../../utils/CommonStyles";
import { handleBackAction } from '../../../App';
import { scale } from "../../libs/reactSizeMatter/scalingUtils";

export default class LoginScreen extends BaseScreen {

  state = {
    email: '',
    password: '',
    otp: '',
    checkOtp: false,
    errorText: null
  }

  checkValidationLogin() {
    const { email, password } = this.state;

    if (!email.length) {
      this.setState({ errorText: I18n.t('login.emailEmpty') });
    } else if (!password.length) {
      this.setState({ errorText: I18n.t('login.passwordEmpty') });
    } else {
      this.setState({ errorText: I18n.t('login.emailValidation') });
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
          this.setState({ checkOtp: true, errorText: null})
        } else {
          this.setState({ errorText: I18n.t('login.otpUncorrect')})
          setTimeout(() => this.setState({ errorText: null }), 1000);
        }

      }
      else {
        this.setState({
          errorText: I18n.t('login.messageUnCorrect')
        });

        setTimeout(() => this.setState({ errorText: null }), 1000);
      }
      console.log('err', err);


    }

  }

  componentDidMount() {
    super.componentDidMount();

    handleBackAction(this.onBackButtonPressAndroid);
  }

  onBackButtonPressAndroid = () => {
    if (this.state.checkOtp) {
      this.setState({ checkOtp: false });
      return true
    }
    else {
      return false
    }

  }

  render() {
    const {
      email,
      password,
      otp,
      checkOtp,
      errorText
    } = this.state;
    let rawInput1;
    if (checkOtp) {
      rawInput1 =
        <View>
          <TextInput style={[styles.inputLogin, {borderTopLeftRadius: scale(3), borderTopRightRadius: scale(3)}]}
                     underlineColorAndroid='transparent'
                     value={otp}
                     keyboardType= 'numeric'
                     placeholder={I18n.t('login.otp')}
                     placeholderTextColor='#000000'
                     returnKeyType={"next"}
                     onChangeText={(text) => this.setState({ otp: text })}/>
        </View>
    } else {
      rawInput1 =
        <View>
          <TextInput style={[styles.inputLogin, {borderTopLeftRadius: scale(3), borderTopRightRadius: scale(3)}]}
                     underlineColorAndroid='transparent'
                     value={email}
                     keyboardType='email-address'
                     placeholder={I18n.t('login.email')}
                     placeholderTextColor='#000000'
                     returnKeyType={"next"}
                     onChangeText={(text) => this.setState({ email: text })}/>
          <Image
            style={styles.iconMenu}
            source={require('../../../assets/login/mail.png')}/>
        </View>


    }
    return (
      <View style={styles.screen}>
        <Image
          style={styles.logoLogin}
          source={require('../../../assets/login/logologin.png')}/>

        {rawInput1}

        <View>
          <TextInput style={[styles.inputLogin, {borderBottomLeftRadius: scale(3), borderBottomRightRadius: scale(3)}]}
                     secureTextEntry={true}
                     underlineColorAndroid='transparent'
                     value={password}
                     placeholder={I18n.t('login.password')}
                     placeholderTextColor='#000000'
                     returnKeyType={"next"}
                     onChangeText={(text) => this.setState({ password: text })}/>
          <Image
            style={styles.iconMenu}
            source={require('../../../assets/login/password.png')}/>
        </View>

        <Text style={styles.errorText}>{errorText}</Text>

        <TouchableOpacity onPress={this._onPressLogin.bind(this)} style={styles.viewButtonLogin}>
            <Text style={styles.textLogin}>{I18n.t('login.login')}</Text>
        </TouchableOpacity>
      </View>

    )
  }
}

const styles = ScaledSheet.create({
  ...LoginCommonStyle,
  screen: {
    flex: 1, backgroundColor: '#00358e', flexDirection: 'column', alignItems: 'center'
  },
  logoLogin:{
    width: '191@s', height: '74.5@s', margin: '25@s'
  },
  inputLogin: {
    height: '35@s', width: '300@s', backgroundColor: '#ffffff', fontSize: '13@s', color: '#000000', paddingLeft: '45@s',
    flexDirection: 'column', justifyContent: 'center', paddingTop: 0, paddingBottom: 0, paddingRight: '15@s',
    textAlign: 'center', ...Fonts.NanumGothic_Regular, marginBottom: '1@s'
  },
  iconMenu: {
    width: '19@s', height: '18@s', position: 'absolute', top: '8@s', left: '15@s'
  },
  errorText: {
    textAlign: 'center', color: 'red', fontSize: '12@s', lineHeight: '15@s', ...Fonts.NotoSans_Regular,
    margin: '5@s'
  },
  viewButtonLogin: {
    width: '300@s', marginTop: '5@s', height: '35@s', backgroundColor: '#2a6edf', borderRadius: '3@s',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  textLogin:{
    fontSize: '13@s', color: '#FFF', ...Fonts.OpenSans_Light
  }
});