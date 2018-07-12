import React, { Component } from 'react';
import { scale } from "../../../libs/reactSizeMatter/scalingUtils";
import I18n from "../../../i18n/i18n";
import ScaledSheet from "../../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors } from "../../../utils/CommonStyles";
import { Text, TouchableWithoutFeedback, View } from "react-native";

class HeaderTransaction extends Component {
  render() {
    const { sortDate, sortPair, renderArrowDate, renderArrowPair, titles } = this.props;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.viewHeaderLeft}>
          <TouchableWithoutFeedback onPress={sortDate ? () => sortDate() : () => {
          }}>
            <View style={styles.headerTime}>
              <Text style={styles.headerTitle}>{I18n.t('transactions.time')}</Text>
              {renderArrowDate}
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={sortPair ? () => sortPair() : () => {
          }}>
            <View style={styles.headerCoinPair}>
              <Text style={styles.headerTitle}>{I18n.t('transactions.pair')}</Text>
              <View>
                {renderArrowPair}

              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={{ flexDirection: 'row' }}>
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
      </View>
    )
  }
}

export default HeaderTransaction;

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
  headerTitle: {
    fontSize: '12@s',
    color: CommonColors.mainText,
    fontFamily: 'NotoSans-Regular'
  },
  headerCoinPair: {
    flexDirection: 'row',
    width: '100@s',
    justifyContent: 'center',
  },
  viewHeaderLeft: {
    flexDirection: 'row',
    width: '149@s',
    alignItems: 'center',
    borderRightColor: CommonColors.separator,
    borderRightWidth: '1@s',
  },
  headerTime: {
    width: '50@s',
    flexDirection: 'row',
    marginLeft: '2@s'
  },
})