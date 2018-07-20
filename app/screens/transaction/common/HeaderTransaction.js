import React, { Component } from 'react';
import I18n from "../../../i18n/i18n";
import ScaledSheet from "../../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, Fonts } from "../../../utils/CommonStyles";
import { Text, TouchableWithoutFeedback, View } from "react-native";

class HeaderTransaction extends Component {
  render() {
    const { sortDate, sortPair, renderArrowDate, renderArrowPair } = this.props;

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
  headerTitle: {
    fontSize: '12@s',
    color: CommonColors.mainText,
    ...Fonts.NotoSans
  },
  headerCoinPair: {
    flexDirection: 'row',
    width: '100@s',
    justifyContent: 'center',
  },
  viewHeaderLeft: {
    flexDirection: 'row',
    width: '148@s',
    alignItems: 'center',
  },
  headerTime: {
    width: '50@s',
    flexDirection: 'row',
    marginLeft: '2@s'
  },
})