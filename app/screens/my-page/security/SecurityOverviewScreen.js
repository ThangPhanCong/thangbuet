import React from 'react';
import {
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  TextInput,
  ScrollView,
  WebView,
  Dimensions,
  StyleSheet
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import TouchableTextHighlight from '../../../utils/TouchableTextHighlight';
import Modal from 'react-native-modal';
import { Card } from 'react-native-elements';
import BaseScreen from '../../BaseScreen';
import rf from '../../../libs/RequestFactory';
import I18n from '../../../i18n/i18n';
import { map } from 'lodash';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../../libs/reactSizeMatter/scalingUtils';
import { Fonts } from '../../../utils/CommonStyles';
import UIUtils from "../../../utils/UIUtils";
// const DownArrowIcon = require('../../../../assets/common/caretdown.png');
const submitPhoneHtmlString =
  `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <form method="post" id="infoForm" action="https://dev.mobile-ok.com/popup/common/hscert.jsp">
      <input type="hidden" name="req_info" value="{0}">
      <input type="hidden" name="rtn_url" value="{1}">
      <input type="hidden" name="cpid" value="{2}"> 
    </form>
  </body>
  
  <script type="text/javascript">
    window.onload = function () {
      document.getElementById('infoForm').submit();
    }
  </script>
  </html>`;

export default class SecurityOverviewScreen extends BaseScreen {
  _infoProps = [{
    propValue: 'email',
    propVerify: 'email_verified',
    image: require('../../../../assets/common/email.png')
  }, {
    propVerify: 'otp_verified',
    image: require('../../../../assets/common/googleAuth.png')
  }, {
    propValue: 'phone_no',
    propVerify: 'phone_verified',
    image: require('../../../../assets/common/phoneAuth.png')
  }, {
    propValue: 'bank',
    propVerify: 'bank_account_verified',
    image: require('../../../../assets/common/accountVerify.png')
  }, {
    propVerify: '',
    image: require('../../../../assets/common/password.png')
  }];

  _otpParams = {};
  _bankParams = {};

  _banks = [];
  _passwordParams = {}

  _verifyPhoneResult = {}

  constructor(props) {
    super(props);

    this.state = {
      selectedBank: {},

      info: {},
      cancelOtpDialogVisible: false,
      initVerificationDialogVisible: false,
      registerPhoneDialogVisible: false,
      existedPhoneDialogVisible: false,
      bankAccountDialogVisible: false,
      changePasswordDialogVisible: false
    }
  }

  componentWillMount() {
    super.componentWillMount();
    this._getAvailableBanks();
  }

  componentDidMount() {
    super.componentDidMount()
    this._getCurrentUser();
  }

  render() {
    return (
      <View style={styles.listView}>
        <ScrollView
          style={{ flex: 1 }}
          ItemSeparatorComponent={this._renderSeparator}>
          {this._renderVerifyEmail()}
          {this._renderVerifyGoogle()}
          {this._renderVerifyPhone()}
          {this._renderVerifyBankAccount()}
          {this._renderVerifyPassword()}
        </ScrollView>
        {this._renderSubmitModal()}
        {this._renderInitVerificationModal()}
        {this._renderRegisterPhoneModal()}
        {this._renderBankAccountModal()}
        {this._renderChangePasswordModal()}
      </View>
    )
  }

  _renderVerifyEmail() {
    let item = this._infoProps[0];

    return (
      <View style={styles.listItem}>
        {this._renderIconView(item)}

        <View style={styles.valueGroup}>
          <Text style={styles.text}>
            {this.state.info[item.propVerify] ? this.state.info[item.propValue] : I18n.t('myPage.security.notAllowed')}
          </Text>
        </View>

        {this._renderVerifyButtonView(item, null)}
      </View>
    )
  }

  _renderVerifyGoogle() {
    let item = this._infoProps[1];

    return (
      <View style={styles.listItem}>
        {this._renderIconView(item)}

        <View style={styles.valueGroup}>
          {
            this.state.info[item.propVerify] ?
              <TouchableTextHighlight style={styles.cancelOtpButton}
                                      onPress={this._onCancelGoogleAuth.bind(this)}
                                      underlayColor='#FF3300'
                                      underlayTextColor='#FFF'
                                      normalTextColor='#FF3300'
                                      text={I18n.t('myPage.security.cancelOTP')}
                                      textStyle={styles.text}/> :
              <Text style={styles.text}>
                {I18n.t('myPage.security.notAllowed')}
              </Text>
          }

        </View>

        {this._renderVerifyButtonView(item, this._onVerifyGoogle.bind(this))}
      </View>
    )
  }

  _renderVerifyPhone() {
    let item = this._infoProps[2];

    return (
      <View style={styles.listItem}>
        {this._renderIconView(item)}

        <View style={styles.valueGroup}>
          <Text style={styles.text}>
            {this.state.info[item.propVerify] ? this.state.info[item.propValue] : I18n.t('myPage.security.notAllowed')}
          </Text>
        </View>

        {this._renderVerifyButtonView(item, this._onVerifyPhone.bind(this))}
      </View>
    )
  }

  _renderVerifyBankAccount() {
    let item = this._infoProps[3];

    return (
      <View style={styles.listItem}>
        {this._renderIconView(item)}

        <View style={styles.valueGroup}>
          <Text style={styles.text}>
            {this.state.info[item.propVerify] ? this.state.info[item.propValue] : I18n.t('myPage.security.notAllowed')}
          </Text>
        </View>

        {this._renderVerifyButtonView(item, this._onVerifyBankAccount.bind(this))}
      </View>
    )
  }

  _renderVerifyPassword() {
    let item = this._infoProps[4];

    return (
      <View style={styles.listItem}>
        {this._renderIconView(item)}

        <View style={styles.valueGroup}/>
        {this._renderVerifyButtonView(item, this._onVerifyPassword.bind(this), true)}
      </View>
    )
  }

  _renderIconView(item) {
    return (
      <View style={styles.iconGroup}>
        <View style={styles.iconContainer}>
          <Image
            style={styles.iconsInMain}
            resizeMode='contain'
            source={item.image}/>
        </View>
      </View>
    )
  }

  _renderVerifyButtonView(item, onPressHandler, password = false) {
    let indexItem = this._infoProps.indexOf(item);
    let disable = false;
    if (indexItem > 1 && indexItem < 4) {
      if (!this.state.info[this._infoProps[indexItem - 1].propVerify]
        || !this.state.info[this._infoProps[indexItem - 2].propVerify]
        || this.state.info[item.propVerify]) {
        disable = true
      }
    } else {
      console.log(this.state.info[item.propVerify])
      if (this.state.info[item.propVerify]) {
        disable = true
      }
    }
    return (
      <View style={styles.buttonGroup}>
        <TouchableHighlight
          style={this.state.info[item.propVerify] ? styles.activeButton : styles.inactiveButton}
          onPress={onPressHandler}
          disabled={disable}
          underlayColor='#595959'>
          <Text style={styles.buttonsInMain}>
            {this.state.info[item.propVerify] ? I18n.t('myPage.security.verified') :
              password ? I18n.t('myPage.security.unverified1') : I18n.t('myPage.security.unverified')
            }
          </Text>
        </TouchableHighlight>
      </View>
    )
  }

  _renderSubmitModal() {
    return (
      <Modal
        isVisible={this.state.cancelOtpDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackButtonPress={this._dismissSubmitModal.bind(this)}
        onBackdropPress={this._dismissSubmitModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={styles.containerCard}>
          <Text style={styles.cancelOtpHeader}>
            {I18n.t('myPage.security.cancelOtpHeader')}
          </Text>
          <View style={styles.crossBar}/>
          <Text
            style={styles.cancelOtpDesc}>
            {I18n.t('myPage.security.cancelOtpDesc')}
          </Text>
          <Text style={styles.otpVerificationNumber}>
            {I18n.t('myPage.security.otpVerificationNumber')}
          </Text>
          <TextInput
            style={styles.textInput}
            onChangeText={text => this._otpParams.otp = text}
            underlineColorAndroid='transparent'/>
          <Text style={styles.dialogRecoveryCode}>
            {I18n.t('myPage.security.dialogRecoveryCode')}
          </Text>
          <TextInput
            style={styles.textInput}
            onChangeText={text => this._otpParams.authentication_code = text}
            underlineColorAndroid='transparent'/>
          <TouchableOpacity
            style={styles.submitCancelOtpButton}
            onPress={this._onRemoveGoogleAuth.bind(this)}>
            <Text style={styles.cancelOtpSubmit}>
              {I18n.t('myPage.security.cancelOtpSubmit')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.initVerificationButton}
                            onPress={this._onShowInitVerificationDialog.bind(this)}>
            <Text style={styles.initOtpVerification2}>
              {I18n.t('myPage.security.initOtpVerification')}
            </Text>
          </TouchableOpacity>
        </Card>

      </Modal>
    )
  }

  // TODO: Refactor string localization
  _renderInitVerificationModal() {
    return (
      <Modal
        isVisible={this.state.initVerificationDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackButtonPress={this._dismissInitVerificationModal.bind(this)}
        onBackdropPress={this._dismissInitVerificationModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={styles.largerContainerCard}>
          <Text style={styles.initOtpVerification}>
            {I18n.t('myPage.security.initOtpVerification')}
          </Text>
          <View style={styles.crossBar}/>
          <View style={{ marginTop: scale(16), marginStart: scale(30), marginEnd: scale(30) }}>
            <Text style={styles.initOtpVerificationDescRecoveryCode}>
              {I18n.t('myPage.security.initOtpVerificationDesc.recoveryCode')}
              <Text style={{ color: 'black', }}>
                {I18n.t('myPage.security.initOtpVerificationDesc.body')}
              </Text>
            </Text>
            <Text style={styles.initOtpVerificationDescEmail}>
              {I18n.t('myPage.security.initOtpVerificationDesc.email')}
              <Text style={{ ...Fonts.NanumGothic_Bold }}>
                {I18n.t('myPage.security.initOtpVerificationDesc.emailAdress')}
              </Text>
            </Text>
          </View>
          <ScrollView
            style={styles.initVerificationScrollView}
            contentContainerStyle={{ padding: scale(10) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.initOtpVerificationInstructionBold}>
                {I18n.t('myPage.security.initOtpVerificationInstruction.emailSuject')}
              </Text>
              <Text style={styles.initOtpVerificationInstructionRegular}>
                {I18n.t('myPage.security.initOtpVerificationInstruction.contentEmailSuject')}
              </Text>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.initOtpVerificationInstructionBold}>
                {I18n.t('myPage.security.initOtpVerificationInstruction.emailBody')}
              </Text>
              <Text style={styles.initOtpVerificationInstructionRegular}>
                {I18n.t('myPage.security.initOtpVerificationInstruction.contentEmailBody')}
              </Text>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.initOtpVerificationInstructionBold}>
                {I18n.t('myPage.security.initOtpVerificationInstruction.attachment')}
              </Text>
              <Text style={styles.initOtpVerificationInstructionRegular}>
                {I18n.t('myPage.security.initOtpVerificationInstruction.contentAttachment')}
              </Text>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={[styles.submitCancelOtpButton, { marginTop: scale(20), marginBottom: scale(30) }]}
            onPress={this._dismissInitVerificationModal.bind(this)}>
            <Text style={{ fontSize: scale(13), color: '#FFF', ...Fonts.NanumGothic_Regular }}>
              {I18n.t('myPage.security.cancelOtpSubmit')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _renderRegisterPhoneModal() {
    return (
      <Modal
        isVisible={this.state.registerPhoneDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackButtonPress={this._dismissRegisterPhoneModal.bind(this)}
        onBackdropPress={this._dismissRegisterPhoneModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={styles.registerPhoneContainer}
          wrapperStyle={{ flex: 1 }}>
          <WebView
            source={{ html: submitPhoneHtmlString.format(this._verifyPhoneResult.sEncryptedData, this._verifyPhoneResult.postretUrl, this._verifyPhoneResult.postcpid) }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}/>
        </Card>
      </Modal>
    )
  }

  _renderExistedPhoneModal() {
    return (
      <Modal
        isVisible={this.state.existedPhoneDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackButtonPress={this._dismissExistedPhoneModal.bind(this)}
        onBackdropPress={this._dismissExistedPhoneModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={styles.containerCard}>
          <Text style={styles.cancelOtpHeader}>
            {I18n.t('myPage.security.existedPhoneHeader')}
          </Text>
          <TouchableOpacity
            style={styles.bankAccountSubmitButton}
            onPress={this._dismissExistedPhoneModal.bind(this)}>
            <Text style={styles.existedPhoneButtonText}>
              {I18n.t('myPage.security.existedPhoneButtonText')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _renderBankAccountModal() {
    return (
      <Modal
        isVisible={this.state.bankAccountDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackButtonPress={this._dismissBankAccountModal.bind(this)}
        onBackdropPress={this._dismissBankAccountModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={styles.containerCard}>
          <Text style={styles.initOtpVerification}>
            {I18n.t('myPage.security.bankAccountHeader')}
          </Text>
          <View style={styles.crossBar}/>
          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.bankAccountOwner')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
                     underlineColorAndroid='transparent'
                     onChangeText={text => this._bankParams.account_name = text}/>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.dateOfBirth')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
                     underlineColorAndroid='transparent'
                     onChangeText={text => this._bankParams.date_of_birth = text}/>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.bank')}
          </Text>

          <View style={styles.viewModalDropDown}>
            <TouchableOpacity
              style={styles.iconBankDropdown}
              onPress={() => this._bankDropdown.show()}>
              <Icon
                name='menu-down'
                color='#000'
                style={styles.iconMenuDown}
              />
            </TouchableOpacity>
            <ModalDropdown
              ref={ref => this._bankDropdown = ref}
              style={{ flex: 1.3 }}
              defaultValue=''
              dropdownStyle={[styles.modalBankDropDown, {
                height: this._calculateModalHeight()
              }]}
              textStyle={styles.textModal}
              dropdownTextStyle={styles.textModalDropDown}
              renderSeparator={() => <View style={{ height: 0 }}/>}
              options={map(this._banks, 'name')}
              onSelect={this._onBankPickerSelect.bind(this)}/>
          </View>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.bankAccountNumber')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
                     underlineColorAndroid='transparent'
                     onChangeText={text => this._bankParams.account_number = text}/>

          <TouchableOpacity
            style={styles.bankAccountSubmitButton}
            onPress={this._onSubmitBankAccount.bind(this)}>
            <Text style={styles.cancelOtpSubmit}>
              {I18n.t('myPage.security.bankAccountSubmitText')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  async _getAvailableBanks() {
    try {
      let res = await rf.getRequest('MasterdataRequest').getAll();
      this._banks = res.banks;
    }
    catch (err) {
      console.log('SecurityScreen._getAvailableBanks', err);
    }
  }

  _calculateModalHeight() {
    if (this._banks.length == 0)
      return scale(39);
    if (this._banks.length > 3)
      return scale(120);

    return this._banks.length * scale(39);
  }

  _renderBankItems() {
    return map(this._banks, (bank, index) => (
      <Option>
        {bank.name}
      </Option>
    ));
  }

  _renderChangePasswordModal() {
    return (
      <Modal
        isVisible={this.state.changePasswordDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackButtonPress={this._dismissChangePasswordModal.bind(this)}
        onBackdropPress={this._dismissChangePasswordModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={styles.largerContainerCard}>
          <Text style={styles.initOtpVerification}>
            {I18n.t('myPage.security.changePasswordHeader')}
          </Text>
          <View style={styles.crossBar}/>
          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.bankAccountOwner')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
                     underlineColorAndroid='transparent'
                     onChangeText={text => this._passwordParams.password = text}/>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.newPassword')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
                     underlineColorAndroid='transparent'
                     onChangeText={text => this._passwordParams.new_password = text}/>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.repeatPassword')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
                     underlineColorAndroid='transparent'
                     onChangeText={text => this._passwordParams.new_password_confirm = text}/>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.otpCode').toLocaleUpperCase()}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
                     underlineColorAndroid='transparent'
                     keyboardType='numeric'
                     onChangeText={text => this._passwordParams.otp = text}/>

          <TouchableOpacity
            style={styles.bankAccountSubmitButton}
            onPress={this._onSubmitChangePassword.bind(this)}>
            <Text style={styles.cancelOtpSubmit}>
              {I18n.t('myPage.security.changePasswordSubmit')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _onVerifyGoogle() {
    this.navigate('OTPGuideScreen', {
      addOtpVerificationHandler: this._addOtpVerificationHandler.bind(this)
    });
  }

  _onVerifyBankAccount() {
    this.setState({ bankAccountDialogVisible: true });
  }

  _onVerifyPhone() {
    this._loadPhoneVerificationCipher();
  }

  _onVerifyPassword() {
    this.setState({ changePasswordDialogVisible: true });
  }

  _onCancelGoogleAuth() {
    this.setState({ cancelOtpDialogVisible: true });
  }

  _onRemoveGoogleAuth() {
    this._removeGoogleAuth();
  }

  _onShowInitVerificationDialog() {
    this.setState({
      initVerificationDialogVisible: true
    })
  }

  _onSubmitBankAccount() {
    this._updateBankAccount();
  }

  _onBankPickerSelect(index) {
    let selectedBank = this._banks[index];

    this.setState({ selectedBank });
    this._bankParams.bank_id = selectedBank.code;
    this._bankParams.bank_name = selectedBank.name;
  }

  _onSubmitChangePassword() {
    this._changePassword();
  }

  _dismissSubmitModal() {
    this._otpParams = {};
    this.setState({ cancelOtpDialogVisible: false })
  }

  _dismissInitVerificationModal() {
    this.setState({ initVerificationDialogVisible: false })
  }

  _dismissRegisterPhoneModal() {
    this.setState({ registerPhoneDialogVisible: false })
    this._getCurrentUser(false);
  }

  _dismissExistedPhoneModal() {
    this.setState({ existedPhoneDialogVisible: false })
  }

  _dismissBankAccountModal() {
    this.state.selectedBank = {}
    this._bankParams = {}
    this.setState({ bankAccountDialogVisible: false })
  }

  _dismissChangePasswordModal() {
    this._passwordParams = {};
    this.setState({ changePasswordDialogVisible: false })
  }

  async _getCurrentUser(useCache = true) {
    try {
      let userRes = await rf.getRequest('UserRequest').getCurrentUser(useCache);
      let settingRes = await rf.getRequest('UserRequest').getSecuritySettings();
      let user = userRes.data;
      let settings = settingRes.data;
      let info = {};
      for (el of this._infoProps) {
        info[el.propValue] = user[el.propValue];
        info[el.propVerify] = settings[el.propVerify];
      }

      this.setState({ info })
    }
    catch (err) {
      console.log('SecurityOverviewScreen._getCurrentUser', err);
    }
  }

  async _removeGoogleAuth() {
    try {
      await rf.getRequest('UserRequest').delGoogleAuth(this._otpParams)
      this._otpParams = {};

      this.setState({
        initVerificationDialogVisible: false,
        cancelOtpDialogVisible: false,
        info: {
          ...this.state.info,
          [this._infoProps[1].propVerify]: false
        }
      })
    }
    catch (err) {
      console.log('SecurityOverviewScreen._removeGoogleAuth', err);
    }
  }

  async _updateBankAccount() {
    try {
      await rf.getRequest('UserRequest').verifyBankAccount(this._bankParams)
      this._bankParams = {};

      this.setState({
        bankAccountDialogVisible: false,
        info: {
          ...this.state.info,
          [this._infoProps[3].propVerify]: true,
          [this._infoProps[3].propValue]: bank
        }
      })
    }
    catch (err) {
      console.log('SecurityOverviewScreen._updateBankAccount', err);
    }
  }

  async _changePassword() {
    try {
      await rf.getRequest('UserRequest').changePassword(this._passwordParams);
      this._dismissChangePasswordModal();
    }
    catch (err) {
      console.log('SecurityOverviewScreen._changePassword', err);
    }
  }

  async _loadPhoneVerificationCipher() {
    try {
      let res = await rf.getRequest('UserRequest').getPhoneVerificationCipher();
      this._verifyPhoneResult = res.data;
      this.setState({ registerPhoneDialogVisible: true });
    }
    catch (err) {
      console.log('SecurityOverviewScreen._loadPhoneVerificationCipher', err);
    }
  }

  _addOtpVerificationHandler() {
    this.setState({
      info: {
        ...this.state.info,
        [this._infoProps[1].propVerify]: true
      }
    })
  }
}

const styles = ScaledSheet.create({
  listView: {
    flex: 1,
    backgroundColor: '#fff'
  },
  listItem: {
    height: '65@s',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '20@s',
    paddingRight: '20@s',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DEE3EB'
  },
  iconGroup: {
    flex: 4,
    justifyContent: 'center'
  },
  iconContainer: {
    flex: 1,
    marginEnd: '30@s',
    justifyContent: 'center',
    alignItems: 'center'
  },
  valueGroup: {
    flex: 11,
    justifyContent: 'center'
  },
  buttonGroup: {
    flex: 5,
    justifyContent: 'center'
  },
  text: {
    fontSize: '13@s',
    ...Fonts.NanumGothic_Regular
  },
  activeButton: {
    borderRadius: '5@s',
    height: '40@s',
    backgroundColor: '#0070C0',
    justifyContent: 'center'
  },
  inactiveButton: {
    borderRadius: '5@s',
    height: '40@s',
    backgroundColor: '#BFBFBF',
    justifyContent: 'center'
  },
  cancelOtpButton: {
    borderRadius: '5@s',
    height: '40@s',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: '1@s',
    borderColor: '#FF3300',
    paddingStart: '20@s',
    paddingRight: '20@s'
  },
  dialog: {
    backgroundColor: '#FFF'
  },
  textInput: {
    fontSize: '13@s',
    height: '40@s',
    borderRadius: '5@s',
    borderWidth: '1@s',
    borderColor: '#BFBFBF',
    marginStart: '30@s',
    marginEnd: '30@s',
    paddingLeft: '16@s',
    paddingRight: '16@s',
    ...Fonts.NanumGothic_Regular
  },
  submitCancelOtpButton: {
    marginTop: '30@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    height: '40@s',
    backgroundColor: '#0070C0',
    borderRadius: '5@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  initVerificationButton: {
    marginTop: '20@s',
    marginBottom: '30@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    height: '40@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  initVerificationScrollView: {
    marginTop: '8@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    height: '200@s',
    borderRadius: '5@s',
    borderWidth: '1@s',
    borderColor: '#D9D9D9'
  },
  bankAccountTitle: {
    fontSize: '13@s',
    marginTop: '16@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    ...Fonts.NanumGothic_Regular
  },
  bankAccountTextInput: {
    fontSize: '13@s',
    marginTop: '4@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    height: '40@s',
    borderColor: '#D9D9D9',
    borderRadius: '5@s',
    borderWidth: '1@s',
    paddingLeft: '16@s',
    paddingRight: '16@s',
    ...Fonts.NanumGothic_Regular
  },
  bankAccountPicker: {
    marginTop: '2@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    height: '40@s',
    borderColor: '#D9D9D9',
    borderRadius: '5@s',
    borderWidth: '1@s',
  },
  containerCard: {
    borderRadius: '5@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    padding: 0,
    ...UIUtils.generatePopupShadow()
  },
  largerContainerCard: {
    borderRadius: '5@s',
    marginStart: '5@s',
    marginEnd: '5@s',
    padding: 0,
    ...UIUtils.generateShadowStyle(5)
  },
  registerPhoneContainer: {
    borderColor: '#7F7F7F',
    borderWidth: '1@s',
    borderRadius: '5@s',
    padding: 0,
    marginStart: '10@s',
    marginEnd: '10@s',
    height: 0.8 * Dimensions.get('window').height,
    ...UIUtils.generatePopupShadow()
  },
  cancelOtpHeader: {
    fontSize: '13@s',
    marginTop: '16@s',
    marginBottom: '16@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    lineHeight: '22@s',
    ...Fonts.NanumGothic_Regular
  },
  otpVerificationNumber: {
    fontSize: '13@s',
    marginBottom: '3@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    ...Fonts.NanumGothic_Regular
  },
  initOtpVerification: {
    fontSize: '13@s',
    marginTop: '16@s',
    marginBottom: '16@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    ...Fonts.NanumGothic_Regular
  },
  initOtpVerificationDescRecoveryCode: {
    fontSize: '14@s',
    lineHeight: '22@s',
    color: 'blue',
    ...Fonts.NanumGothic_Regular
  },
  initOtpVerificationInstructionBold: {
    fontSize: '13@s',
    lineHeight: '22@s',
    ...Fonts.NanumGothic_Bold
  },
  initOtpVerificationDescEmail: {
    fontSize: '14@s',
    lineHeight: '22@s',
    ...Fonts.NanumGothic_Regular
  },
  initOtpVerificationInstructionRegular: {
    fontSize: '13@s',
    lineHeight: '22@s',
    ...Fonts.NanumGothic_Regular
  },
  crossBar: {
    height: '1@s',
    backgroundColor: '#EBEBEB'
  },
  cancelOtpDesc: {
    fontSize: '13@s',
    marginTop: '16@s',
    marginBottom: '3@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    lineHeight: '22@s',
    ...Fonts.NanumGothic_Regular
  },
  dialogRecoveryCode: {
    fontSize: '13@s',
    marginBottom: '3@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    ...Fonts.NanumGothic_Regular,
    marginTop: '16@s'
  },
  cancelOtpSubmit: {
    fontSize: '13@s',
    color: '#FFF',
    ...Fonts.NanumGothic_Regular
  },
  initOtpVerification2: {
    fontSize: '13@s',
    color: '#0070C0',
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
    textDecorationColor: '#0070C0',
    ...Fonts.NanumGothic_Bold
  },
  iconMenuDown: {
    fontSize: '28@s'
  },
  bankAccountSubmitButton: {
    marginTop: '20@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    height: '40@s',
    backgroundColor: '#0070C0',
    borderRadius: '5@s',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30@s'
  },
  modalBankDropDown: {
    position: 'absolute',
    right: '79@s',
    marginTop: '33@s',
    borderColor: '#D9D9D9',
    borderRadius: '3@s',
    borderWidth: '1@s',
    ...UIUtils.generatePopupShadow()
  },
  viewModalDropDown: {
    marginTop: '5@s',
    marginStart: '30@s',
    marginEnd: '30@s',
    height: '40@s',
    borderColor: '#D9D9D9',
    borderRadius: '5@s',
    borderWidth: '1@s'
  },
  textModalDropDown: {
    fontSize: '13@s',
    lineHeight: '22@s',
    color: '#000',
    textAlign: 'center',
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: '1@s',
    ...Fonts.NanumGothic_Regular,
  },
  textModal: {
    fontSize: '13@s',
    marginStart: '30@s',
    ...Fonts.NanumGothic_Regular,
  },
  existedPhoneButtonText:
    { fontSize: '13@s', color: '#FFF', marginStart: '20@s', marginEnd: '20@s' },
  buttonsInMain:
    { alignSelf: 'center', color: '#FFF', fontSize: '13@s', ...Fonts.NanumGothic_Regular },
  iconsInMain: {
    width: '90%',
    height: '90%'
  },
  iconBankDropdown: {
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '40@s',
    width: '40@s'
  }
});