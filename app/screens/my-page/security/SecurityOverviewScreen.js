import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  TextInput,
  ScrollView,
  WebView,
  Dimensions
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import TouchableTextHighlight from '../../../utils/TouchableTextHighlight';
import Modal from 'react-native-modal';
import { Card } from 'react-native-elements';
import BaseScreen from '../../BaseScreen';
import rf from '../../../libs/RequestFactory';
import I18n from '../../../i18n/i18n';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// const DownArrowIcon = require('../../../../assets/common/caretdown.png');

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
  
  _banks = [{id: 1, name: 'ABC'}, {id: 2, name: 'DEF'}];
  _passwordParams = {}

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

  componentWillMount(){
    super.componentWillMount()
    this._getCurrentUser();
  }

  render() {
    return(
      <View style={styles.listView}>
        <ScrollView
          style={{flex: 1}}
          ItemSeparatorComponent={this._renderSeparator}>
          {this._renderVerifyEmail()}
          <View style={styles.separator}/>
          {this._renderVerifyGoogle()}
          <View style={styles.separator}/>
          {this._renderVerifyPhone()}
          <View style={styles.separator}/>
          {this._renderVerifyBankAccount()}
          <View style={styles.separator}/>
          {this._renderVerifyPassword()}
        </ScrollView>
        {this._renderSubmitModal()}
        {this._renderInitVerificationModal()}
        {this._renderRegisterPhoneModal()}
        {this._renderExistedPhoneModal()}
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

        {this._renderVerifyButtonView(item, this._onVerifyPassword.bind(this))}
      </View>
    )
  }

  _renderIconView(item) {
    return (
      <View style={styles.iconGroup}>
        <View style={styles.iconContainer}>
          <Image 
            resizeMode = 'contain'
            source={item.image}/>
        </View>
      </View>
    )
  }

  _renderVerifyButtonView(item, onPressHandler) {
    return (
      <View style={styles.buttonGroup}>
        <TouchableHighlight 
          style={this.state.info[item.propVerify] ? styles.activeButton : styles.inactiveButton}
          onPress={onPressHandler}
          disabled={this.state.info[item.propVerify] > 0}
          underlayColor='#595959'>
          <Text style = {{ alignSelf: 'center', color: '#FFF' }}>
            {this.state.info[item.propVerify] ? I18n.t('myPage.security.verified') : I18n.t('myPage.security.unverified') }
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
        onBackdropPress={this._dismissSubmitModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={{borderRadius: 5, padding: 0, marginStart: 30, marginEnd: 30}}>
          <Text style={{fontSize: 13, marginTop: 16, marginBottom: 16, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.cancelOtpHeader')}
          </Text>
          <View style={{height: 1, backgroundColor: '#EBEBEB'}}/>
          <Text style={{fontSize: 13, marginTop: 16, marginBottom: 3, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.cancelOtpDesc')}
          </Text>
          <Text style={{fontSize: 13, marginBottom: 3, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.otpVerificationNumber')}
          </Text>
          <TextInput
            style={styles.textInput}
            onChangeText={text => this._otpParams.otp = text}
            underlineColorAndroid='transparent' />
          <Text style={{fontSize: 13, marginTop: 10, marginBottom: 3, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.dialogRecoveryCode')}
          </Text>
          <TextInput
            style={styles.textInput}
            onChangeText={text => this._otpParams.recovery_code = text}
            underlineColorAndroid='transparent' />
          <TouchableOpacity
            style={styles.submitCancelOtpButton}
            onPress={this._onRemoveGoogleAuth.bind(this)}>
            <Text style={{fontSize: 13, color: '#FFF'}}>
              {I18n.t('myPage.security.cancelOtpSubmit')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.initVerificationButton}
            onPress={this._onShowInitVerificationDialog.bind(this)}>
            <Text style={{fontSize: 13, color: '#0070C0', textDecorationStyle: 'solid', textDecorationLine: 'underline', textDecorationColor: '#0070C0'}}>
              {I18n.t('myPage.security.initOtpVerification')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _renderInitVerificationModal() {
    return (
      <Modal
        isVisible={this.state.initVerificationDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackdropPress={this._dismissInitVerificationModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={{borderRadius: 5, padding: 0, marginStart: 30, marginEnd: 30}}>
          <Text style={{fontSize: 13, marginTop: 16, marginBottom: 16, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.initOtpVerification')}
          </Text>
          <View style={{height: 1, backgroundColor: '#EBEBEB'}}/>
          <Text style={{fontSize: 13, marginTop: 16, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.initOtpVerificationDesc')}
          </Text>
          <ScrollView
            style={{marginTop: 8, marginStart: 16, marginEnd: 16, height: 200, borderRadius: 5, borderWidth: 1, borderColor: '#D9D9D9'}}
            contentContainerStyle={{padding: 10}}>
            <Text style={{fontSize: 13}}>
              {I18n.t('myPage.security.initOtpVerificationInstruction')}
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={[styles.submitCancelOtpButton, { marginTop: 20, marginBottom: 30 }]}
            onPress={this._onRemoveGoogleAuth.bind(this)}>
            <Text style={{fontSize: 13, color: '#FFF'}}>
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
        onBackdropPress={this._dismissRegisterPhoneModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={{borderRadius: 5, padding: 0, marginStart: 10, marginEnd: 10, height: 0.8 * Dimensions.get('window').height}}
          wrapperStyle={{flex: 1}}>
            <WebView
              source={{uri: 'https://www.google.com'}}
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
        onBackdropPress={this._dismissExistedPhoneModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={{borderRadius: 5, padding: 0, marginStart: 30, marginEnd: 30}}>
          <Text style={{fontSize: 13, marginTop: 16, marginBottom: 16, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.existedPhoneHeader')}
          </Text>
          <TouchableOpacity
            style={[styles.submitCancelOtpButton, { marginTop: 20, marginBottom: 30 }]}
            onPress={this._dismissExistedPhoneModal.bind(this)}>
            <Text style={{fontSize: 13, color: '#FFF', marginStart: 20, marginEnd: 20}}>
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
        onBackdropPress={this._dismissBankAccountModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={{borderRadius: 5, padding: 0, marginStart: 30, marginEnd: 30}}>
          <Text style={{fontSize: 13, marginTop: 16, marginBottom: 16, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.bankAccountHeader')}
          </Text>
          <View style={{height: 1, backgroundColor: '#EBEBEB'}}/>
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

          <View style={styles.bankAccountTextInput}>
            <View style={{ position: 'absolute', right: 0, justifyContent: 'center', flex: 1, height: '100%'}}>
              <Icon
                name='menu-down'
                size={22}
                color= '#000'/>
            </View>
            <ModalDropdown
              style={{flex: 1, justifyContent: 'center'}}
              defaultValue=''
              dropdownStyle={{
                position: 'absolute',
                marginTop: 20,
                left: 0,
                right: 65,
                height: 120
              }}
              renderSeparator={() => <View style={{height: 0}}/>}
              options={_.map(this._banks, 'name')}
              onSelect={this._onBankPickerSelect.bind(this)}/>
          </View>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.bankAccountNumber')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
            underlineColorAndroid='transparent'
            onChangeText={text => this._bankParams.account_number = text}/>
          
          <TouchableOpacity
            style={[styles.submitCancelOtpButton, { marginTop: 20, marginBottom: 30 }]}
            onPress={this._onSubmitBankAccount.bind(this)}>
            <Text style={{fontSize: 13, color: '#FFF'}}>
              {I18n.t('myPage.security.bankAccountSubmitText')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _renderBankItems() {
    return _.map(this._banks, (bank, index) => (
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
        onBackdropPress={this._dismissChangePasswordModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={{borderRadius: 5, padding: 0, marginStart: 30, marginEnd: 30}}>
          <Text style={{fontSize: 13, marginTop: 16, marginBottom: 16, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.changePasswordHeader')}
          </Text>
          <View style={{height: 1, backgroundColor: '#EBEBEB'}}/>
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
            onChangeText={text => this._passwordParams.otp = text}/>
          
          <TouchableOpacity
            style={[styles.submitCancelOtpButton, { marginTop: 20, marginBottom: 30 }]}
            onPress={this._onSubmitBankAccount.bind(this)}>
            <Text style={{fontSize: 13, color: '#FFF'}}>
              {I18n.t('myPage.security.changePasswordSubmit')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _onVerifyGoogle() {
    this.navigate('OTPGuideScreen');
  }

  _onVerifyBankAccount() {
    this.setState({bankAccountDialogVisible: true});
  }

  _onVerifyPhone() {
    this.setState({registerPhoneDialogVisible: true});
  }

  _onVerifyPassword() {
    this.setState({changePasswordDialogVisible: true});
  }

  _onCancelGoogleAuth() {
    this.setState({cancelOtpDialogVisible: true});
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

    this.setState({selectedBank});
    this._bankParams.bank_id = selectedBank.id;
    this._bankParams.bank_name = selectedBank.name;
  }

  _dismissSubmitModal() {
    this._otpParams = {};
    this.setState({cancelOtpDialogVisible: false})
  }

  _dismissInitVerificationModal() {
    this.setState({initVerificationDialogVisible: false})
  }

  _dismissRegisterPhoneModal() {
    this.setState({registerPhoneDialogVisible: false})
    this._getCurrentUser(false);
  }

  _dismissExistedPhoneModal() {
    this.setState({existedPhoneDialogVisible: false})
  }

  _dismissBankAccountModal() {
    this.state.selectedBank = {}
    this._bankParams = {}
    this.setState({bankAccountDialogVisible: false})
  }

  _dismissChangePasswordModal() {
    this._passwordParams = {};
    this.setState({changePasswordDialogVisible: false})
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
    catch(err) {
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
    catch(err) {
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
    catch(err) {
      console.log('SecurityOverviewScreen._updateBankAccount', err);
    }
  }

  async _changePassword() {
    try {
      await rf.getRequest('UserRequest').changePassword(this._passwordParams);
      this._dismissChangePasswordModal();
    }
    catch(err) {
      console.log('SecurityOverviewScreen._changePassword', err);
    }
  }
}

const styles = StyleSheet.create({
  listView: {
    flex: 1,
  },
  listItem: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#DEE3EB',
    opacity: 0.3
  },
  iconGroup: {
    flex: 4,
    justifyContent: 'center'
  },
  iconContainer: {
    flex: 1,
    marginEnd: 30,
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
    fontSize: 14,
  },
  activeButton: {
    borderRadius: 5,
    height: 40,
    backgroundColor: '#0070C0',
    justifyContent: 'center'
  },
  inactiveButton: {
    borderRadius: 5,
    height: 40,
    backgroundColor: '#BFBFBF',
    justifyContent: 'center'
  },
  cancelOtpButton: {
    borderRadius: 5,
    height: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3300',
    marginEnd: 30
  },
  dialog: {
    marginStart: 40,
    marginEnd: 40,
    backgroundColor: '#FFF'
  },
  textInput: {
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#BFBFBF',
    marginStart: 16,
    marginEnd: 16
  },
  submitCancelOtpButton: {
    marginTop: 30,
    marginStart: 16,
    marginEnd: 16,
    height: 40,
    backgroundColor: '#0070C0',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  initVerificationButton: {
    marginTop: 20,
    marginBottom: 30,
    marginStart: 16,
    marginEnd: 16,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bankAccountTitle: {
    fontSize: 13,
    marginTop: 16,
    marginStart: 16,
    marginEnd: 16
  },
  bankAccountTextInput: {
    marginTop: 2,
    marginStart: 16,
    marginEnd: 16,
    height: 40,
    borderColor: '#D9D9D9',
    borderRadius: 5,
    borderWidth: 1
  },
  bankAccountPicker: {
    marginTop: 2,
    marginStart: 16,
    marginEnd: 16,
    height: 40,
    borderColor: '#D9D9D9',
    borderRadius: 5,
    borderWidth: 1,
  }
});