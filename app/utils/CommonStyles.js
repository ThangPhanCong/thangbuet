import React from 'react';
import { Image, Platform, StyleSheet } from 'react-native';
import { scale } from '../libs/reactSizeMatter/scalingUtils';

const iOSFonts = {
  NanumSquareOTF_ExtraBold: {
    fontFamily: 'NanumSquareOTF',
    fontWeight: '800'
  },
  OpenSans: {
    fontFamily: 'OpenSans-Regular',
  },
  OpenSans_Bold: {
    fontFamily: 'OpenSans-Semibold'
  },
  OpenSans_Light: {
    fontFamily: 'OpenSans-Light',
  },
  // NotoSans_Bold: {
  //   fontFamily: 'NotoSans',
  //   fontWeight: '700'
  // },
  NotoSans_Bold: {
    fontFamily: 'NotoSansCJKkr-Bold'
  },
  NotoSans_Regular: {
    fontFamily: 'NotoSansCJKkr-Regular'
  },
  NanumGothic_Regular: {
    fontFamily: 'NanumGothic',
    fontWeight: '400'
  },
  NanumGothic_Bold: {
    fontFamily: 'NanumGothic',
    fontWeight: '700'
  },
  Roboto: {
    fontFamily: 'Roboto-Regular'
  }
};

const androidFonts = {
  NanumSquareOTF_ExtraBold: {
    fontFamily: 'NanumSquareOTFBold',
  },
  OpenSans: {
    fontFamily: 'OpenSans-Regular',
  },
  OpenSans_Bold: {
    fontFamily: 'OpenSans-Regular',
    fontWeight: 'bold'
  },
  OpenSans_Light: {
    fontFamily: 'OpenSans-Light',
  },
  NotoSans: {
    fontFamily: 'NotoSansCJKkr-Regular'
  },
  NotoSans_Bold: {
    fontFamily: 'NotoSansCJKkr-Bold'
  },
  NotoSans_Regular: {
    fontFamily: 'NotoSansCJKkr-Regular'
  },
  NanumGothic_Regular: {
    fontFamily: 'NanumGothic-Regular'
  },
  NanumGothic_Bold: {
    fontFamily: 'NanumGothic-Regular',
    fontWeight: 'bold'
  },
  Roboto: {
    fontFamily: 'Roboto-Regular'
  }
};

const Fonts = Platform.OS === 'ios' ? iOSFonts : androidFonts;

class CommonColors {
  static screenBgColor = '#FFF';
  static increased = '#FD0001';
  static decreased = '#0065BF';
  static mainText = '#000000';
  static secondaryText = '#898B8E';
  static sencondaryTextColor = '#AAAAAA';
  static border = '#CFCFCF';
  static popupBg = '#202732';
  static headerTitleColor = '#8e929e';
  static textInputBgColor = '#1a2030';
  static inputLableColor = '#cdcdce';
  static btnSubmitBgColor = '#1aa4fa';
  static headerTintColor = '#ffffff';
  static listItemBgColor = '#1a2030';
  static separator = '#DEE3EB';
  static tabBg = '#3B3838';
  static tabActive = '#FFC000';
  static tabInactive = '#D9D9D9';
};

class CommonSize {
  static contentPadding = "30@s";
  static headerTitleFontSize = "15@s";
  static inputHeight = "43@s";
  static inputFontSize = "15@s";
  static formLabelFontSize = "12@s";
  static btnSubmitHeight = '43@s'
}

const CommonStyles = {
  screen: {
    flex: 1,
    backgroundColor: CommonColors.screenBgColor,
  },
  priceIncreased: {
    color: CommonColors.increased,
  },
  priceDecreased: {
    color: CommonColors.decreased,
  },
  priceNotChanged: {
    color: CommonColors.secondaryText
  },
  matchParent: {
    flex: 1,
  },
  checkBox: {
    checkedImage: (<Image style={{width: scale(13), height: scale(13) }} source={require('../../assets/common/checkbox/checked.png')} />),
    unCheckedImage: (<Image style={{width: scale(13), height: scale(13) }} source={require('../../assets/common/checkbox/unchecked.png')} />)
  },
  switch: {
    activeText: 'ON',
    inActiveText: ' OFF',
    renderActiveText: true,
    renderInActiveText: true,
    circleSize: scale(12),
    barHeight: scale(16),
    switchLeftPx: 1.1,
    switchRightPx: 1.3,
    switchWidthMultiplier: 3,
    outerCircleStyle: {
      top: scale(2)
    },
    circleBorderWidth: 0,
    circleBorderActiveColor: '#0000',
    circleBorderInactiveColor: '#0000',
    backgroundActive: '#41BCF3',
    backgroundInactive: '#C4C4C4',
    activeTextStyle: {
      fontSize: scale(7),
      ...Fonts.NanumSquareOTF_ExtraBold,
      paddingRight: scale(5)
    },
    inactiveTextStyle: {
      fontSize: scale(7),
      ...Fonts.NanumSquareOTF_ExtraBold,
      paddingLeft: scale(2)
    }
  },
  bold: {
    fontWeight: 'bold'
  },
  tabOptions: {
    tabBarOptions: {
      style: {
        backgroundColor: CommonColors.tabBg,
        height: scale(37),
        elevation: 0
      },
      indicatorStyle: {
        backgroundColor: CommonColors.tabActive
      },
      tabStyle: {
        padding: 0,
        paddingTop: scale(3)
      }
    },
    animationEnabled: false,
    swipeEnabled: false
  }
};

export { CommonStyles, CommonColors, CommonSize, Fonts };
