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
import { connect } from 'react-redux';

export default class LoginScreen extends BaseScreen {

  state = {
    email: '',
    password: ''
  }

  async _onPressLogin() {
    try {
      let responseUser = await rf.getRequest('UserRequest').login(this.state.email, this.state.password);
      AppPreferences.saveAccessToken(responseUser.access_token);
      this._dispatchAllSocketEvents();
      // console.log('responseUser', responseUser)
      this.navigate('MainScreen', {});

    } catch (err) {
      console.log('err', err)
    }

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
        />

        <View style={styles.rowFlexOne} />
        <View style={styles.inputRow}>
          <TextInput
            value={this.state.email}
            keyboardType='email-address'
            placeholder={I18n.t('login.email')}
            // blurOnSubmit={false}
            placeholderTextColor='#cfd0d1'
            underlineColorAndroid='transparent'
            autoCapitalize='none'
            style={[styles.input]}
            returnKeyType={"next"}
            onChangeText={(text) => this.setState({ email: text })} />
        </View>

        {/* <View style={styles.seperator}>
          {this.state.errorEmail.show && <Text style={styles.textError}> {this.state.errorEmail.text} </Text>}
        </View> */}

        <View style={[styles.inputRow, styles.inputRowMarginTop]}>
          <TextInput
            style={[styles.input]}
            value={this.state.password}
            //secureTextEntry={!this.state.showPassword}
            placeholderTextColor='#cfd0d1'
            placeholder={I18n.t('login.password')}
            underlineColorAndroid='transparent'
            onChangeText={(text) => this.setState({ password: text })} />


          <Icon
            //name={this.state.iconName}
            type='font-awesome'
            color='#cfd0d1'
            //containerStyle={styles.showPassword}
            underlayColor='transparent'
            size={17}
            onPress={() => this._toggleShowPassWord()} />
        </View>

        {/* <View style={styles.seperator} >
          {this.state.errorPassword.show && <Text style={styles.textError}> {this.state.errorPassword.text} </Text>}
        </View> */}

        <View style={styles.buttons}>
          <TouchableOpacity onPress={this._onPressLogin.bind(this)} style={[styles.button, styles.loginButton]} >
            <Text style={styles.buttonText}>{I18n.t('login.login')}</Text>
          </TouchableOpacity>
        </View>

        {/* {this.state.errorMessage.show && (
          <View style={styles.boxError}>
            <Text>{this.state.errorMessage.text}</Text>
          </View>
        )} */}
        <View style={styles.rowFlexTwo} >
        </View>

      </KeyboardAwareScrollView>
    )
  }

  _dispatchAllSocketEvents() {
    let { listenPrivateEvent, listenPublicEvent } = this.props;
    listenPublicEvent(Consts.SOCKET_EVENTS.PRICE_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_PRICES);
    listenPublicEvent(Consts.SOCKET_EVENTS.ORDER_TRANSACTION_CREATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_ORDERS);
    listenPublicEvent(Consts.SOCKET_EVENTS.ORDER_BOOK_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_ORDER_BOOK);
    listenPublicEvent(Consts.SOCKET_EVENTS.COIN_MARKET_CAP_TICKET_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_COIN_MARKKETCAP_TICKER);
    listenPublicEvent(Consts.SOCKET_EVENTS.MARKET_PRICE_CHANGES_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_MARKET_PRICES_CHANGE);
    listenPublicEvent(Consts.SOCKET_EVENTS.PROFIT_RATE_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_PROFIT_RATE);

    listenPrivateEvent(Consts.SOCKET_EVENTS.BALANCE_UPDATED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.TRANSACTION_CREATED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.USER_ORDER_BOOK_UPDATED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.ORDER_CHANGED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.USER_SESSION_REGISTERED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.FAVORITE_SYMBOLS_UPDATED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.ORDER_LIST_UPDATED);
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

function mapDispatchToProps(dispatch) {
  return {
    listenPublicEvent: (event, channel) => dispatch({
      type: ActionType.LISTEN_PUBLIC_SOCKET_EVENT,
      event,
      channel
    }),
    listenPrivateEvent: (event) => dispatch({
      type: ActionType.LISTEN_PRIVATE_SOCKET_EVENT,
      event
    })
  }
}

export default connect(null, mapDispatchToProps)(LoginScreen);