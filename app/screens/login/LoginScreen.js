import React from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import { Icon } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import rf from '../../libs/RequestFactory';
import I18n from '../../i18n/i18n';
import AppPreferences from '../../utils/AppPreferences';
import Consts from '../../utils/Consts';
import BaseScreen from '../BaseScreen';
import LoginCommonStyle from './LoginCommonStyle'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
const emailUnverified = 'email_unverified';
const invalidOtp = 'invalid_otp';

export default class LoginScreen extends BaseScreen {

  static LOGIN_EMAIL = 'email';
  static LOGIN_PASSWORD = 'password';
  static LOGIN_MESSAGE = 'message';
  static navigationOptions = {
    header: null,
    gesturesEnabled: false,
  }
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      styleForEmail: '',
      styleForPassword: '',
      showPassword: false,
      iconName: 'eye-slash',
      errorEmail: {
        show: false,
        text: ''
      },
      errorPassword: {
        show: false,
        text: ''
      },
      errorMessage: {
        show: false,
        text: ''
      }
    };
    this.focusNextField = this._focusNextField.bind(this);
    this.inputs = {};
  }

  _onFocus(inputName) {
    if (inputName == LoginScreen.LOGIN_EMAIL) {
      this._setStateError(false, '', LoginScreen.LOGIN_EMAIL);
      this.setState({ styleForEmail: styles.txtInputFocused })
    }
    else {
      this._setStateError(false, '', LoginScreen.LOGIN_PASSWORD);
      this.setState({ styleForPassword: styles.txtInputFocused })
    }
  }

  _onBlur(inputName) {
    (inputName == LoginScreen.LOGIN_EMAIL) ? this.setState({ styleForEmail: styles.txtInputUnFocused }) : this.setState({ styleForPassword: styles.txtInputUnFocused })
  }

  _setStateError(isShowError, textError, type) {
    const error = {
      show: isShowError,
      text: textError
    };
    const errorObject = Object.create(error);
    let styleInput = isShowError ? styles.textInputError : styles.txtInputUnFocused;
    switch (type) {
      case LoginScreen.LOGIN_EMAIL:
        this.setState({ errorEmail: errorObject, styleForEmail: styleInput });
        break;
      case LoginScreen.LOGIN_PASSWORD:
        this.setState({ errorPassword: errorObject, styleForPassword: styleInput });
        break;
      default:
        this.setState({ errorMessage: errorObject });
    }
  }

  _showError(message) {
    this._setStateError(true, message, LoginScreen.LOGIN_MESSAGE);
    setTimeout(() => this._setStateError(false, '', LoginScreen.LOGIN_MESSAGE), 1500);
  }

  _checkEmail(email) {
    let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return reg.test(email);
  }

  _focusNextField(id) {
    this.inputs[id].focus();
  }

  async _onPressLogin() {
    let email = this.state.email;
    let password = this.state.password;
    let isEmail = this._checkEmail(email);
    try {
      if (isEmail && password != '') {
        let responseUser = await rf.getRequest('UserRequest').login(this.state.email, this.state.password);

        AppPreferences.saveAccessToken(responseUser.access_token);
        window.GlobalSocket.connect();
        this.navigate('MainScreen', {});
      }
      else {
        if (email == '') {
          this._setStateError(true, I18n.t('login.errorMessage.errorValidateEmpty'), LoginScreen.LOGIN_EMAIL);
        }
        else {
          this._setStateError(false, '', LoginScreen.LOGIN_EMAIL);
          if (password == '')
            this._setStateError(true, I18n.t('login.errorMessage.errorValidateEmpty'), LoginScreen.LOGIN_PASSWORD);
          else {
            this._setStateError(false, '', LoginScreen.LOGIN_PASSWORD);
            this._setStateError(true, I18n.t('login.errorMessage.errorEmailValidate'), LoginScreen.LOGIN_EMAIL);
          }
        }
      }
    }
    catch (err) {
      if (err.error == undefined) {
        this._showError(I18n.t('common.message.network_error'));
      }
      else {
        if (err.error === invalidOtp) {
          this.navigate('AuthenticationScreen', { email: email, password: password });
        }
        else {
          if (err.error === emailUnverified)
            this._showError(I18n.t('login.errorMessage.errorEmailUnverified'));
          else
            this._showError(I18n.t('login.errorMessage.errorLogin'));
        }
      }
    }
  }

  getInitialState() {
    return {
      styleForEmail: styles.txtInputUnFocused,
      styleForPassword: styles.txtInputUnFocused
    }
  }

  _onPressRegister() {
    this.navigate('RegisterScreen', {})
  }

  _toggleShowPassWord() {
    let iconName = this.state.showPassword ? 'eye-slash' : 'eye';
    this.setState({ showPassword: !this.state.showPassword, iconName: iconName });
  }

  render() {
    return (
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.screen}
        extraHeight={PixelRatio.getPixelSizeForLayoutSize(125)}>

        <Image
          resizeMode={'contain'}
          style={styles.logoStyle}
          source={require('../../../assets/common/logoLogin.png')}
        />

        <View style={styles.rowFlexOne} />
        <View style={styles.inputRow}>
          <TextInput
            value={this.state.email}
            keyboardType='email-address'
            placeholder={I18n.t('login.email')}
            blurOnSubmit={false}
            placeholderTextColor='#cfd0d1'
            underlineColorAndroid='transparent'
            autoCapitalize='none'
            onBlur={() => this._onBlur(LoginScreen.LOGIN_EMAIL)}
            onFocus={() => this._onFocus(LoginScreen.LOGIN_EMAIL)}
            style={[styles.input, this.state.styleForEmail]}
            onSubmitEditing={() => this.focusNextField('two')}
            returnKeyType={"next"}
            ref={input => this.inputs['one'] = input}
            onChangeText={(text) => this.setState({ email: text })} />
        </View>

        <View style={styles.seperator}>
          {this.state.errorEmail.show && <Text style={styles.textError}> {this.state.errorEmail.text} </Text>}
        </View>

        <View style={[styles.inputRow, styles.inputRowMarginTop]}>
          <TextInput
            onBlur={() => this._onBlur(LoginScreen.LOGIN_PASSWORD)}
            onFocus={() => this._onFocus(LoginScreen.LOGIN_PASSWORD)}
            style={[styles.input, this.state.styleForPassword]}
            value={this.state.password}
            secureTextEntry={!this.state.showPassword}
            placeholderTextColor='#cfd0d1'
            placeholder={I18n.t('login.password')}
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({ password: text })}
            ref={input => this.inputs['two'] = input} />

          <Icon
            name={this.state.iconName}
            type='font-awesome'
            color='#cfd0d1'
            containerStyle={styles.showPassword}
            underlayColor='transparent'
            size={17}
            onPress={() => this._toggleShowPassWord()} />
        </View>

        <View style={styles.seperator} >
          {this.state.errorPassword.show && <Text style={styles.textError}> {this.state.errorPassword.text} </Text>}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={this._onPressLogin.bind(this)} style={[styles.button, styles.loginButton]} >
            <Text style={styles.buttonText}>{I18n.t('login.login')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginBottom}>
          <Text style={styles.textPress} onPress={() => { this.navigate('ResetPasswordScreen', {}) }}>
            {I18n.t('login.forgotText')}
          </Text>
          <View style={styles.textRow}>
            <Text style={styles.text}>
              {I18n.t('login.questionRegister')}
            </Text>
            <Text onPress={this._onPressRegister.bind(this)} style={[styles.textPress, styles.textUnderline]} >{I18n.t('login.register')}</Text>
          </View>
        </View>
        {this.state.errorMessage.show && (
          <View style={styles.boxError}>
            <Text>{this.state.errorMessage.text}</Text>
          </View>
        )}
        <View style={styles.rowFlexTwo} >
        </View>

      </KeyboardAwareScrollView>
    )
  }
}

const styles = ScaledSheet.create({
  ...LoginCommonStyle,
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
    marginTop: "14@s",
  },
  showPassword: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: "9@s"
  },
  logoStyle: {
    marginTop: "127@s",
    width: "180@s",
    height: "60@s"
  }
});