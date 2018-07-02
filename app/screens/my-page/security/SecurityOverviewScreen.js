import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import { Picker } from 'native-base';
import Modal from 'react-native-modal';
import { Card } from 'react-native-elements';
import BaseScreen from '../../BaseScreen';
import rf from '../../../libs/RequestFactory';
import I18n from '../../../i18n/i18n';
import _ from 'lodash';

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

  _otp = {};
  _bank = {};
  _banks = ['1', '2', '3', '3', '3', '3', '3' , '3' , '3', '3', '3'];
  _password = {}

  constructor(props) {
    super(props);

    this.state = {
      info: {},
      cancelOtpDialogVisible: false,
      initVerificationDialogVisible: false,
      existedPhoneDialogVisible: false,
      bankAccountDialogVisible: false,
      changePasswordDialogVisible: false,

      cancelOtpButtonPressed: false,
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
            <TouchableHighlight style={styles.cancelOTPButton}
              onPress={this._onCancelGoogleAuth.bind(this)}
              onPressIn={this._onPressInCancelOtpButton.bind(this)}
              onPressOut={this._onPressOutCancelOtpButton.bind(this)}
              underlayColor='#FF3300'>
              <Text style={[styles.text, this.state.cancelOtpButtonPressed ? {color: '#FFF'} : {color: '#FF3300'}]}>
                {I18n.t('myPage.security.cancelOTP')}
              </Text>
            </TouchableHighlight> :
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
            onChangeText={text => this._otp.otpCode = text}
            underlineColorAndroid='transparent' />
          <Text style={{fontSize: 13, marginTop: 10, marginBottom: 3, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.security.dialogRecoveryCode')}
          </Text>
          <TextInput
            style={styles.textInput}
            onChangeText={text => this._otp.recoveryCode = text}
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
            onChangeText={text => this._bank.account_name = text}/>
          
          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.dateOfBirth')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
            underlineColorAndroid='transparent'
            onChangeText={text => this._bank.date_of_birth = text}/>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.bank')}
          </Text>
          <Picker
            ref = {ref => this._bankPicker = ref}
            style={styles.bankAccountPicker}
            mode='dropdown'
            onValueChange={this._onBankPickerSelect.bind(this)}
            itemStyle={{width: '100%'}}>
            {this._renderBankItems()}
          </Picker>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.bankAccountNumber')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
            underlineColorAndroid='transparent'
            onChangeText={text => this._bank.account_number = text}/>
          
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
      <Picker.Item value={bank} label={bank} key={`${index}`}/>
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
            onChangeText={text => this._password.password = text}/>
          
          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.newPassword')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
            underlineColorAndroid='transparent'
            onChangeText={text => this._password.new_password = text}/>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.repeatPassword')}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
            underlineColorAndroid='transparent'
            onChangeText={text => this._password.new_password_confirm = text}/>

          <Text style={styles.bankAccountTitle}>
            {I18n.t('myPage.security.otpCode').toLocaleUpperCase()}
          </Text>
          <TextInput style={styles.bankAccountTextInput}
            underlineColorAndroid='transparent'
            onChangeText={text => this._password.otp = text}/>
          
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
    this.setState({bankAccountDialogVisible: true})
  }

  _onVerifyPhone() {
    
  }

  _onVerifyPassword() {
    this.setState({changePasswordDialogVisible: true})
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

  _onPressInCancelOtpButton() {
    this.setState({cancelOtpButtonPressed: true})
  }

  _onPressOutCancelOtpButton() {
    this.setState({cancelOtpButtonPressed: false})
  }

  _onSubmitBankAccount() {
    this._updateBankAccount();
  }

  _onBankPickerSelect(itemValue, itemPosition) {
    this._bank.bank_id = itemValue.id;
    this._bank.bank_name = itemValue.name;
  }

  _dismissSubmitModal() {
    this.setState({cancelOtpDialogVisible: false})
  }

  _dismissInitVerificationModal() {
    this.setState({initVerificationDialogVisible: false})
  }

  _dismissExistedPhoneModal() {
    this.setState({existedPhoneDialogVisible: false})
  }

  _dismissBankAccountModal() {
    this.setState({bankAccountDialogVisible: false})
  }

  _dismissChangePasswordModal() {
    this.setState({changePasswordDialogVisible: false})
  }

  async _getCurrentUser() {
    try {
      let userRes = await rf.getRequest('UserRequest').getCurrentUser();
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
      await rf.getRequest('UserRequest').delGoogleAuth({
        otp: this._otp.otpCode
      })

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
      await rf.getRequest('UserRequest').verifyBankAccount(this._bank)
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
      await rf.getRequest('UserRequest').changePassword(this._password);
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
    height: 30,
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