import React from 'react';
import { View, BackHandler, Alert, Platform, ToastAndroid } from "react-native";
import I18n from '../i18n/i18n';
import Consts from "../utils/Consts";
import RNRestart from 'react-native-restart';

export default class BaseScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  // _didFocusSubscription;
  // _willBlurSubscription;

  constructor(props) {
    super(props);
    //console.log('this.props.', props)

  }

  navigate(screen, params) {
    const { navigate } = this.props.navigation;
    navigate({ routeName: screen, params: params, action: null, key: screen });
  }

  _onError(err) {
    if (err.message === Consts.NOT_LOGIN) {
      RNRestart.Restart();
    };
  }

  componentWillMount() {
    // if (Platform.OS === 'android' && this.props.navigation) {
    //   this._didFocusSubscription = this.props.navigation.addListener('didFocus', payload => {
    //     //console.log("payload", BackHandler)
    //     return BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid.bind(this))
    //   }
    //   );
    // }
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

    // if (Platform.OS === 'android' && this.props.navigation) {
    //   this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload => {
    //     //console.log("payload willBlur", payload)
    //     return BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid.bind(this))
    //   }
    //   );
    // }
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

    // if (Platform.OS === 'android') {
    //   this._didFocusSubscription && this._didFocusSubscription.remove();
    //   this._willBlurSubscription && this._willBlurSubscription.remove();
    // }
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

  // onBackButtonPressAndroid() {
  // const mainScreens = ['LoginScreen', 'MainScreen']
  // let index = mainScreens.indexOf(this.props.navigation.state.routeName);

  // if (this.props.navigation.isFocused && this.props.navigation.isFocused() && index != -1) {
  //   ToastAndroid.showWithGravity(
  //     I18n.t('exit.content'),
  //     ToastAndroid.SHORT,
  //     ToastAndroid.BOTTOM
  //   );

  //   BackHandler.exitApp();
  //   return true
  // } else {
  //   return false
  // }
  // };
}
