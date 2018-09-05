import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Linking } from 'react-native';
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, Fonts } from "../../utils/CommonStyles";
import I18n from "../../i18n/i18n";
import MarketSearchScreen from "../market/MarketSearchScreen";

const { height } = Dimensions.get('window');

class PreviewScreen extends Component{
  static navigationOptions = {
    header: null
  };

  render() {
    return(
      <View style={styles.screen}>
        <Image source={require('../../../assets/preview/previewIcon.png')} style={styles.imgPreview} resizeMode={'contain'} />

        <View style={styles.bottomGroup}>
          <TouchableOpacity style={styles.buttonNavigateLogin} onPress={() => this.props.navigation.navigate('LoginScreen')}>
            <View>
              <Text style={styles.textNavigateLogin}>{I18n.t('preview.login')}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.secondNavigateGroup}>
            <TouchableOpacity style={styles.buttonNavigateSignUp} onPress={() => Linking.openURL('https://bitkoex.net/webview/sign_up')}>
              <View>
                <Text style={styles.textNavigateSignUp}>{I18n.t('preview.signUp')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.props.navigation.navigate('MainScreen')}>
              <View style={styles.buttonNavigateTrade}>
                <Text style={styles.textNavigateTrade}>{I18n.t('preview.trade')}</Text>
              </View>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    )
  }
}

export default PreviewScreen;

const styles = ScaledSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#00358e',
  },
  imgPreview: {
    width: '161@s',
    height: '161@s',
    marginTop: '50@s',
    alignSelf: 'center'
  },
  bottomGroup: {
    flexDirection: 'column'
  },
  buttonNavigateLogin: {
    backgroundColor: '#2a6edf',
    alignItems: 'center',
    justifyContent: 'center',
    height: '38@s',
    marginLeft: '40@s',
    marginRight: '40@s',
    marginTop: `${height/2 -100}@s`,
    borderRadius: '3@s'
  },
  textNavigateLogin: {
    color: '#FFF',
    fontSize: '12@s',
    ...Fonts.NanumGothic_Regular
  },
  textNavigateTrade: {
    fontSize: '12@s',
    color: '#8aa9de',
    ...Fonts.NanumGothic_Regular
  },
  textNavigateSignUp: {
    fontSize: '12@s',
    color: '#8aa9de',
    ...Fonts.NanumGothic_Regular
  },
  buttonNavigateSignUp: {
    marginRight: '40@s'
  },
  buttonNavigateTrade: {
    marginLeft: '40@s'
  },
  secondNavigateGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '15@s'
  }
});