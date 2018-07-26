import React, {Component} from "react";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, Fonts } from "../../utils/CommonStyles";
import { Text, View } from "react-native";

class HeaderFundsRight extends Component{
  render() {
    const {titles} = this.props;

    return(
      <View style={styles.headerContainer}>
        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[0]}</Text>
        </View>

        <View style={styles.headerBlockChainItem}>
          <Text style={styles.headerTitle}>{titles[1]}</Text>
        </View>

        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[2]}</Text>
        </View>

        <View style={[styles.headerItem, { marginRight: scale(10) }]}>
          <Text style={styles.headerTitle}>{titles[3]}</Text>
        </View>
      </View>
    )
  }
}

export default HeaderFundsRight;

const styles = ScaledSheet.create({
  headerContainer: {
    flexDirection: 'row',
    height: '40@s',
    backgroundColor: '#f8f9fb',
    borderWidth: '1@s',
    borderLeftWidth: 0,
    borderColor: CommonColors.separator
  },
  headerItem: {
    flexDirection: 'column',
    width: '80@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerBlockChainItem: {
    flexDirection: 'column',
    width: '90@s',
    marginLeft: '10@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '12@s',
    color: CommonColors.mainText,
    ...Fonts.NotoSans,
  },
})