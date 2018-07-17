import React, {Component} from "react";
import { Text, View } from "react-native";
import ScaledSheet from "../../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, Fonts } from "../../../utils/CommonStyles";


class HeaderTransactionsRight extends Component {
  render() {
    const {titles} = this.props;

    return(
      <View style={styles.headerContainer}>
        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[0]}</Text>
        </View>

        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[1]}</Text>
        </View>

        <View style={styles.headerItem}>
          <Text style={styles.headerTitle}>{titles[2]}</Text>
        </View>

        <View style={styles.headerLastItem}>
          <Text style={styles.headerTitle}>{titles[3]}</Text>
        </View>
      </View>
    )
  }
}

export default HeaderTransactionsRight;

const styles = ScaledSheet.create({
  headerContainer: {
    flexDirection: 'row',
    height: '40@s',
    backgroundColor: '#f8f9fb',
    borderWidth: '1@s',
    borderColor: CommonColors.separator
  },
  headerTitle: {
    fontSize: '12@s',
    color: CommonColors.mainText,
    ...Fonts.NotoSans
  },
  headerItem: {
    flexDirection: 'column',
    width: '75@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerLastItem: {
    flexDirection: 'column',
    width: '70@s',
    marginLeft: '10@s',
    alignItems: 'center',
    justifyContent: 'center',
  },
})