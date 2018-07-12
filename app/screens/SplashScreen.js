import React from 'react';
import { Image, View, Text } from 'react-native';
import { initApp } from '../../App';
import AppConfig from '../utils/AppConfig';
import BaseScreen from './BaseScreen';
import { CommonColors, CommonStyles } from "../utils/CommonStyles";
import ScaledSheet from '../libs/reactSizeMatter/ScaledSheet';
import I18n from '../i18n/i18n';

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
        <Text style={styles.title}>
           {I18n.t('splash.title')}
        </Text>
        <Text style={styles.sentence}>
           {I18n.t('splash.sentence')}
        </Text>
      </View>
    )
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen,
    // justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '140@s'
  },
  title: {
    fontSize: "35@s",
    marginTop: "0@s"
  },
  sentence: {
    fontSize: '10@s'
  }
});
