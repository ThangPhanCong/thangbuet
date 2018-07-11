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
    const socketEventHandlers = this.getSocketEventHandlers();
    for (let event in socketEventHandlers) {
      let handler = socketEventHandlers[event];
      window.GlobalSocket.bind(event, handler);
    }

    const dataEventHandlers = this.getDataEventHandlers();
    for (let event in dataEventHandlers) {
      let handler = dataEventHandlers[event];
      window.EventBus.bind(event, handler);
    }

    if (Platform.OS === 'android' && this.props.navigation) {
      this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload => {
        //console.log("payload willBlur", payload)
        return BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
      }
      );
    }
  }

  componentWillUnmount() {
    const socketEventHandlers = this.getSocketEventHandlers();
    for (let event in socketEventHandlers) {
      let handler = socketEventHandlers[event];
      window.GlobalSocket.unbind(event, handler);
    }

    const dataEventHandlers = this.getDataEventHandlers();
    for (let event in dataEventHandlers) {
      let handler = dataEventHandlers[event];
      window.EventBus.unbind(event, handler);
    }

    if (Platform.OS === 'android') {
      this._didFocusSubscription && this._didFocusSubscription.remove();
      this._willBlurSubscription && this._willBlurSubscription.remove();
    }
  }

  getSocketEventHandlers() {
    return {};
  }

  getDataEventHandlers() {
    return {};
  }

  notify(event, data) {
    window.EventBus.notify(event, data);
  }

  alertExit(){
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
  }
  onBackButtonPressAndroid = () => {
    // console.log('this.props.navigation.', this.props.navigation.isFocused())
    const mainScreens = ['HomeScreen', "favourite", "btc", "eth", "vnd", "TradesScreen", "BalanceScreen", 'AccountSettingScreen',
      "LoginScreen"]
    let index = mainScreens.indexOf(this.props.navigation.state.routeName)
    // console.log('index, ', index)
    if (this.props.navigation.isFocused && this.props.navigation.isFocused() && index != -1) {
      if (this.props.navigation.state.routeName === "LoginScreen"){
        if (this.state.checkOtp){
          this.setState({checkOtp: false});
        } else {
          this.alertExit();
        }
        return true
      } else {
        this.alertExit();
        return true
      }
    } else {
      return false
    }
  };
}
