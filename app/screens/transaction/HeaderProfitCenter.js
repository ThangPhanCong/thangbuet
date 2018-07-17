import React, {Component} from "react";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, Fonts } from "../../utils/CommonStyles";
import { Text, View } from "react-native";

class HeaderProfitCenter extends Component{
  render() {
    const {titles} = this.props;

    return(
      <View style={styles.headerContainer}>
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
      </View>
    )
  }

}

export default HeaderProfitCenter;

const styles = ScaledSheet.create({
  headerContainer: {
    flexDirection: 'row',
    height: '40@s',
    backgroundColor: '#f8f9fb',
    borderWidth: '0.5@s',
    borderColor: CommonColors.separator
  },
  headerItem: {
    flexDirection: 'column',
    width: '80@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Fonts.NotoSans,
    fontSize: '12@s',
    color: CommonColors.mainText
  }
})