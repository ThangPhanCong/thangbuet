import React, {Component} from "react";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, Fonts } from "../../utils/CommonStyles";
import { Text, View } from "react-native";

class HeaderProfitRight extends Component{
  render() {
    const {titles} = this.props;

    return(
      <View style={styles.headerContainer}>
        <View style={[styles.headerItem, { marginRight: scale(10) }]}>
          <Text style={styles.headerTitle}>{titles[6]}</Text>
        </View>
      </View>
    )
  }

}

export default HeaderProfitRight;

const styles = ScaledSheet.create({
  headerContainer: {
    flexDirection: 'row',
    height: '40@s',
    backgroundColor: '#f8f9fb',
    borderWidth: '0.5@s',
    borderLeftWidth: 0,
    borderColor: CommonColors.separator
  },
  headerItem: {
    flexDirection: 'column',
    width: '50@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Fonts.NotoSans,
    fontSize: '12@s',
    color: CommonColors.mainText
  }
})