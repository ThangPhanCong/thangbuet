import React from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import rf from '../../libs/RequestFactory';
import I18n from '../../i18n/i18n';
import AppPreferences from '../../utils/AppPreferences';
import Consts from '../../utils/Consts';
import BaseScreen from '../BaseScreen';
import LoginCommonStyle from './LoginCommonStyle'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { CommonColors } from '../../utils/CommonStyles';

const AUTH = "Auth";

export default class AuthenticationScreen extends BaseScreen {
  static MESSAGE = 'Message';
  static navigationOptions = () => ({
    title: '2FA',
    headerStyle: {
      backgroundColor: CommonColors.screenBgColor,
    },
    headerTintColor: '#cdcccd',
    headerTitleStyle: {
      flex: 0.8,
      textAlign: 'center',
      color: CommonColors.headerTitleColor,
      fontWeight: '200',
      fontSize: 16.5 * PixelRatio.getFontScale(),
    }
  })

  constructor(props) {
    super(props);
    this.state = {
      auth_code: '',
      styleForInput: '',
      errorAuth: {
        show: false,
        text: ''
      },
      errorMessage: {
        show: false,
        text: ''
      }
    };
  }

  _onFocus() {
    this._setStateError(false, '');
    this.setState({ styleForInput: styles.txtInputFocused })
  }

  _onBlur() {
    this.setState({ styleForInput: styles.txtInputUnFocused })
  }

  _setStateError(isShowError, textError, type) {
    const error = {
      show: isShowError,
      text: textError
    };
    const errorObject = Object.create(error);
    let styleInput = isShowError ? styles.textInputError : styles.txtInputUnFocused;
    if (type == AUTH)
      this.setState({ errorAuth: errorObject, styleForInput: styleInput });
    else
      this.setState({ errorMessage: errorObject });
  }

  _showError(message) {
    this._setStateError(true, message, AuthenticationScreen.MESSAGE);
    setTimeout(() => this._setStateError(false, '', AuthenticationScreen.MESSAGE), 2000);
  }


  async _onPressReset() {
    const { navigation } = this.props;
    const { params } = navigation.state;
    const email = navigation.getParam('email', '');
    const password = navigation.getParam('password', '');
    const auth_code = this.state.auth_code;

    if (params.isSecurityScreen) {
      let responseCheckOtp = await rf.getRequest('UserRequest').getSecuritySettings();

      if (responseCheckOtp.data.otp_verified == 0) {
        Alert.alert('OTP:', I18n.t('account.keyGoogle.turnOff'));
        this.props.navigation.goBack();
      }
      let responseVerify = await rf.getRequest('UserRequest').verifyGoogleAuthentication({
        otp: auth_code,
        authentication_code: auth_code
      });

      if (responseVerify.errors) {
        this._showError(responseVerify.message);
      } else {
        this.navigate('SecurityScreen', { isRemovedOtp: true });
      }
    } else {
      if (auth_code === '') {
        this._setStateError(true, I18n.t('login.errorMessage.errorValidateEmpty'));
      }
      else {
        try {
          let res = await rf.getRequest('UserRequest').login(email, password, auth_code);
          if (res.access_token) {
            AppPreferences.saveAccessToken(res.access_token);
            window.GlobalSocket.connect();
            this.navigate('MainScreen', {});
          }
        }
        catch (error) {
          if (error.error) {
            this._showError(I18n.t('login.errorMessage.errorGoogleAuthenFail'));
          }
          else {
            this._showError(I18n.t('common.message.network_error'));
          }
        }
      }
    }
  }

  getInitialState() {
    return { style: styles.txtInputUnFocused, style1: styles.txtInputUnFocused }
  }

  render() {
    return (
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.screen}
        extraHeight={PixelRatio.getPixelSizeForLayoutSize(125)}>

        <View style={styles.rowFlexOne} />

        <Text style={styles.inputTitle}>{I18n.t('login.resetPasswordForm.authenticationCode')}</Text>

        <View style={styles.inputRow}>
          <TextInput
            value={this.state.email}
            keyboardType='numeric'
            maxLength={6}
            placeholderTextColor='white'
            underlineColorAndroid='transparent'
            autoCapitalize='none'
            onBlur={() => this._onBlur()}
            onFocus={() => this._onFocus()}
            style={[styles.input, this.state.styleForInput]}
            onChangeText={(text) => this.setState({ auth_code: text })} />
        </View>
        {this.state.errorMessage.show && (
          <View style={styles.boxError}>
            <Text>{this.state.errorMessage.text}</Text>
          </View>
        )}
        <View style={styles.seperator}>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={this._onPressReset.bind(this)} style={[styles.button, styles.loginButton]}>
            <Text style={styles.buttonText}>{I18n.t('login.resetPasswordForm.resetPassword')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rowFlexSix} />

      </KeyboardAwareScrollView>
    )
  }
}

const styles = ScaledSheet.create({
  ...LoginCommonStyle,
  rowFlexSix: {
    flex: 6
  }
});