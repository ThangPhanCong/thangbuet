import React, { Component } from "react";
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { CommonColors, Fonts } from "../../utils/CommonStyles";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal"
import { Card } from "react-native-elements";
import I18n from "../../i18n/i18n";
import { formatCurrency, getCurrencyName } from "../../utils/Filters";
import UIUtils from "../../utils/UIUtils";
import Consts from '../../utils/Consts'

class OrderConfirmationModal extends Component {
  state = {
    isModalVisible: false,
    data: {}
  };

  show(data, onConfirm) {
    this.setState({
      isModalVisible: true,
      data: data
    });
    this._onConfirm = onConfirm;
  }

  hide() {
    this.setState({
      isModalVisible: false
    })
  }

  render() {
    const { data, isModalVisible} = this.state;
    const isBuyOrder = data.trade_type === Consts.TRADE_TYPE_BUY;
    const dataType = I18n.t(`orderForm.confirmOrder.${data.type}`);
    const isStopOrder = data.type === Consts.ORDER_TYPE_STOP_LIMIT || data.type === Consts.ORDER_TYPE_STOP_MARKET;

    return(
      <Modal
        animationType="slide"
        backdropColor='red'
        visible={isModalVisible}
        onBackdropPress={() => this.hide()}
        onRequestClose={() => {
        }}>
        <View style={styles.popup}>
            <View style={styles.titleOrder}>
              <Text style={styles.textTitleOrder}>
                {I18n.t('orderForm.confirmOrder.titleConfirm')}
              </Text>
            </View>

          <View style={styles.orderContainer}>
            <View style={{flexDirection: 'column'}}>
              <Text style={styles.titleContainer}>{I18n.t('orderForm.confirmOrder.pair')}</Text>
              <Text style={styles.titleContainer}>{I18n.t('orderForm.confirmOrder.quantity')}</Text>
              <Text style={styles.titleContainer}>{I18n.t('orderForm.confirmOrder.price')}</Text>
              <Text style={styles.titleContainer}>{I18n.t('orderForm.confirmOrder.type')}</Text>
            </View>
            <View style={styles.dataOrder}>
              <Text style={styles.textDataOrder}>
                {I18n.t(`currency.${data.coin}.fullname`)
                  + ' (' + getCurrencyName(data.coin) + ' ' + getCurrencyName(data.currency) + ')'}
              </Text>
              <Text style={styles.textDataOrder}>
                {formatCurrency(data.quantity, data.coin, 0) +  ' ' + getCurrencyName(data.coin)}
              </Text>
              <Text style={styles.textDataOrder}>
                {formatCurrency(data.price, data.currency, 0) +  ' ' + getCurrencyName(data.currency)}
              </Text>

              <View style={styles.tradeTypeContainer}>
                <Text style={styles.titleType}>{dataType}</Text>
                <Text style={isBuyOrder ? styles.tradeTypeBuy : styles.tradeTypeSell}>{
                  isBuyOrder ? I18n.t('orderForm.confirmOrder.buy') : I18n.t('orderForm.confirmOrder.sell')
                }</Text>
                <Text style={styles.titleType}> {I18n.t('orderForm.confirmOrder.order')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.questionOrder}>
            <Text style={styles.textQuestion}>{I18n.t('orderForm.confirmOrder.question')}</Text>
            <Text style={styles.textQuestionBold}>
              {isStopOrder && I18n.t('orderForm.confirmOrder.questionStop')}
              {I18n.t('orderForm.confirmOrder.question1')}
            </Text>
            <Text style={styles.textQuestion}>{I18n.t('orderForm.confirmOrder.question2')}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => this.hide()}>
              <View style={styles.cancelContainer}>
                <Text style={styles.textCancel}>{I18n.t('orderForm.confirmOrder.cancel')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this._onPressConfirm()}>
              <View style={styles.confirmContainer}>
                <Text style={styles.textConfirm}>{I18n.t('orderForm.confirmOrder.confirm')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

      </Modal>
    );
  }

  _onPressConfirm() {
    this.hide();
    this._onConfirm && this._onConfirm();
  }
}

export default OrderConfirmationModal;

const styles = ScaledSheet.create({
  popup: {
    borderRadius: '5@s',
    marginStart: '5@s',
    marginEnd: '5@s',
    height: '250@s',
    flexDirection: 'column',
    backgroundColor: 'white',
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
    marginLeft: '63@s',
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
  },
  textQuestion: {
    fontSize: '12@s',
    ...Fonts.OpenSans
  },
  textQuestionBold: {
    fontSize: '12@s',
    ...Fonts.OpenSans_Bold
  }
});