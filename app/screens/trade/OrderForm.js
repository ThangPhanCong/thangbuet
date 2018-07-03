import React from 'react';
import {
  Image,
  NativeModules,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import BigNumber from 'bignumber.js';
import CurrencyInput from '../common/CurrencyInput';
import BaseScreen from '../BaseScreen'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n';
import Events from '../../utils/Events';

import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import Utils from '../../utils/Utils';
import Consts from '../../utils/Consts'
import OrderUtils from '../../utils/OrderUtils';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import { getCurrencyName, formatCurrency } from '../../utils/Filters';
import OrderBook from './OrderBook';
import OrderBookSettingModal from './OrderBookSettingModal';


const mask = NativeModules.RNTextInputMask.mask
const unmask = NativeModules.RNTextInputMask.unmask
const setMask = NativeModules.RNTextInputMask.setMask

export default class OrderForm extends BaseScreen {

  constructor(props) {
    super(props)
    this.state = {
      type: Consts.ORDER_TYPE_LIMIT,
      price: undefined,
      stop: undefined,
      quantity: undefined,
      total: undefined,

      currencyBalance: undefined,
      coinBalance: undefined,
      coinSetting: {},

      enableQuantity: true

    }
    this.balances = {};
    this.types = [
      { type: Consts.ORDER_TYPE_LIMIT, label: I18n.t('orderForm.limit') },
      { type: Consts.ORDER_TYPE_MARKET, label: I18n.t('orderForm.market') },
      { type: Consts.ORDER_TYPE_STOP_LIMIT, label: I18n.t('orderForm.stopLimit') },
      { type: Consts.ORDER_TYPE_STOP_MARKET, label: I18n.t('orderForm.stopMarket') }
    ];
    this.percents = [
      { value: 10, label: '10%' }, { value: 20, label: '20%' }, { value: 30, label: '30%' }, { value: 40, label: '40%' },
      { value: 50, label: '50%' }, { value: 60, label: '60%' }, { value: 70, label: '70%' }, { value: 80, label: '80%' },
      { value: 90, label: '90%' }, { value: 100, label: '100%' }
    ];
    this.krws = [
      { value: 50, label: '50K KRW' }, { value: 100, label: '100K KRW' }, { value: 300, label: '300K KRW' },
      { value: 500, label: '500K KRW' }, { value: 1000, label: '1000K KRW' }, { value: 1500, label: '1500K KRW' },
      { value: 2000, label: '2000K KRW' }, { value: 3000, label: '3000K KRW' }, { value: 5000, label: '5000K KRW' }
    ];
  }

  componentDidMount() {
    super.componentDidMount()
    let { coin, currency } = this.props
    if (coin && currency) {
      this._loadData()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.currency != this.props.currency || prevProps.coin != this.props.coin) {
      this._loadData();
    }
  }

  getDataEventHandlers() {
    return {
      [Events.ORDER_BOOK_ROW_CLICKED]: this._onOrderBookRowClicked.bind(this)
    };
  }

  _getCurrency() {
    return this.props.currency;
  }

  _getCoin() {
    return this.props.coin;
  }

  async _loadData() {
    await Promise.all([
      this._getBalance(),
      this._getCoinSetting(),
      this._getFeeRate()
    ]);
  }

  async _getBalance() {
    try {
      let response = await rf.getRequest('UserRequest').getBalance();
      this._onBalanceUpdated(response.data);
    } catch (error) {
      console.log('OrderForm._getBalance', error);
    }
  }

  _onBalanceUpdated(balances) {
    this.balances = Object.assign({}, this.balances, balances);

    let newState = {};
    const currencyBalanceObject = this.balances[this._getCurrency()];
    if (currencyBalanceObject) {
      newState.currencyBalance = currencyBalanceObject.available_balance;
    }
    const coinBalance = this.balances[this._getCoin()];
    if (coinBalance) {
      newState.coinBalance = coinBalance.available_balance;
    }

    this.setState(newState);
  }

  async _getCoinSetting() {
    const { coin, currency } = this.props;
    let response = await rf.getRequest('MasterdataRequest').getAll();
    const coinSetting = response.coin_settings.find((item) => item.coin == coin && item.currency == currency);

    this.setState({
      coinSetting
    });
  }

  async _getFeeRate() {
    const response = await rf.getRequest('UserRequest').getCurrentUser();
    const user = response.data;

    const masterdata = await rf.getRequest('MasterdataRequest').getAll();
    let setting = masterdata.fee_levels.find(setting => user.fee_level == setting.level);

    this.setState({ feeRate: setting.fee });
  }

  _isBuyOrder() {
    return this.props.tradeType == Consts.TRADE_TYPE_BUY;
  }

  _isStopOrder() {
    const type = this.state.type;
    return type == Consts.ORDER_TYPE_STOP_LIMIT || type == Consts.ORDER_TYPE_STOP_MARKET;
  }

  _isMarketOrder() {
    const type = this.state.type;
    return type == Consts.ORDER_TYPE_MARKET || type == Consts.ORDER_TYPE_STOP_MARKET;
  }

  _onPriceChanged(price) {
    const {type, quantity, total, enableQuantity} = this.state;

    let newState = { price, enableQuantity };
    if (type == Consts.ORDER_TYPE_LIMIT) {
      if (enableQuantity && !quantity && total) {
        newState.enableQuantity = false;
      }
      if (!enableQuantity && quantity && !total) {
        newState.enableQuantity = true;
      }
      if (newState.enableQuantity) {
        newState.total = price && quantity ? BigNumber(quantity).times(price).toString() : '';
      } else {
        newState.quantity = price && total ? this.floor(BigNumber(total).div(price), 4).toString() : '';
      }
    }

    this.setState(newState);
  }

  floor(value, decimals) {
    return value.toFixed(decimals, BigNumber.ROUND_FLOOR);
  }

  _getMaskInputValue(formatted, extracted) {
    if (formatted.endsWith('.')) {
      return extracted;
    } else {
      return formatted;
    }
  }

  _onStopChanged(formatted, extracted) {
    let stop = this._getMaskInputValue(formatted, extracted);
    this.setState({ stop })
  }

  _onQuantityChanged(formatted, extracted) {
    let quantity = this._getMaskInputValue(formatted, extracted);
    const { type, enableQuantity, price } = this.state;

    let newState = { quantity };
    if (type == Consts.ORDER_TYPE_LIMIT && enableQuantity && price) {
      newState.total = quantity ? BigNumber(price).times(quantity).toString() : '';
    }
    this.setState(newState);
  }

  _onTotalChanged(formatted, extracted) {
    const {type, price, enableQuantity} = this.state;
    let total = this._getMaskInputValue(formatted, extracted);

    let newState = { total };
    if (type == Consts.ORDER_TYPE_LIMIT && !enableQuantity && price) {
      newState.quantity = total ? this.floor(BigNumber(total).div(price), 4) : '';
    }
    this.setState(newState);
  }

  _onOrderBookRowClicked(data) {
    this._onPriceChanged(data.price);
    if (this._isStopOrder()) {
      this.setState({ stop: data.price });
    }
  }

  _onPressSubmit() {
    var stopCondition = undefined;
    if (this._isStopOrder()) {
      if (this.state.stop) {
        if (BigNumber(this.state.stop).gte(BigNumber(this.state.currentPrice))) {
          stopCondition = 'ge';
        } else {
          stopCondition = 'le';
        }
      }
    }
    var data = {
      trade_type: this.props.tradeType,
      currency: this._getCurrency(),
      coin: this._getCoin(),
      type: this.state.type,
      ioc: true,
      quantity: this.state.quantity,
      price: this.state.price || undefined,
      base_price: this.state.stop,
      stop_condition: stopCondition
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
      <View style={CommonStyles.matchParent}>
        {this._renderInputs()}
        {this._isBuyOrder() && this._renderEstimationBuyValues()}
        {!this._isBuyOrder() && this._renderEstimationSellValues()}
        {this._renderSubmitButton()}
      </View>
    );
  }

  _renderInputs() {
    return (
      <View style={styles.inputGroup}>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>{I18n.t('orderForm.type')}</Text>
            {this._renderOrderType()}
        </View>

        {this._isStopOrder() && this._renderStopInput()}
        {this._renderPriceInput()}
        {this._renderQuantityInput()}
        {!this._isStopOrder() && this._renderTotalInput()}
      </View>
    );
  }

  _renderOrderType() {
    return (
      <View style={styles.inputValue}>
        <Image
          resizeMode={'contain'}
          style={styles.caretDown}
          source={require('../../../assets/common/caretdown.png')}/>
        <ModalDropdown
          defaultValue={this._getOrderTypeText() + ' ' + I18n.t('orderForm.order')}
          style={styles.typeButton}
          textStyle={styles.typeLabel}
          dropdownStyle={styles.typeDropdown}
          dropdownTextStyle={styles.typeDropdownText}
          renderSeparator={() => <View style={{height: 0}}/>}
          options={this.types.map(item => item.label + ' ' + I18n.t('orderForm.order'))}
          onSelect={this._onTypeSelected.bind(this)}/>
      </View>
    );
  }

  _onTypeSelected(index) {
    const type = this.types[index].type;
    let newState = { type }
    switch (type) {
      case Consts.ORDER_TYPE_LIMIT:
        newState.ioc = true;
        newState.basePrice = '';
        break;
      case Consts.ORDER_TYPE_MARKET:
        newState.price = '';
        newState.basePrice = '';
        newState.amount = '';
        newState.enableQuantity = true;
        break;
      case Consts.ORDER_TYPE_STOP_LIMIT:
        newState.ioc = true;
        newState.enableQuantity = true;
        break;
      case Consts.ORDER_TYPE_STOP_MARKET:
        newState.ioc = true;
        newState.price = '';
        newState.enableQuantity = true;
        break;
    }
    this.setState(newState);
  }

  _renderPriceInput() {
    return (
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{I18n.t('orderForm.price')}</Text>
        <View style={[styles.inputValue, this._isMarketOrder() ? styles.disabled : {}]}>
          <CurrencyInput
            value={this.state.price}
            precision={0}
            editable={!this._isMarketOrder()}
            onChangeText={(formatted, extracted) => this._onPriceChanged(this._getMaskInputValue(formatted, extracted))}
            keyboardType='numeric'
            style={styles.inputText}
            underlineColorAndroid='transparent'/>
        </View>
      </View>
    );
  }

  _renderStopInput() {
    return (
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{I18n.t('orderForm.stop')}</Text>
        <View style={styles.inputValue}>
          <CurrencyInput
            value={this.state.stop}
            precision={0}
            onChangeText={this._onStopChanged.bind(this)}
            keyboardType='numeric'
            style={styles.inputText}
            underlineColorAndroid='transparent'/>
        </View>
      </View>
    );
  }

  _renderQuantityInput() {
    const enableQuantity = this.state.enableQuantity;
    return (
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{I18n.t('orderForm.quantity')}</Text>
        <View style={[styles.inputValue, !enableQuantity ? styles.disabled : {}]}>
          <CurrencyInput
            value={this.state.quantity}
            precision={4}
            onChangeText={this._onQuantityChanged.bind(this)}
            onFocus={() => this.setState({enableQuantity: true})}
            keyboardType='numeric'
            style={styles.inputText}
            underlineColorAndroid='transparent'/>
        </View>
      </View>
    );
  }

  _renderTotalInput() {
    const enableQuantity = this.state.enableQuantity;
    return (
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{I18n.t('orderForm.total')}</Text>
        <View style={[styles.inputValue, enableQuantity || this._isMarketOrder() ? styles.disabled : {}]}>
          <CurrencyInput
            value={this.state.total}
            precision={4}
            editable={!this._isMarketOrder()}
            onChangeText={this._onTotalChanged.bind(this)}
            onFocus={() => this.setState({enableQuantity: false})}
            keyboardType='numeric'
            style={styles.inputText}
            underlineColorAndroid='transparent'/>
        </View>
      </View>
    );
  }

  _renderEstimationBuyValues() {
    const balance = this.state.currencyBalance;
    const currency = this._getCurrency();
    const coin = this._getCoin();
    return (
      <View style={styles.estimationValues}>
        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationBuyCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.balance')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>{formatCurrency(balance, currency)}</Text>
            <Text style={styles.insideText}>{getCurrencyName(currency)}</Text>
          </View>
        </View>

        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationBuyCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.estimateTotal')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>{this._getOrderTotal()}</Text>
            <Text style={styles.insideText}>{getCurrencyName(currency)}</Text>
          </View>
        </View>

        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationBuyCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.fee')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>{this._getOrderFee()}</Text>
            <Text style={styles.insideText}>{getCurrencyName(coin)}</Text>
          </View>
        </View>

        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationBuyCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.estimateQuantity')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>{this.state.quantity}</Text>
            <Text style={styles.insideText}>{getCurrencyName(coin)}</Text>
          </View>
        </View>
      </View>
    );
  }

  _getOrderTotal() {
    const { price, quantity } = this.state;
    if (price && quantity) {
      return BigNumber(price).times(quantity).toString();
    } else {
      return '';
    }
  }

  _getOrderFee() {
    const { price, quantity, feeRate } = this.state;
    if (this._isBuyOrder()) {
      if (quantity) {
        return BigNumber(quantity).times(feeRate).toString();
      } else {
        return '';
      }
    } else {
      if (quantity && price) {
        return BigNumber(quantity).times(price).times(feeRate).toString();
      } else {
        return '';
      }
    }
  }

  _renderEstimationSellValues() {
    const balance = this.state.coinBalance;
    const currency = this._getCurrency();
    const coin = this._getCoin();
    return (
      <View style={styles.estimationValues}>
        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationSellCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.balance')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>{formatCurrency(balance, coin)}</Text>
            <Text style={styles.insideText}>{getCurrencyName(coin)}</Text>
          </View>
        </View>
        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationSellCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.estimateTotal')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>{this.state.quantity}</Text>
            <Text style={styles.insideText}>{getCurrencyName(coin)}</Text>
          </View>
        </View>
        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationSellCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.fee')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>{this._getOrderFee()}</Text>
            <Text style={styles.insideText}>{getCurrencyName(currency)}</Text>
          </View>
        </View>
        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationSellCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.estimateQuantity')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>{this._getOrderTotal()}</Text>
            <Text style={styles.insideText}>{getCurrencyName(currency)}</Text>
          </View>
        </View>
      </View>
    );
  }

  _renderSubmitButton() {
    return (
      <TouchableOpacity
        style={[styles.submitButton, this._isBuyOrder() ? styles.submitBuy : styles.submitSell]}
        onPress={this._onPressSubmit.bind(this)}>
        <Text style={styles.submitText}>
          {getCurrencyName(this._getCoin()) + ' / ' + getCurrencyName(this._getCurrency())
            + ' ' + this._getOrderTypeText() + ' ' + this._getTradeTypeText()}
        </Text>
      </TouchableOpacity>
    );
  }

  _getOrderTypeText() {
    for (let orderType of this.types) {
      if (orderType.type == this.state.type) {
        return orderType.label;
      }
    }
  }

  _getTradeTypeText() {
    return this._isBuyOrder() ? I18n.t('orderForm.buy') : I18n.t('orderForm.sell');
  }
}

const margin = scale(10);
const dropdownRowHeight = scale(35);

const styles = ScaledSheet.create({
  inputGroup: {
    flex: 1,
    margin: margin,
    marginTop: margin * 1.5,
    justifyContent: 'space-between'
  },
  inputRow: {
    height: scale(38),
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    width: scale(60),
  },
  inputValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: scale(3)
  },
  inputText: {
    width: '100%',
    height: '100%',
    padding: margin,
    textAlign: 'right'
  },
  disabled: {
    backgroundColor: '#F4F3F4'
  },
  typeButton: {
    flex: 1,
    alignItems: 'stretch',
  },
  typeLabel: {
    paddingRight: margin,
    textAlign: 'center'
  },
  caretDown: {
    width: '10@s',
    position: 'absolute',
    right: '10@s'
  },
  typeDropdown: {
    width: '150@s',
    height: dropdownRowHeight * 4 + 4,
    marginTop: '12@s'
  },
  typeDropdownText: {
    height: dropdownRowHeight,
    color: '#000',
    textAlign: 'center',
    borderColor: '#0000'
  },

  estimationValues: {
    flex: 0.75,
    margin: margin,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E7E5E5'
  },
  estimationRow: {
    flex: 1,
    flexDirection: 'row'
  },
  estimationLeftCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#E7E5E5'
  },
  estimationBuyCell: {
    backgroundColor: '#FFF0F0'
  },
  estimationSellCell: {
    backgroundColor: '#E6EFF9'
  },
  estimationRightCell: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#E7E5E5'
  },
  estimateLabel: {
    fontSize: '12@s'
  },
  estimateValue: {
    fontSize: '12@s'
  },
  insideText: {
    fontSize: '10@s',
    width: '30@s',
    marginTop: '3@s',
    marginLeft: '5@s'
  },

  submitButton: {
    flex: 0.18,
    margin: margin,
    borderRadius: scale(3),
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitBuy: {
    backgroundColor: '#FF4E46'
  },
  submitSell: {
    backgroundColor: '#007AC5'
  },

  submitText: {
    color: '#FFF'
  }
});