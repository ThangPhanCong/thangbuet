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
  state = {
    isShowModalOrder: false,
    data: {}
  };

  static TYPE = {
    LIMIT: 'limit',
    STOP_LIMIT: 'stop_limit',
    STOP_MARKET: 'stop_market',
  };

  _onShowModalOrder() {
    this.setState({
      isShowModalOrder: true
    })
  }

  _onHideModalOrder() {
    this.setState({
      isShowModalOrder: false,
      data: {}
    })
  }


  _loadData(data) {
    this.setState({data})
  }

  _renderType(type) {
    return I18n.t(`orderForm.confirmOrder.${type}`);
  }

  render() {
    const { sendOrderRequest } = this.props;
    const { data, isShowModalOrder} = this.state;
    const tradeTypeBuy =  data && data.trade_type ? data.trade_type === 'buy' : null;
    const dataType = this._renderType(data.type);
    const typeStop = data.type === ModalConfirmOrder.TYPE.STOP_LIMIT ||  data.type === ModalConfirmOrder.TYPE.STOP_MARKET;

    return(
      <Modal
        animationType="slide"
        backdropColor='red'
        visible={isShowModalOrder}
        onBackdropPress={() => this._onHideModalOrder()}
        onRequestClose={() => {
        }}>
        <Card containerStyle={styles.containerCard}>
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
              <Text style={styles.textDataOrder}>{I18n.t(`currency.${data.coin}.fullname`) + ' (' + getCurrencyName(data.coin) + ' ' + getCurrencyName(data.currency) + ')'}</Text>
              <Text style={styles.textDataOrder}>{formatCurrency(data.quantity, data.coin, 0) +  ' ' + getCurrencyName(data.coin)}</Text>
              <Text style={styles.textDataOrder}>{formatCurrency(data.price, data.currency, 0) +  ' ' + getCurrencyName(data.currency)}</Text>

              <View style={styles.tradeTypeContainer}>
                <Text style={styles.titleType}>{dataType}</Text>
                <Text style={tradeTypeBuy ? styles.tradeTypeBuy : styles.tradeTypeSell}>{
                  tradeTypeBuy ? I18n.t('orderForm.confirmOrder.buy') : I18n.t('orderForm.confirmOrder.sell')
                }</Text>
                <Text style={styles.titleType}> {I18n.t('orderForm.confirmOrder.order')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.questionOrder}>
            <Text style={styles.textQuestion}>{I18n.t('orderForm.confirmOrder.question')}</Text>
            {typeStop ? <Text style={styles.textQuestionBold}>{I18n.t('orderForm.confirmOrder.questionStop')}</Text> : null}
            <Text style={styles.textQuestionBold}>{I18n.t('orderForm.confirmOrder.question1')}</Text>
            <Text style={styles.textQuestion}>{I18n.t('orderForm.confirmOrder.question2')}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => this._onHideModalOrder()}>
              <View style={styles.cancelContainer}>
                <Text style={styles.textCancel}>{I18n.t('orderForm.confirmOrder.cancel')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => sendOrderRequest(data)}>
              <View style={styles.confirmContainer}>
                <Text style={styles.textConfirm}>{I18n.t('orderForm.confirmOrder.confirm')}</Text>
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