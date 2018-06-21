import React from 'react';
import { View, BackHandler, Alert, Platform } from "react-native";
import I18n from '../i18n/i18n';

export default class BaseScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  _didFocusSubscription;
  _willBlurSubscription;

  constructor(props) {
    super(props);
    //console.log('this.props.', props)

  }

  navigate(screen, params) {
    const { navigate } = this.props.navigation;
    navigate(screen, params)
  }

  componentWillMount() {
    if (Platform.OS === 'android' && this.props.navigation) {
      this._didFocusSubscription = this.props.navigation.addListener('didFocus', payload => {
        //console.log("payload", BackHandler)
        return BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
      }
      );
    }
  }

  componentDidMount() {
    // let eventHandlers = this.getSocketEventHandlers();
    // for (let event in eventHandlers) {
    //   let handler = eventHandlers[event];
    //   window.GlobalSocket.bind(event, handler);
    // }
    if (Platform.OS === 'android' && this.props.navigation) {
      this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload => {
        //console.log("payload willBlur", payload)
        return BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
      }
      );
    }
  }

  componentWillUnmount() {
    let eventHandlers = this.getSocketEventHandlers();
    for (let event in eventHandlers) {
      let handler = eventHandlers[event];
      window.GlobalSocket.unbind(event, handler);
    }

    if (Platform.OS === 'android') {
      this._didFocusSubscription && this._didFocusSubscription.remove();
      this._willBlurSubscription && this._willBlurSubscription.remove();
    }
  }

  getSocketEventHandlers() {
    return {};
  }

  onBackButtonPressAndroid = () => {
    // console.log('this.props.navigation.', this.props.navigation.isFocused())
    const mainScreens = ['HomeScreen', "favourite", "btc", "eth", "vnd", "TradesScreen", "BalanceScreen", 'AccountSettingScreen',
      "LoginScreen"]
    let index = mainScreens.indexOf(this.props.navigation.state.routeName)
    // console.log('index, ', index)
    if (this.props.navigation.isFocused && this.props.navigation.isFocused() && index != -1) {
      Alert.alert(
        I18n.t('exit.title'),
        I18n.t('exit.content'), [{
          text: I18n.t('exit.cancel'),
          onPress: () => { },
          style: 'cancel'
        }, {
          text: I18n.t('exit.ok'),
          onPress: () => BackHandler.exitApp()
        },], {
          cancelable: false
        }
      )
      return true
    } else {
      return false
    }
  };
}
