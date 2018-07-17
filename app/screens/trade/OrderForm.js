import React from 'react';
import {
  Image,
  Keyboard,
  NativeModules,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { Icon } from 'react-native-elements';
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
import { CommonColors, CommonSize, CommonStyles, Fonts } from '../../utils/CommonStyles';
import { getCurrencyName, formatCurrency } from '../../utils/Filters';
import OrderBook from './OrderBook';
import OrderBookSettingModal from './OrderBookSettingModal';


const mask = NativeModules.RNTextInputMask.mask
const unmask = NativeModules.RNTextInputMask.unmask
const setMask = NativeModules.RNTextInputMask.setMask

export default class OrderForm extends BaseScreen {

  static INPUT_TYPE = 'type';
  static INPUT_PRICE = 'price';
  static INPUT_QUANTITY = 'quantity';
  static INPUT_TOTAL = 'total';
  static INPUT_STOP = 'stop';

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

      enableQuantity: true,
      settingsOrderConfirmation: undefined,

      focusedInput: undefined
    }
    this.balances = {};
    this.types = [
      { type: Consts.ORDER_TYPE_LIMIT, label: I18n.t('orderForm.limit') },
      { type: Consts.ORDER_TYPE_MARKET, label: I18n.t('orderForm.market') },
      { type: Consts.ORDER_TYPE_STOP_LIMIT, label: I18n.t('orderForm.stopLimit') },
      { type: Consts.ORDER_TYPE_STOP_MARKET, label: I18n.t('orderForm.stopMarket') }
    ];
    this.prefillAmounts = [50000, 100000, 300000, 500000, 1000000, 1500000, 2000000, 3000000, 5000000];
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
      [Events.ORDER_BOOK_SETTINGS_UPDATED]: this._onOrderBookSettingsUpdated.bind(this),
      [Events.ORDER_BOOK_ROW_PRESSED]: this._onOrderBookRowClicked.bind(this)
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
      this._getFeeRate(),
      this._getOrderBookSettings()
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

  async _getOrderBookSettings() {
    const params = {
      currency: this._getCurrency(),
      coin: this._getCoin()
    };
    const response = await rf.getRequest('UserRequest').getOrderBookSettings(params);
    this._onOrderBookSettingsUpdated(response.data);
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

  _onOrderBookSettingsUpdated(settings) {
    this.settingsOrderConfirmation = settings.order_confirmation;
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
    if (data.orderBookType != OrderBook.TYPE_SMALL) {
      return;
    }

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
      this._confirmCreateOrder(data);
    } else {
      this._sendOrderRequest(data);
    }
  }

  _confirmCreateOrder(data) {
    this._sendOrderRequest(data);
  }

  async _sendOrderRequest(data) {
    try {
      await rf.getRequest('OrderRequest').createANewOne(data);
    } catch(error) {
      if (!error.errors) {
        this._showError(I18n.t('common.message.network_error'));
      } else {
        this._showError(error.message);
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
      <TouchableWithoutFeedback onPress={this._openTypeMenu.bind(this)}>
        <View style={styles.inputValue} ref={ref => this._typeRef = ref}>
          <View style={styles.caretDown}>
            {this._renderCaretDownIcon()}
          </View>
          <View style={styles.typeButton}>
            <Text style={styles.typeLabel}>
              {this._getOrderTypeText() + ' ' + I18n.t('orderForm.order')}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _renderCaretDownIcon() {
    return (
      <Icon name='triangle-down' type='entypo' size={scale(15)}/>
    );
  }

  _openTypeMenu() {
    const items= this.types.map(item => item.label + ' ' + I18n.t('orderForm.order'));
    const options = {
      sourceView: this._typeRef,
      onSelectItem: this._onTypeSelected.bind(this),
      dropdownStyle: styles.typeDropdown,
      itemButtonStyle: styles.typeDropdownButton,
      itemTextStyle: styles.typeDropdownText
    };
    this.notify(Events.SHOW_TRADE_SCREEN_DROPDOWN, { items, options });
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
    const inputBorderStyle = this._getInputBorderStyle(OrderForm.INPUT_PRICE);
    return (
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{I18n.t('orderForm.price')}</Text>
        <View style={[styles.inputValue, this._isMarketOrder() ? styles.disabled : {}, inputBorderStyle]}>
          <CurrencyInput
            value={this.state.price}
            precision={0}
            editable={!this._isMarketOrder()}
            onChangeText={(formatted, extracted) => this._onPriceChanged(this._getMaskInputValue(formatted, extracted))}
            onFocus={() => this.setState({focusedInput: OrderForm.INPUT_PRICE})}
            onBlur={() => this.setState({focusedInput: undefined})}
            keyboardType='numeric'
            style={[styles.inputText, {textAlign: 'center'}]}
            underlineColorAndroid='transparent'/>
        </View>
      </View>
    );
  }

  _getInputBorderStyle(input) {
    return this.state.focusedInput == input ? { borderColor: focusedBorderColor} : {};
  }

  _getCaretBorderStyle(input) {
    let style = {};
    if (this.state.focusedInput == input) {
      style = {
        borderColor: focusedBorderColor,
        borderLeftColor: '#95CCDE'
      };
    }
    return style;
  }

  _renderStopInput() {
    const inputBorderStyle = this._getInputBorderStyle(OrderForm.INPUT_STOP);
    return (
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{I18n.t('orderForm.stop')}</Text>
        <View style={[styles.inputValue, inputBorderStyle]}>
          <CurrencyInput
            value={this.state.stop}
            precision={0}
            onChangeText={this._onStopChanged.bind(this)}
            onFocus={() => this.setState({focusedInput: OrderForm.INPUT_STOP})}
            onBlur={() => this.setState({focusedInput: undefined})}
            keyboardType='numeric'
            style={[styles.inputText, {textAlign: 'center'}]}
            underlineColorAndroid='transparent'/>
        </View>
      </View>
    );
  }

  _renderQuantityInput() {
    const inputBorderStyle = this._getInputBorderStyle(OrderForm.INPUT_QUANTITY);
    const caretBorderStyle = this._getCaretBorderStyle(OrderForm.INPUT_QUANTITY);
    const enableQuantity = this.state.enableQuantity;
    return (
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{I18n.t('orderForm.quantity')}</Text>
        <View style={[styles.inputValue, {borderRightWidth: 0}, !enableQuantity ? styles.disabled : {}, inputBorderStyle]}>
          <View ref={ref => this._quantityRef = ref} style={styles.quantityDropdownAnchor}/>
          <CurrencyInput
            refInput={ref => this._quantityInput = ref}
            value={this.state.quantity}
            precision={4}
            onChangeText={this._onQuantityChanged.bind(this)}
            onFocus={() => this.setState({enableQuantity: true, focusedInput: OrderForm.INPUT_QUANTITY})}
            onBlur={() => this.setState({focusedInput: undefined})}
            keyboardType='numeric'
            style={styles.inputText}
            underlineColorAndroid='transparent'/>
            <TouchableWithoutFeedback onPress={this._openQuantityDropdown.bind(this)}>
              <View style={[styles.caretButton, caretBorderStyle]}>
                {this._renderCaretDownIcon()}
              </View>
            </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }

  _openQuantityDropdown() {
    Keyboard.dismiss();
    let items = [];
    for (let i = 100; i > 0; i-= 10) {
      items.push(i + '%');
    }
    const options = {
      sourceView: this._quantityRef,
      onSelectItem: this._onQuantityItemSelected.bind(this),
      dropdownStyle: styles.quantityDropdown,
      itemButtonStyle: styles.quantityDropdownButton,
      itemTextStyle: styles.quantityDropdownText,
      separatorStyle: styles.quantityDropdownSeparator
    };
    this.notify(Events.SHOW_TRADE_SCREEN_DROPDOWN, { items, options });
  }

  _onQuantityItemSelected(index) {
    let { type, price, coinBalance, currencyBalance } = this.state;
    const percent = 100 - index * 10;

    let newState = { enableQuantity: true };
    if (this._isBuyOrder()) {
      if (price) {
        newState.quantity = BigNumber(currencyBalance).div(price).times(percent).div(100).toString();
      }
    } else {
      newState.quantity = BigNumber(coinBalance).times(percent).div(100).toString();
    }
    if (newState.quantity && type == Consts.ORDER_TYPE_LIMIT && price) {
      newState.total = newState.quantity ? BigNumber(price).times(newState.quantity).toString() : '';
    }
    this.setState(newState);
  }

  _renderTotalInput() {
    const inputBorderStyle = this._getInputBorderStyle(OrderForm.INPUT_TOTAL);
    const caretBorderStyle = this._getCaretBorderStyle(OrderForm.INPUT_TOTAL);
    const enableQuantity = this.state.enableQuantity;
    return (
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>{I18n.t('orderForm.total')}</Text>
        <View style={[
          styles.inputValue,
          {borderRightWidth: 0},
          enableQuantity || this._isMarketOrder() ? styles.disabled : {},
          inputBorderStyle]}>
          <View ref={ref => this._totalRef = ref} style={styles.quantityDropdownAnchor}/>
          <CurrencyInput
            refInput={ref => this._totalInput = ref}
            value={this.state.total}
            precision={4}
            editable={!this._isMarketOrder()}
            onChangeText={this._onTotalChanged.bind(this)}
            onFocus={() => this.setState({enableQuantity: false, focusedInput: OrderForm.INPUT_TOTAL})}
            onBlur={() => this.setState({focusedInput: undefined})}
            keyboardType='numeric'
            style={styles.inputText}
            underlineColorAndroid='transparent'/>
            <TouchableWithoutFeedback onPress={this._openTotalDropdown.bind(this)}>
              <View style={[styles.caretButton, caretBorderStyle]}>
                {this._renderCaretDownIcon()}
              </View>
            </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }

  _openTotalDropdown() {
    Keyboard.dismiss();
    let items = [];
    for (let item of this.prefillAmounts) {
      items.push(item / 10000 + I18n.t('orderForm.tenThousand'));
    }
    for (let i = 100; i > 0; i-= 10) {
      items.push(i + '%');
    }
    const options = {
      sourceView: this._totalRef,
      onSelectItem: this._onTotalItemSelected.bind(this),
      dropdownStyle: styles.quantityDropdown,
      itemButtonStyle: styles.quantityDropdownButton,
      itemTextStyle: styles.quantityDropdownText,
      separatorStyle: styles.quantityDropdownSeparator
    };
    this.notify(Events.SHOW_TRADE_SCREEN_DROPDOWN, { items, options });
  }

  _onTotalItemSelected(index) {
    const { type, price } = this.state;
    let total = this._getSelectedTotal(index);

    let newState = {
      enableQuantity: false,
      total: total
    };
    if (type == Consts.ORDER_TYPE_LIMIT && price) {
      newState.quantity = total ? this.floor(BigNumber(total).div(price), 4) : '';
    }
    this.setState(newState);
  }

  _getSelectedTotal(index) {
    if (index < this.prefillAmounts.length) {
      return this.prefillAmounts[index];
    } else {
      let percent = 100 - (index - this.prefillAmounts.length) * 10;
      if (this._isBuyOrder()) {
        let { price, coinBalance, currencyBalance } = this.state;
        if (price) {
          return BigNumber(currencyBalance).times(percent).div(100).toString();
        }
      } else {
        return BigNumber(coinBalance).times(price).times(percent).div(100).toString();
      }
    }
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
      <View style={styles.submitGroup}>
        <TouchableOpacity
          style={[styles.submitButton, this._isBuyOrder() ? styles.submitBuy : styles.submitSell]}
          onPress={this._onPressSubmit.bind(this)}>
          <Text style={styles.submitText}>
            {getCurrencyName(this._getCoin()) + ' / ' + getCurrencyName(this._getCurrency())
              + ' ' + this._getOrderTypeText() + ' ' + this._getTradeTypeText()}
          </Text>
        </TouchableOpacity>
      </View>
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
const dropdownRowHeight = scale(33);
const inputHeight = scale(33);
const inputBotderRadius = scale(3);
const focusedBorderColor = '#0AB8F2';

const styles = ScaledSheet.create({
  inputGroup: {
    flex: 0.521,
    margin: margin,
    marginTop: margin * 1.5,
    justifyContent: 'space-between'
  },
  inputRow: {
    height: inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    width: scale(55),
    fontSize: '11@s',
    ...Fonts.NotoSans
  },
  inputValue: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: inputBotderRadius
  },
  inputText: {
    flex: 1,
    height: '100%',
    padding: margin,
    paddingTop: 0,
    paddingBottom: 0,
    textAlign: 'right',
    fontSize: '13@s',
    ...Fonts.OpenSans
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
    textAlign: 'center',
    fontSize: '12@s',
    ...Fonts.NotoSans
  },
  caretDown: {
    width: '18@s',
    position: 'absolute',
    right: '7@s'
  },
  caretButton: {
    width: inputHeight,
    height: inputHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderTopRightRadius: inputBotderRadius,
    borderBottomRightRadius: inputBotderRadius,
    backgroundColor: '#FCFBFB'
  },
  typeDropdown: {
    height: dropdownRowHeight * 4,
    backgroundColor: '#FFF'
  },
  typeDropdownButton: {
    width: '100%',
    height: dropdownRowHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  typeDropdownText: {
    color: '#000',
    textAlign: 'center',
    fontSize: '12@s',
    ...Fonts.NotoSans
  },

  quantityDropdownAnchor: {
    position: 'absolute',
    right: 0,
    width: '80@s',
    height: '100%',
    backgroundColor: '#0000'
  },
  quantityDropdown: {
    marginTop: 1,
    backgroundColor: '#FFF',
    borderRadius: '3@s'
  },
  quantityDropdownButton: {
    width: '100%',
    height: '30@s',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  quantityDropdownText: {
    color: '#000',
    textAlign: 'center',
    fontSize: '12@s',
    ...Fonts.OpenSans
  },
  quantityDropdownSeparator: {
    height: 1,
    width: '100%',
    backgroundColor: '#F0F0F0'
  },

  estimationValues: {
    flex: 0.38,
    marginLeft: margin,
    marginRight: margin,
    marginTop: '2@s',
    marginBottom: '2@s',
    borderTopWidth: 1,
    borderLeftWidth: 1,
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
    borderWidth: 1,
    borderTopColor: '#F6F5F5',
    borderLeftColor: '#F6F5F5',
    borderBottomColor: '#E7E5E5',
    borderRightColor: '#E7E5E5'
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
    borderWidth: 1,
    borderTopColor: '#F6F5F5',
    borderLeftColor: '#F6F5F5',
    borderBottomColor: '#E7E5E5',
    borderRightColor: '#E7E5E5'
  },
  estimateLabel: {
    fontSize: '11@s',
    ...Fonts.NotoSans
  },
  estimateValue: {
    fontSize: '12@s',
    ...Fonts.OpenSans
  },
  insideText: {
    fontSize: '8@s',
    width: '22@s',
    marginTop: '2@s',
    marginLeft: '5@s'
  },

  submitGroup: {
    flex: 0.18,
    justifyContent: 'center'
  },
  submitButton: {
    height: '30.5@s',
    marginLeft: margin,
    marginRight: margin,
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
    color: '#FFF',
    fontSize: '11@s',
    ...Fonts.NotoSans
  }
});