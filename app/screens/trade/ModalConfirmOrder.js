import React, { Component } from "react";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import UIUtils from "../../utils/UIUtils";
import { CommonColors, Fonts } from "../../utils/CommonStyles";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal"
import { Card } from "react-native-elements";
import I18n from "../../i18n/i18n";
import { formatCurrency, getCurrencyName } from "../../utils/Filters";

class ModalConfirmOrder extends Component {
  render() {
    const { closeModalOrder, data, isShowModalOrder, sendOrderRequest } = this.props;
    const tradeTypeBuy = data.trade_type === 'buy';

    return(
      <Modal
        animationType="slide"
        backdropColor='red'
        visible={isShowModalOrder}
        onBackdropPress={closeModalOrder}
        onRequestClose={() => {
        }}>
        <Card containerStyle={styles.containerCard}>
            <View style={styles.titleOrder}>
              <Text style={styles.textTitleOrder}>
                Confirm Order Receipt
              </Text>
            </View>

          <View style={styles.orderContainer}>
            <View style={{flexDirection: 'column'}}>
              <Text style={styles.titleContainer}>Pair</Text>
              <Text style={styles.titleContainer}>Quantity</Text>
              <Text style={styles.titleContainer}>Price</Text>
              <Text style={styles.titleContainer}>Type</Text>
            </View>
            <View style={styles.dataOrder}>
              <Text style={styles.textDataOrder}>{I18n.t(`currency.${data.coin}.fullname`) + ' (' + getCurrencyName(data.coin) + ' ' + getCurrencyName(data.currency) + ')'}</Text>
              <Text style={styles.textDataOrder}>{formatCurrency(data.quantity, data.coin, 0) +  ' ' + getCurrencyName(data.coin)}</Text>
              <Text style={styles.textDataOrder}>{formatCurrency(data.price, data.currency, 0) +  ' ' + getCurrencyName(data.currency)}</Text>

              <View style={styles.tradeTypeContainer}>
                <Text style={styles.titleType}>{data.type}</Text>
                <Text style={tradeTypeBuy ? styles.tradeTypeBuy : styles.tradeTypeSell}>{
                  tradeTypeBuy ? ' Buy' : ' Sell'
                }</Text>
                <Text style={styles.titleType}> Order</Text>
              </View>
            </View>
          </View>

          <View style={styles.questionOrder}>
            <Text>Do you want to create this </Text>
            <Text>Order?</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={closeModalOrder}>
              <View style={styles.cancelContainer}>
                <Text style={styles.textCancel}>Cancel</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={sendOrderRequest}>
              <View style={styles.confirmContainer}>
                <Text style={styles.textConfirm}>Confirm</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

      </Modal>
    )
  }
}

export default ModalConfirmOrder;

const styles = ScaledSheet.create({
  containerCard: {
    borderRadius: '5@s',
    marginStart: '5@s',
    marginEnd: '5@s',
    height: '250@s',
    flexDirection: 'column',
    padding: 0,
    ...UIUtils.generateShadowStyle(5),
  },
  titleOrder: {
    height: '50@s',
    borderBottomWidth: '1@s',
    justifyContent: 'center',
    borderColor: '#E4E4E4'
  },
  textTitleOrder: {
    fontSize: '12@s',
    marginLeft: '10@s',
    color: '#525252'
  },
  orderContainer: {
    flexDirection: 'row',
    marginLeft: '51@s',
    marginRight: '25@s',
    marginTop: '20@s'
  },
  titleContainer: {
    fontSize: '12@s',
    textAlign: 'left',
    marginTop: '3@s'
  },
  cancelContainer: {
    backgroundColor: '#7F7F7F',
    height: '35@s',
    width: '100@s',
    borderRadius: '3@s',
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmContainer: {
    backgroundColor: '#006EBC',
    flexDirection:'row',
    borderRadius: '3@s',
    height: '35@s',
    width: '100@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textCancel: {
    fontSize: '12@s',
    color: '#FFF'
  },
  textConfirm: {
    fontSize: '12@s',
    color: '#FFF'
  },
  dataOrder: {
    flexDirection: 'column',
    marginLeft: '30@s'
  },
  questionOrder: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '15@s'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: '15@s'
  },
  titleType: {
    fontSize: '12@s',
    ...Fonts.OpenSans_Bold
  },
  tradeTypeBuy: {
    fontSize: '12@s',
    color: CommonColors.increased
  },
  tradeTypeSell: {
    fontSize: '12@s',
    color: CommonColors.decreased
  },
  textDataOrder: {
    fontSize: '12@s',
    textAlign: 'right',
    marginTop: '3@s'
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: '3@s'
  }
});