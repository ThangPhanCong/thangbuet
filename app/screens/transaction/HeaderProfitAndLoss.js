import React, { Component } from 'react';
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors } from "../../utils/CommonStyles";
import { Text, View } from "react-native";

class HeaderProfitAndLoss extends Component {
  render() {
    const { titles } = this.props;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerCurrency}>
          <Text style={styles.headerTitle}>{titles[0]}</Text>
        </View>

        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[1]}</Text>
        </View>

        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[2]}</Text>
        </View>

        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[3]}</Text>
        </View>

        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[4]}</Text>
        </View>

        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[5]}</Text>
        </View>

        <View style={[styles.headerItem, { marginRight: scale(10) }]}>
          <Text style={styles.headerTitle}>{titles[6]}</Text>
        </View>
      </View>
    )
  }
}

export default HeaderProfitAndLoss;

const styles = ScaledSheet.create({
  headerContainer: {
    flexDirection: 'row',
    height: '50@s',
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
    width: '49@s',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightColor: CommonColors.separator,
    borderRightWidth: '1@s',
  },
  headerTitle: {
    fontFamily: 'NotoSans-Regular',
    fontSize: '12@s',
    color: CommonColors.mainText
  }
})