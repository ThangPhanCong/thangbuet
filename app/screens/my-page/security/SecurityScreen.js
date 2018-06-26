import React from 'react';
import {
  Text,
  View,
  Image,
  TouchableHighlight,
  ScrollView
} from 'react-native';

import BaseScreen from '../../BaseScreen';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';
import rf from '../../../libs/RequestFactory';

export default class SecurityScreen extends BaseScreen {
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

  constructor(props) {
    super(props);

    this.state = {
      info: {},
      cancelOtpButtonPressed: false
    }
  }

  componentWillMount(){
    super.componentWillMount()
    this._getCurrentUser();
  }

  render() {
    return(
      <ScrollView
        style={styles.listView}
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
    )
  }

  _renderVerifyEmail() {
    let item = this._infoProps[0];

    return (
      <View style={styles.listItem}>
        {this._renderIconView(item)}

        <View style={styles.valueGroup}>
          <Text style={styles.text}>
            {this.state.info[item.propVerify] ? this.state.info[item.propValue] : '미인증'}
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
              onPressIn={() => this.setState({cancelOtpButtonPressed: true})}
              onPressOut={() => this.setState({cancelOtpButtonPressed: false})}
              underlayColor='#FF3300'>
              <Text style={[styles.text, this.state.cancelOtpButtonPressed ? {color: '#FFF'} : {color: '#FF3300'}]}>
                {'사용 중단하기'}
              </Text>
            </TouchableHighlight> :
            <Text style={styles.text}>
              { '미인증' }
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
            {this.state.info[item.propVerify] ? this.state.info[item.propValue] : '미인증'}
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
            {this.state.info[item.propVerify] ? this.state.info[item.propValue] : '미인증'}
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
            {this.state.info[item.propVerify] ? '인증 완료' : '인증하기' }
          </Text>
        </TouchableHighlight>
      </View>
    )
  }

  _onVerifyGoogle() {
    
  }

  _onVerifyBankAccount() {

  }

  _onVerifyPhone() {

  }

  _onVerifyPassword() {

  }

  _onCancelGoogleAuth() {

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
      console.log('BasicInfoScreen._getCurrentUser', err);
    }
  }
}

const styles = ScaledSheet.create({
  listView: {
    flex: 1,
  },
  listItem: {
    height: "58@s",
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: "20@s",
    paddingRight: "20@s"
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
    fontSize: '14@s',
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
  cancelOTPButton: {
    borderRadius: '5@s',
    height: '40@s',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3300',
    marginEnd: '30@s'
  }
});