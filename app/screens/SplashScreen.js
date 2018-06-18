import React from 'react';
import { Image, View } from 'react-native';
import { initApp } from '../../App';
import AppConfig from '../utils/AppConfig';
import BaseScreen from './BaseScreen';
import { CommonColors, CommonStyles } from "../utils/CommonStyles";
import ScaledSheet from '../libs/reactSizeMatter/ScaledSheet';

export default class SplashScreen extends BaseScreen {
  static navigationOptions = {
    header: null,
    headerStyle: {
      backgroundColor: CommonColors.screenBgColor
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      email: undefined,
      password: undefined
    };
  }

  componentWillMount() {
    super.componentWillMount();
    // TODO start animation
    initApp()
      .then(() => {
        if (AppConfig.ACCESS_TOKEN) {
          this.navigate('MainScreen');
        } else {
          // TODO show market info
          this.navigate('LoginScreen');
        }
      });
  }

  render() {
    return (
      <View
        style={styles.screen}>
        <Image
          resizeMode={'contain'}
          style={styles.logoStyle}
          source={require('../../assets/common/logoLogin.png')}
        />
      </View>
    )
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoStyle: {
    width: "180@s",
    height: "60@s"
  }
});