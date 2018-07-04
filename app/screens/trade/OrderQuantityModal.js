import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import Modal from "react-native-modal";
import ModalDropdown from 'react-native-modal-dropdown';
import { Icon } from 'react-native-elements';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import BaseScreen from '../BaseScreen'
import CurrencyInput from '../common/CurrencyInput';
import I18n from '../../i18n/i18n';
import rf from '../../libs/RequestFactory';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import Events from '../../utils/Events';
import Utils from '../../utils/Utils';
import Consts from '../../utils/Consts'
import OrderUtils from '../../utils/OrderUtils';

export default class OrderQuantityModal extends BaseScreen {
  state = {
    quantity: '',
    quantityPrecision: 4,
    tradeType: Consts.TRADE_TYPE_BUY,
    price: undefined
  };
  balances = {};

  componentDidMount() {
    super.componentDidMount();
    this._loadData();
  }

  getSocketEventHandlers() {
    return {
      BalanceUpdated: this._onBalanceUpdated.bind(this)
    }
  }

  getDataEventHandlers() {
    return {
      [Events.ORDER_BOOK_SETTINGS_UPDATED]: this._onOrderBookSettingsUpdated.bind(this)
    };
  }

  async _loadData() {
    await Promise.all([
      this._loadCoinSettings(),
      this._loadBalances(),
      this._getOrderBookSettings()
    ]);
  }

  async _loadCoinSettings() {
    const masterdata = await rf.getRequest('MasterdataRequest').getAll();
    const settings = masterdata.coin_settings.find(item => {
      return item.currency == this._getCurrency() && item.coin == this._getCoin()
    });
    this.setState({
      quantityPrecision: Utils.getPrecision(settings.minimum_quantity)
    });
  }

  async _loadBalances() {
    try {
      let response = await rf.getRequest('UserRequest').getBalance();
      this._onBalanceUpdated(response.data);
    } catch (error) {
      console.log('OrderForm._getBalance', error);
    }
  }

  async _getOrderBookSettings() {
    const params = {
      currency: this._getCurrency(),
      coin: this._getCoin()
    };
    const response = await rf.getRequest('UserRequest').getOrderBookSettings(params);
    this._onOrderBookSettingsUpdated(response.data);
  }

  _onBalanceUpdated(balances) {
    this.balances = Object.assign({}, this.balances, balances);
  }

  _onOrderBookSettingsUpdated(settings) {
    this.settingsOrderConfirmation = settings.order_confirmation;
  }

  _getCoin() {
    return this.props.coin;
  }

  _getCurrency() {
    return this.props.currency;
  }

  showModal(tradeType, price) {
    this.setState({
      tradeType: tradeType,
      price: price,
      modalVisible: true
    });
  }

  hideModal() {
    this.setState({ modalVisible: false });
  }

  _onQuantityChanged(formatted, extracted) {
    let quantity = OrderUtils.getMaskInputValue(formatted, extracted);
    this.setState({ quantity });
  }

  _onPressPercent(index) {
    const percent = 100 - index * 10;
    const balanceData = this._getBalance();
    const balance = balanceData.available_balance || 0;
    const maxQuantity = this._isBuyOrder() ? BigNumber(balance).div(this.state.price).toString() : balance;
    let quantity = BigNumber(maxQuantity).times(percent).div(100).toString();
    this.setState({ quantity });
  }

  _getBalance() {
    if (this._isBuyOrder()) {
      return this.balances[this._getCurrency()] || {};
    } else {
      return this.balances[this._getCoin()] || {};
    }
  }

  _isBuyOrder() {
    return this.state.tradeType == Consts.TRADE_TYPE_BUY;
  }

  _onPressSubmit() {
    var data = {
      trade_type: this.state.tradeType,
      currency: this._getCurrency(),
      coin: this._getCoin(),
      type: Consts.ORDER_TYPE_LIMIT,
      quantity: this.state.quantity,
      price: this.state.price
    };
    var errors = OrderUtils.validateOrderInput(data);
    if (errors.length > 0) {
      this._showError(errors[0].message);
      return;
    }
    if (this.settingsOrderConfirmation) {
      this.confirmCreateOrder(data);
    } else {
      this._sendOrderRequest(data);
    }
  }

  confirmCreateOrder(data) {
    this._sendOrderRequest(data);
  }

  async _sendOrderRequest(data) {
    this.hideModal();
    try {
      await rf.getRequest('OrderRequest').createANewOne(data);
    } catch(error) {
      if (!error.response) {
        self._showError(window.i18n.t('common.message.network_error'));
      } else {
        self._showError(error.response.data.message);
      }
    };
  }

  _showError(message) {
    //TODO show error
    console.log(message);
  }

  render() {
    return (
      <View>
        <Modal
          animationType="slide"
          isVisible={this.state.modalVisible}
          backdropColor={'black'}
          backdropOpacity={0.3}>
          <View style={styles.popup}>
            {this._renderHeader()}
            {this._renderContent()}
          </View>
        </Modal>
      </View>
    );
  }

  _renderHeader() {
    const typeText = I18n.t('orderForm.' + this.state.tradeType);
    const isBuyOrder = this.state.tradeType == Consts.TRADE_TYPE_BUY;
    const typeColor = isBuyOrder ? CommonColors.increased : CommonColors.decreased;
    return (
      <View style={styles.popupHeader}>
        <Text style={[styles.title, {color: typeColor}]}>{typeText}</Text>
        <Text style={styles.title}> {I18n.t('orderForm.quantity')}</Text>
      </View>
    );
  }

  _renderContent() {
    let items = [];
    for (let i = 100; i > 0; i-= 10) {
      items.push(i + '%');
    }
    return (
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <CurrencyInput
            value={this.state.quantity}
            precision={this.state.quantityPrecision}
            onChangeText={this._onQuantityChanged.bind(this)}
            keyboardType='numeric'
            style={styles.inputText}
            underlineColorAndroid='transparent'/>
          <View style={styles.caretContainer}>
            <Icon name='triangle-down' type='entypo' size={scale(18)}/>
          </View>
        <ModalDropdown
          defaultValue={''}
          style={styles.percentButton}
          textStyle={styles.percentButtonText}
          dropdownStyle={styles.percentDropdown}
          dropdownTextStyle={styles.percentDropdownText}
          renderSeparator={() => <View style={styles.separator}/>}
          options={items}
          onSelect={this._onPressPercent.bind(this)}/>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={this._onPressSubmit.bind(this)}>
          <Text style={styles.updateButtonText}>{I18n.t('orderBookSettings.update')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const margin = scale(30);
const inputHeight = scale(30);

const styles = ScaledSheet.create({
  popup: {
    width: '200@s',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: '5@s'
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: scale(40)
  },
  title: {

  },

  content: {

  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: inputHeight,
    marginLeft: margin,
    marginRight: margin,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: '3@s'
  },
  inputText: {
    flex: 1,
    height: inputHeight,
    paddingLeft: '5@s',
    paddingRight: '5@s',
    textAlign: 'right'
  },
  caretContainer: {
    width: inputHeight,
    height: inputHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: '#D9D9D9'
  },

  percentButton: {
    width: inputHeight,
    height: inputHeight,
    position: 'absolute',
    right: 0
  },
  percentButtonText: {
    width: inputHeight,
    height: inputHeight,
    color: '#0000'
  },
  percentDropdown: {
    width: '100@s',
  },
  percentDropdownText: {
    height: '30@s',
    color: '#000',
    textAlign: 'center',
    borderColor: '#0000'
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5'
  },

  updateButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '30@s',
    margin: margin,
    marginTop: '15@s',
    borderRadius: scale(3),
    backgroundColor: '#007AC5'
  },
  updateButtonText: {
    color: '#FFF'
  }
});