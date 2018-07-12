import React from 'react';
import { Text, View } from 'react-native';
import { scale } from '../libs/reactSizeMatter/scalingUtils';
import { CommonColors, CommonStyles, Fonts } from './CommonStyles';

export default class OrderUtils {

  static renderTabItem(text, options, renderSeparator = true) {
    const textColor = options.focused ? CommonColors.tabActive : CommonColors.tabInactive;
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
      fontSize: scale(16),
      ...Fonts.NotoSans
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
};
