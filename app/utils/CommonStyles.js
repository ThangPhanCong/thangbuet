import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { scale } from '../libs/reactSizeMatter/scalingUtils';

class CommonColors {
  static screenBgColor = '#FFF';
  static toolbarBgColor = '#202732';
  static increased = '#FD0001';
  static decreased = '#0065BF';
  static mainText = '#000000';
  static secondaryText = '#898B8E';
  static highlightText = '#F0B353';
  static sencondaryTextColor = '#AAAAAA';
  static border = '#404A55';
  static popupBg = '#202732';
  static headerTitleColor = '#8e929e';
  static textInputBgColor = '#1a2030';
  static inputLableColor = '#cdcdce';
  static btnSubmitBgColor = '#1aa4fa';
  static headerTintColor = '#ffffff';
  static listItemBgColor = '#1a2030';
  static separator = '#DEE3EB';
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
    checkedImage: (<Image source={require('../../assets/common/checkbox/checked.png')}/>),
    unCheckedImage: (<Image source={require('../../assets/common/checkbox/unchecked.png')}/>)
  },
  switch: {
    activeText: 'ON',
    inActiveText: ' OFF',
    renderActiveText: true,
    renderInActiveText: true,
    circleSize: scale(14),
    barHeight: scale(18),
    switchLeftPx: 1.1,
    switchRightPx: 1.3,
    switchWidthMultiplier: 3,
    circleBorderWidth: 0,
    circleBorderActiveColor: '#0000',
    circleBorderInactiveColor: '#0000',
    backgroundActive: '#41BCF3',
    backgroundInactive: '#C4C4C4',
    activeTextStyle: {
      fontSize: scale(9),
      paddingRight: scale(5)
    },
    inactiveTextStyle: {
      fontSize: scale(9),
      paddingLeft: scale(1)
    }
  }
};

export { CommonStyles, CommonColors, CommonSize };