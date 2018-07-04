import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BaseScreen from '../../BaseScreen';
import { CommonStyles } from '../../../utils/CommonStyles';
import I18n from '../../../i18n/i18n';

const GoogleAuthIcon = require('../../../../assets/common/googleAuthBig.png')
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
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
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
                <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
                  <Image
                    source={SmallAppleIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 3}]}>
                    {I18n.t('common.iPhone')}
                  </Text>
                </View>
                <View style = {styles.storeInfoHorizontalSpace}/>
                <View style={{flex: 5, flexDirection: 'row', justifyContent: 'center'}}>
                  <Image style={{flex: 1}}
                    source={SmallAppStoreIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 4}]}>
                    {I18n.t('common.appStore')}
                  </Text>
                </View>
              </View>
              <View style = {styles.storeInfoVerticalSpace}/>
              <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
                  <Image
                    source={SmallAndroidIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 3}]}>
                    {I18n.t('common.android')}
                  </Text>
                </View>
                <View style = {styles.storeInfoHorizontalSpace}/>
                <View style={{flex: 5, flexDirection: 'row', justifyContent: 'center'}}>
                  <Image style={{flex: 1}}
                    source={SmallPlayStoreIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 4}]}>
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
    this.navigate('OTPVerifyScreen');
  }
}

const styles = StyleSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  textHeader: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 13
  },
  googleAuthText: {
    fontSize: 18,
    flex: 1
  },
  googleAuthContainer: {
    flexDirection: 'row',
    marginTop: 30,
    marginBottom: 20,
    marginStart: 40,
    marginEnd: 40,
    height: 150,
    alignSelf: 'center'
  },
  text: {
    fontSize: 14,
  },
  storeInfoText: {
    fontSize: 12
  },
  nextButton: {
    height: 40,
    width: 300,
    alignSelf: 'center',
    marginTop: 30,
    borderRadius: 5,
    overflow: 'hidden'
  },
  storeContainer: {
    flex: 1,
    marginStart: 10,
    justifyContent: 'space-between'
  },
  googleAuthInfo: {
    marginStart: 10,
    justifyContent: 'space-between'
  },
  storeInfoHorizontalSpace: {
    width: 5
  },
  googleAuthInfoSpace: {
    height: 9
  },
  storeInfoVerticalSpace: {
    height: 8
  }
});