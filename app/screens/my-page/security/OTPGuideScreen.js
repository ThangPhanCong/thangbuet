import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BaseScreen from '../../BaseScreen';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';
import { CommonStyles } from '../../../utils/CommonStyles';

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
          {`안전한 거래를 위해 구글 OTP 인증을 사용하세요.\nAPP을 다운로드&설치하고 'NEXT'를 누르세요`}
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
                    {'iPhone'}
                  </Text>
                </View>
                <View style = {styles.storeInfoHorizontalSpace}/>
                <View style={{flex: 5, flexDirection: 'row', justifyContent: 'center'}}>
                  <Image style={{flex: 1}}
                    source={SmallAppStoreIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 4}]}>
                    {'Apple App Store'}
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
                    {'Android'}
                  </Text>
                </View>
                <View style = {styles.storeInfoHorizontalSpace}/>
                <View style={{flex: 5, flexDirection: 'row', justifyContent: 'center'}}>
                  <Image style={{flex: 1}}
                    source={SmallPlayStoreIcon}
                    resizeMode='contain'/>
                  <View style = {styles.storeInfoHorizontalSpace}/>
                  <Text style={[styles.storeInfoText, {flex: 4}]}>
                    {'Google Play Store'}
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
              {'NEXT'}
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

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  textHeader: {
    marginTop: '30@s',
    textAlign: 'center',
    fontSize: '13@s'
  },
  googleAuthText: {
    fontSize: '18@s',
    flex: 1
  },
  googleAuthContainer: {
    flexDirection: 'row',
    marginTop: '30@s',
    marginBottom: '20@s',
    marginStart: '40@s',
    marginEnd: '40@s'
  },
  text: {
    fontSize: '14@s',
  },
  storeInfoText: {
    fontSize: '12@s'
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
    marginStart: '5@s'
  },
  googleAuthInfo: {
    marginStart: '10@s',
    justifyContent: 'space-between'
  },
  storeInfoHorizontalSpace: {
    width: '5@s'
  },
  googleAuthInfoSpace: {
    height: '9@s'
  },
  storeInfoVerticalSpace: {
    height: '10@s'
  }
});