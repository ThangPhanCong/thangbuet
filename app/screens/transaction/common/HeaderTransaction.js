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
          <TouchableWithoutFeedback onPress={() => sortDate()}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Text>{I18n.t('transactions.time')}</Text>
              {renderArrowDate}
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={() => sortPair()}>
            <View style={{ flexDirection: 'row', flex: 1.5 }}>
              <Text>{I18n.t('transactions.pair')}</Text>
              {renderArrowPair}
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Text style={{
            flex: 1, alignItems: 'flex-end',
          }}> {titles[0]}</Text>
          <Text style={{ flex: 1 }}>{titles[1]}</Text>
          <Text style={{ flex: 1 }}>{titles[2]}</Text>
          <Text style={{ flex: 1 }}>{titles[3]}</Text>
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
})