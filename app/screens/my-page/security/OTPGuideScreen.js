import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';
import LinearGradient from 'react-native-linear-gradient';
import BaseScreen from '../../BaseScreen';
import { CommonStyles, Fonts } from '../../../utils/CommonStyles';
import I18n from '../../../i18n/i18n';
const GoogleAuthIcon = require('../../../../assets/common/googleAuthBig.png');
const SmallAppleIcon = require('../../../../assets/common/appleSmall.png');
const SmallAndroidIcon = require('../../../../assets/common/androidSmall.png');
const SmallAppStoreIcon = require('../../../../assets/common/appStoreSmall.png');
const SmallPlayStoreIcon = require('../../../../assets/common/playStoreSmall.png');

export default class OTPGuideScreen extends BaseScreen {
  render() {
    return(
      <View style={styles.screen}>
        <Text style={styles.textHeader}>
          {I18n.t('myPage.security.otpGuide')}
        </Text>
        <View style={styles.googleAuthContainer}>
          <View style={{alignItems: 'flex-end', justifyContent: 'center', flex: 1.5}}>
            <Image
              source={GoogleAuthIcon}/>
          </View>
          <View style={styles.googleAuthInfo}>
            <Text style={styles.googleAuthText}>
              {'Google Authenticator'}
            </Text>
            <View style={styles.googleAuthInfoSpace}/>
            <View style={styles.storeContainer}>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <View style={{flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Image
                    style={{flex: 1, alignSelf: 'center'}}
                    source={SmallAppleIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 4}]}
                    adjustsFontSizeToFit={true}>
                    {I18n.t('common.iPhone')}
                  </Text>
                </View>
                <View style = {styles.storeInfoHorizontalSpace}/>
                <View style={{flex: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Image
                    style={{flex: 1, alignSelf: 'center'}}
                    source={SmallAppStoreIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 9}]}
                    adjustsFontSizeToFit={true}>
                    {I18n.t('common.appStore')}
                  </Text>
                </View>
              </View>
              <View style={styles.storeInfoVerticalSpace} />
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <View style={{flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Image
                    style={{flex: 1, alignSelf: 'center'}}
                    source={SmallAndroidIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 4}]}
                    adjustsFontSizeToFit={true}>
                    {I18n.t('common.android')}
                  </Text>
                </View>
                <View style = {styles.storeInfoHorizontalSpace}/>
                <View style={{flex: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Image
                    style={{flex: 1, alignSelf: 'center'}}
                    source={SmallPlayStoreIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 9}]}
                    adjustsFontSizeToFit={true}>
                    {I18n.t('common.playStore')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={this._onNext.bind(this)}>
          <LinearGradient 
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            colors={['#7CB953', '#70AD47']}
            start={{x: 0.0, y: 1.0}} end={{x: 1.0, y: 1.0}}>
            <Text style={[styles.text, {color: '#FFF'}]}>
              {I18n.t('myPage.security.next').toLocaleUpperCase()}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    )
  }

  _onNext() {
    this.navigate('OTPVerifyScreen', this.props.navigation.state.params);
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  textHeader: {
    marginTop: '30@s',
    textAlign: 'center',
    fontSize: '13@s',
    ...Fonts.NanumGothic_Regular
  },
  googleAuthText: {
    fontSize: '18@s',
    flex: 1,
    ...Fonts.OpenSans_Bold
  },
  googleAuthContainer: {
    flexDirection: 'row',
    marginTop: '50@s',
    marginBottom: '20@s',
    height: '100@s'
  },
  text: {
    fontSize: '14@s',
    ...Fonts.OpenSans
  },
  storeInfoText: {
    fontSize: '12@s',
    ...Fonts.OpenSans_Light
  },
  nextButton: {
    height: '40@s',
    width: '300@s',
    alignSelf: 'center',
    marginTop: '30@s',
    borderRadius: '5@s',
    overflow: 'hidden'
  },
  storeContainer: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column'
  },
  googleAuthInfo: {
    marginStart: '5@s',
    justifyContent: 'center',
    flex: 3
  },
  storeInfoHorizontalSpace: {
    width: '5@s'
  },
  googleAuthInfoSpace: {
    height: '9@s'
  },
  storeInfoVerticalSpace: {
    height: '8@s'
  }
});