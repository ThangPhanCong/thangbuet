import React, { Component } from 'react';
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import I18n from "../../i18n/i18n";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, Fonts } from "../../utils/CommonStyles";
import { Text, TouchableWithoutFeedback, View } from "react-native";

class HeaderFunds extends Component {
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
              <View style={{flex: 1}}>
                <Text style={styles.headerTitle}>{I18n.t('transactions.pair')}</Text>
              </View>

              <View style={{flex: 2}}>
                {renderArrowPair}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  }
}

export default HeaderFunds;

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
    width: '80@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerBlockChainItem: {
    flexDirection: 'column',
    width: '90@s',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '12@s',
    color: CommonColors.mainText,
    ...Fonts.NotoSans,
  },
  headerCoinPair: {
    flexDirection: 'column',
    width: '70@s',
    marginLeft: '20@s',
  },
  viewHeaderLeft: {
    flexDirection: 'row',
    width: '118@s',
  },
  headerTime: {
    width: '50@s',
    flexDirection: 'row',
    marginLeft: '2@s',
    alignItems: 'center',
  }
})