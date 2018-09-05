import React, { Component } from "react";
import { Text, View, WebView } from "react-native";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import AppConfig from "../../utils/AppConfig";

class SignUpScreen extends Component {
  static navigationOptions = {
    header: null
  };

  render() {
    return(
      <View style={styles.viewSignUp}>
        <WebView source={{ uri: 'http://bitkoex.net/webview/sign_up' }}
                 // javaScriptEnabled={true}
                 // automaticallyAdjustContentInsets={true}
                 scalesPageToFit={true}
                 // mixedContentMode={'compatibility'}
                 startInLoadingState={true}
        />
      </View>
    )
  }
}

export default SignUpScreen;

const styles = ScaledSheet.create({
  viewSignUp: {
    flex: 1
  }
});