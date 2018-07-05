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
        <View style={{
          flexDirection: 'row', flex: 1, marginLeft: scale(8),
        }}>
          <TouchableWithoutFeedback onPress={sortDate ? () => sortDate() : () => {
          }}>
            <View style={{ width: scale(50), flexDirection: 'row' }}>
              <Text style={styles.headerTitle}>{I18n.t('transactions.time')}</Text>
              {renderArrowDate}
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={sortPair ? () => sortPair() : () => {
          }}>
            <View style={styles.headerCoinPair}>
              <Text style={styles.headerTitle}>{I18n.t('transactions.pair')}</Text>
              {renderArrowPair}
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

          <View style={[styles.headerItem, { marginRight: scale(10) }]}>
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
    height: '50@s',
    backgroundColor: '#f8f9fb',
    alignItems: 'center',
    borderWidth: '1@s',
    borderColor: CommonColors.separator
  },
  headerItem: {
    flexDirection: 'column',
    width: scale(100),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '12@s',
    color: CommonColors.mainText
  },
  headerCoinPair: {
    flexDirection: 'row',
    width: '50@s',
    marginLeft: '20@s'
  }
})