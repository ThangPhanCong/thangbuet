import React from 'react';
import {
  View,
  WebView,
  StyleSheet,
  PixelRatio
} from 'react-native';
import I18n from '../../../i18n/i18n';
import AppConfig from '../../../utils/AppConfig';
import { CommonColors } from '../../../utils/CommonStyles';

class TermsOfUseScreen extends React.Component {
  static navigationOptions = {
    title: I18n.t('login.title.termOfUse'),
    headerStyle: {
      backgroundColor: CommonColors.screenBgColor,
      elevation: 0,
    },
    headerTintColor: '#cdcccd',
    headerTitleStyle: {
      color: CommonColors.headerTitleColor,
      fontWeight: 'bold',
      fontSize: 16.5 * PixelRatio.getFontScale(),
    },
  }
  render() {
    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: AppConfig.getTermUrl() }}
          style={styles.webview}
          scalesPageToFit={true}
          startInLoadingState={true}
        />
      </View>
    );
  }
}
export default TermsOfUseScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  webview: {
    flex: 1
  }
})
