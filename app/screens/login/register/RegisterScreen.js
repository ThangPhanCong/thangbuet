import React from 'react';
import {
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { Icon } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import rf from '../../../libs/RequestFactory';
import I18n from '../../../i18n/i18n';
import AppPreferences from '../../../utils/AppPreferences';
import Consts from '../../../utils/Consts';
import BaseScreen from '../../BaseScreen';
import { CheckBox } from 'react-native-elements';
import LoginCommonStyle from '../LoginCommonStyle';
import { resetGenericPassword } from 'react-native-keychain';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';
import { CommonColors } from '../../../utils/CommonStyles';

export default class RegisterScreen extends BaseScreen {
  static REGISTER_EMAIL = 'Password;'
  static REGISTER_PASSWORD = 'Email';
  static REGISTER_MERSSAGE = 'Message';
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: I18n.t('login.title.register'),
      headerStyle: {
        backgroundColor: CommonColors.screenBgColor,
        elevation: 0,
      },
      headerTintColor: '#cdcccd',
      headerTitleStyle: {
        color: CommonColors.headerTitleColor,
        flex: 0.8,
        textAlign: 'center',
        fontSize: 18 * PixelRatio.getFontScale(),
      },
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      referralID: '',
      termChecked: false,
      showModel: false,
      styleForEmail: '',
      styleForPassword: '',
      styleForReferralID: '',
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
    if (inputName == RegisterScreen.REGISTER_EMAIL) {
      this._setStateError(false, '', RegisterScreen.REGISTER_EMAIL);
      this.setState({ styleForEmail: styles.txtInputFocused })
    }
    else {
      if (inputName == RegisterScreen.REGISTER_PASSWORD) {
        this._setStateError(false, '', RegisterScreen.REGISTER_PASSWORD);
        this.setState({ styleForPassword: styles.txtInputFocused })
      }
      else {
        this.setState({ styleForReferralID: styles.txtInputFocused })
      }
    }
  }

  _onBlur(inputName) {
    switch (inputName) {
      case RegisterScreen.REGISTER_EMAIL:
        this.setState({ styleForEmail: styles.txtInputUnFocused });
      case RegisterScreen.REGISTER_PASSWORD:
        this.setState({ styleForPassword: styles.txtInputUnFocused })
      default:
        this.setState({ styleForReferralID: styles.txtInputUnFocused })
    }
  }

  _setStateError(isShowError, textError, type) {
    const error = {
      show: isShowError,
      text: textError
    };
    const errorObject = Object.create(error);
    let styleInput = isShowError ? styles.textInputError : styles.txtInputUnFocused;
    switch (type) {
      case RegisterScreen.REGISTER_EMAIL:
        this.setState({ errorEmail: errorObject, styleForEmail: styleInput });
        break;
      case RegisterScreen.REGISTER_PASSWORD:
        this.setState({ errorPassword: errorObject, styleForPassword: styleInput });
        break;
      default:
        this.setState({ errorMessage: errorObject });
    }
  }

  _showError(message) {
    this._setStateError(true, message, RegisterScreen.REGISTER_MERSSAGE);
    setTimeout(() => this._setStateError(false, '', RegisterScreen.REGISTER_MERSSAGE), 1000);
  }

  _checkEmail(email) {
    let reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return reg.test(email);
  }

  _checkPassword(password) {
    let reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return reg.test(password);
  }

  _focusNextField(id) {
    this.inputs[id].focus();
  }

  _toggleShowPassWord() {
    let iconName = this.state.showPassword ? 'eye-slash' : 'eye';
    this.setState({ showPassword: !this.state.showPassword, iconName: iconName });
  }

  async _onRegister() {
    let email = this.state.email;
    let password = this.state.password;
    let referralId = this.state.referralID;
    let readtTerm = this.state.termChecked;
    let isEmail = this._checkEmail(email);
    let passwordValid = this._checkPassword(password);

    if ((email != '') && isEmail && (password != '') && readtTerm && passwordValid) {
      try {
        let registerResponse = await rf.getRequest('UserRequest').register(email, password, referralId)
        if (registerResponse.success) {
          this.setState({ showModel: true })
        }
      } catch (error) {
        if (error.errors.referrer_code)
          this._showError(I18n.t('login.errorMessage.errorReferralCode'))
        else
          this._showError(I18n.t('login.errorMessage.errorRegister'));
      }
    }
    else {
      if (email === '') {
        this._setStateError(true, I18n.t('login.errorMessage.errorValidateEmpty'), RegisterScreen.REGISTER_EMAIL);
      }
      else {
        if (password === '') {
          this._setStateError(true, I18n.t('login.errorMessage.errorValidateEmpty'), RegisterScreen.REGISTER_PASSWORD);
        }
        else {
          if (!isEmail) {
            this._setStateError(true, I18n.t('login.errorMessage.errorEmailValidate'), RegisterScreen.REGISTER_EMAIL);
          }
          else {
            if (!passwordValid)
              this._showError(I18n.t('login.errorMessage.errorPasswordInvalid'))
            else {
              this._showError(I18n.t('login.errorMessage.errorUnReadTerm'))
            }
          }
        }
      }
    }
  }

  _termSelected() {
    this.navigate('TermsOfUseScreen', {})
  }

  _goBackLogin() {
    this.navigate('LoginScreen', {});
  }

  getInitialState() {
    return {
      styleForEmail: styles.txtInputUnFocused,
      styleForPassword: styles.txtInputUnFocused
    }
  }

  renderModel() {
    if (this.state.showModel) {
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => this.setState({ showModel: false })}>
          <TouchableOpacity
            onPress={() => {
              this.setState({ showModel: false })
              this.navigate('LoginScreen', {})
            }}
            style={styles.modelContainer}>
            <View style={styles.modelContent}>
              <Text style={styles.modaltext}> {I18n.t('login.registerForm.registerSuccessMessage')}</Text>
            </View>
          </TouchableOpacity>
        </Modal>
      )
    }
    return (<View></View>);
  }
  render() {
    return (
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutoAutomaticScrol={(Platform.OS === 'ios')}
        style={styles.scrollView}
        contentContainerStyle={styles.screen}
        extraHeight={PixelRatio.getPixelSizeForLayoutSize(125)}>

        <View style={styles.rowFlexOne} >
          {this.renderModel()}
        </View>

        <Image
          resizeMode={'contain'}
          style={styles.logoStyle}
          source={require('../../../../assets/common/logoLogin.png')}
        />

        <View style={styles.rowFlexOne} />

        <Text style={styles.inputTitle}>{I18n.t('login.email')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={this.state.email}
            keyboardType='email-address'
            blurOnSubmit={false}
            underlineColorAndroid='transparent'
            autoCapitalize='none'
            onBlur={() => this._onBlur(RegisterScreen.REGISTER_EMAIL)}
            onFocus={() => this._onFocus(RegisterScreen.REGISTER_EMAIL)}
            style={[styles.input, this.state.styleForEmail]}
            onSubmitEditing={() => this.focusNextField('two')}
            ref={input => this.inputs['one'] = input}
            returnKeyType={"next"}
            onChangeText={(text) => this.setState({ email: text })} />
        </View>
        <View style={styles.seperator}>
          {this.state.errorEmail.show && <Text style={styles.textError}> {this.state.errorEmail.text} </Text>}
        </View>

        <Text style={styles.inputTitle}>{I18n.t('login.password')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            onBlur={() => this._onBlur(RegisterScreen.REGISTER_PASSWORD)}
            onFocus={() => this._onFocus(RegisterScreen.REGISTER_PASSWORD)}
            style={[styles.input, this.state.styleForPassword]}
            value={this.state.password}
            secureTextEntry={!this.state.showPassword}
            placeholderTextColor='white'
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({ password: text })}
            onSubmitEditing={() => this.focusNextField('three')}
            returnKeyType={"next"}
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
        <View style={styles.seperator}>
          {this.state.errorPassword.show && <Text style={styles.textError}> {this.state.errorPassword.text} </Text>}
        </View>

        <Text style={styles.inputTitle}>{I18n.t('login.registerForm.referralID')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={this.state.referralID}
            maxLength={8}
            underlineColorAndroid='transparent'
            onBlur={() => this._onBlur('ReferralID')}
            onFocus={() => this._onFocus('ReferralID')}
            style={[styles.input, this.state.styleForReferralID]}
            keyboardType='numeric'
            ref={input => this.inputs['three'] = input}
            onChangeText={(text) => this.setState({ referralID: text })} />
        </View>
        <View style={styles.seperatorSmall} />

        <View style={styles.rowTerms}>

          <CheckBox
            title={I18n.t('login.registerForm.textAcceptterm')}
            checked={this.state.termChecked}
            checkedColor='#1aa4fa'
            size={17}
            onPress={() => this.setState({ termChecked: !this.state.termChecked })}
            containerStyle={styles.checkboxTerm}
            textStyle={styles.txtSmall}
            component={TouchableWithoutFeedback}
          />
          <Text style={styles.textPress} onPress={() => { this._termSelected() }}>
            {I18n.t('login.registerForm.term')}
          </Text>
        </View>
        <View style={styles.seperator} />

        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={this._onRegister.bind(this)}>
            <Text style={styles.buttonText}>{I18n.t('login.register')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewBottom}>
          <Text style={styles.text}>
            {I18n.t('login.registerForm.questionHaveAccount')}
          </Text>
          <Text style={styles.textPress} onPress={() => { this._goBackLogin() }}>{I18n.t('login.login')}</Text>
        </View>
        {this.state.errorMessage.show && (
          <View style={styles.boxError}>
            <Text>{this.state.errorMessage.text}</Text>
          </View>
        )}
        <View style={styles.rowFlexOne} >
        </View>
      </KeyboardAwareScrollView>
    )
  }
}
const {height, width} = Dimensions.get('window');
const styles = ScaledSheet.create({
  ...LoginCommonStyle,
  txtSmall: {
    fontSize: "15@s",
    color: 'white',
    marginRight: "4@s",
    fontWeight: 'normal'
  },
  seperatorSmall: {
    alignSelf: 'stretch',
    marginTop: "5@s",
    marginBottom: "8@s",
  },
  viewBottom: {
    paddingTop: "4@s",
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    paddingBottom: "7@s",
  },
  rowTerms: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    height: "17@s",
  },
  checkbox: {
    backgroundColor: 'red',
    height: 12, width: 12,

  },
  modelContainer: {
    flex: 1,
    backgroundColor: CommonColors.screenBgColor,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  modelContent: {
    backgroundColor: '#1aa4fa',
    borderWidth: 1,
    borderBottomColor: '#1c202c',
    width: width * 0.75,
    marginHorizontal: "20@s",
    height: width / 4,
    marginTop: height /4,
    paddingHorizontal: "5@s",
    alignItems: 'center',
    justifyContent: 'center'
  },
  modaltext: {
    fontSize: "15@s",
    color: 'white',
  },
  checkboxTerm: {
    backgroundColor: 'transparent',
    borderWidth: "0@s",
    paddingHorizontal: "0@s",
    marginRight: "0@s",
  },
  titleStyle: {
    color: 'white',
    flex: 1,
    textAlign: 'center',
    fontWeight: '200',
    fontSize: "16.5@s",
  },
  showPassword: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: "9@s"
  },
  logoStyle: {
    marginTop: "20@s",
    width: "180@s",
    height: "60@s"
  }
});