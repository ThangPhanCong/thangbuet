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
        <Text>
          {`안전한 거래를 위해 구글 OTP 인증을 사용하세요.\n
            APP을 다운로드&설치하고 'NEXT'를 누르세요`}
        </Text>
        <View style={styles.googleAuthContainer}>
          <Image
            source={GoogleAuthIcon}/>
          <View style={styles.googleAuthInfo}>
            <Text>
              {'Google Authenticator'}
            </Text>
            <View style={styles.storeContainer}>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Image style={{flex: 1}}
                  source={SmallAppleIcon}/>
                <Text style={{flex: 3}}>
                  {'iPhone'}
                </Text>
                <Image style={{flex: 1}}
                  source={SmallAppStoreIcon}/>
                <Text style={{flex: 4}}>
                  {'Apple App Store '}
                </Text>
              </View>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Image style={{flex: 1}}
                  source={SmallAndroidIcon}/>
                <Text style={{flex: 3}}>
                  {'Android'}
                </Text>
                <Image style={{flex: 1}}
                  source={SmallPlayStoreIcon}/>
                <Text style={{flex: 4}}>
                  {'Google Play Store'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <LinearGradient style={styles.nextButtonContainer}
          colors={['#7CB953', '#70AD47']}
          start={{x: 0.0, y: 1.0}} end={{x: 1.0, y: 1.0}}>
          <TouchableOpacity
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            onPress={this._onNext.bind(this)}>
            <Text style={[styles.text, {color: '#FFF'}]}>
              {'NEXT'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    )
  }

  _onNext() {
    
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  googleAuthContainer: {
    flexDirection: 'row',
    marginTop: '20@s',
    marginBottom: '20@s',
    alignItems: 'center'
  },
  text: {
    fontSize: '14@s',
  },
  nextButtonContainer: {
    height: '40@s',
    width: '180@s',
    alignSelf: 'center'
  },
  storeContainer: {
    marginTop: '30@s'
  },
  googleAuthInfo: {
    marginStart: '10@s'
  }
});