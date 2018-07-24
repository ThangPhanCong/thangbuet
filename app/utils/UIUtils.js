import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { scale } from '../libs/reactSizeMatter/scalingUtils';
import { CommonColors, CommonStyles, Fonts } from './CommonStyles';

export default class UIUtils {

  static renderTabItem(text, options, renderSeparator = true) {
    const textColor = options.focused ? CommonColors.tabActive : CommonColors.tabInactive;
    const fontTab = options.focused ? Fonts.NotoSans_Bold : Fonts.NotoSans;

    const tabStyle = {
      flex: 1,
      height: scale(32),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    };
    const labelStyle = {
      flex: 1,
      color: textColor,
      textAlign: 'center',
      fontSize: scale(options.fontSize || 16),
      ...fontTab
    };
    const separatorStyle = {
      width: 1,
      height: scale(10),
      backgroundColor: '#E0E0E0'
    }

    return (
      <View style={tabStyle}>
        <Text style={labelStyle}>{text}</Text>
        {renderSeparator && <View style={separatorStyle}/>}
      </View>
    )
  }

  static generateShadowStyle(height = 4) {
    if (Platform.OS === 'ios') {
      return {
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowOffset: {
          width: 5,
          height: 5,
        },
        zIndex:999
      };
    } else {
      return {
        elevation: height
      };
    }
  }

  static generatePopupShadow() {
    return UIUtils.generateShadowStyle(8);
  }
};
