import React from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button,
  Dimensions,
  Modal,
  ActivityIndicator
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

export default class ResetPasswordScreen extends BaseScreen {
  static EMAIL = 'email';
  static MESSAGE = 'message';
  static navigationOptions = () => ({
    title: I18n.t('login.title.ressetPassword'),
    headerStyle: {
      backgroundColor: CommonColors.screenBgColor,
      elevation: 0,
    },
    headerTintColor: '#cdcccd',
    headerTitleStyle: {
      flex: 0.8,
      textAlign: 'center',
      color: '#cdcccd',
      fontWeight: 'bold',
      fontSize: 16.5 * PixelRatio.getFontScale(),
    },
  })

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      styleForEmail: '',
      showAlert: false,
      loading: false,
      errorEmail: {
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
    this._setStateError(false, '', ResetPasswordScreen.EMAIL);
    this.setState({ styleForEmail: styles.txtInputFocused })
  }
  _onBlur() {
    this.setState({ styleForEmail: styles.txtInputUnFocused })
  }

  _checkEmail(email) {
    let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return reg.test(email);
  }

  _showError(message) {
    this._setStateError(true, message, ResetPasswordScreen.MESSAGE);
    setTimeout(() => this._setStateError(false, '', ResetPasswordScreen.MESSAGE), 1000);
  }

  _setStateError(isShowError, textError, type) {
    const error = {
      show: isShowError,
      text: textError
    };
    const errorObject = Object.create(error);
    let styleInput = isShowError ? styles.textInputError : styles.txtInputUnFocused;
    switch (type) {
      case ResetPasswordScreen.EMAIL:
        this.setState({ errorEmail: errorObject, styleForEmail: styleInput });
        break;
      default:
        this.setState({ errorMessage: errorObject });
    }
  }

  async _onPressResetPassword() {
    let email = this.state.email;
    let isEmail = this._checkEmail(email);
    if (isEmail && email != '') {
      try {
        this.setState({ loading: true });
        let resResetPassword = await rf.getRequest('UserRequest').ressetPassword(email);
        if (resResetPassword.success)
          this.setState({ showAlert: true, loading: false });
      }
      catch (err) {
        this.setState({ loading: false });
        if (err.success == undefined) {
          this._showError(I18n.t('common.message.network_error'));
        }
        else {
          this._showError(I18n.t('login.errorMessage.errorAuthentication'));
        }
      }
    }
    else {
      if (email === '')
        this._setStateError(true, I18n.t('login.errorMessage.errorValidateEmpty'), ResetPasswordScreen.EMAIL);
      else
        this._setStateError(true, I18n.t('login.errorMessage.errorEmailValidate'), ResetPasswordScreen.EMAIL);
    }
  }

  getInitialState() {
    return { styleForEmail: styles.txtInputUnFocused };
  }

  _renderAlert() {
    return (
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.screen}
        extraHeight={PixelRatio.getPixelSizeForLayoutSize(125)}>

        <View style={styles.rowFlexOne}></View>

        <View style={styles.alert}>
          <Text style={styles.textAlert}>
            {I18n.t('login.resetPasswordForm.resetSuccessMessage')}
          </Text>
        </View>

        <View style={styles.rowFlexTwo}></View>

      </KeyboardAwareScrollView>
    )
  }
  _renderViewRessetPassword() {
    return (
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.screen}
        extraHeight={PixelRatio.getPixelSizeForLayoutSize(125)}>

        <View style={styles.rowFlexTwo} />

        <Text style={styles.inputTitle}>Email</Text>

        <View style={styles.inputRow}  pointerEvents={this.state.loading ? 'none' : 'auto'}>
          <TextInput
            value={this.state.email}
            keyboardType='email-address'
            underlineColorAndroid='transparent'
            autoCapitalize='none'
            onBlur={() => this._onBlur()}
            onFocus={() => this._onFocus()}
            style={[styles.input, this.state.styleForEmail]}
            onChangeText={(text) => this.setState({ email: text })} />
        </View>

        <View style={styles.seperatorLarge}>
          {this.state.errorEmail.show && <Text style={styles.textError}> {this.state.errorEmail.text} </Text>}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={this._onPressResetPassword.bind(this)}
            style={[styles.button, styles.loginButton]}>
            <Text style={styles.buttonText}>
              {I18n.t('login.resetPasswordForm.resetPassword')}
            </Text>
          </TouchableOpacity>
        </View>

        {this.state.loading &&
          <View style={styles.loading}>
            <ActivityIndicator size='large' />
          </View>
        }

        {this.state.errorMessage.show && (
          <View style={styles.boxError}>
            <Text>{this.state.errorMessage.text}</Text>
          </View>
        )}

        <View style={styles.areaBottom}>
        </View>

      </KeyboardAwareScrollView>
    )
  }
  render() {
    if (!this.state.showAlert) {
      return (
        this._renderViewRessetPassword()
      )
    }
    else {
      return (
        this._renderAlert()
      )
    }
  }
}
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const styles = ScaledSheet.create({
  ...LoginCommonStyle,
  alert: {
    borderRadius: 5,
    borderWidth: 1,
    padding: PixelRatio.getPixelSizeForLayoutSize(6),
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  textAlert: {
    fontSize: "15@ms",
    color: 'white'
  },
  areaBottom: {
    flex: 5,
  },
  seperatorLarge: {
    alignSelf: 'stretch',
    marginBottom: "45@s",
    paddingTop: "3@s",
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: height * 0.25,
    alignItems: 'center',
    justifyContent: 'center',
  }
});