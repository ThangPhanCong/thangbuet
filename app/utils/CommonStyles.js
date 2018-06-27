import { PixelRatio, StyleSheet } from 'react-native';

class CommonColors {
  static screenBgColor = '#FFF';
  static toolbarBgColor = '#202732';
  static increased = '#2ba81e';
  static decreased = '#ee4949';
  static mainText = 'white';
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
  }
};

export { CommonStyles, CommonColors, CommonSize };