import React, { Component } from 'react';
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, Fonts } from "../../utils/CommonStyles";
import { Text, View } from "react-native";

class HeaderProfitAndLoss extends Component {
  render() {
    const { titles } = this.props;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerCurrency}>
          <Text style={styles.headerTitle}>{titles[0]}</Text>
        </View>
      </View>
    )
  }
}

export default HeaderProfitAndLoss;

const styles = ScaledSheet.create({
  headerContainer: {
    flexDirection: 'row',
    height: '40@s',
    backgroundColor: '#f8f9fb',
    borderWidth: '1@s',
    borderColor: CommonColors.separator
  },
  headerItem: {
    flexDirection: 'column',
    width: '100@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerCurrency: {
    flexDirection: 'column',
    width: '48@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Fonts.NotoSans,
    fontSize: '12@s',
    color: CommonColors.mainText
  }
})