import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image
} from 'react-native';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Icon from 'react-native-vector-icons/FontAwesome';
import BaseScreen from '../BaseScreen'
import rf from '../../libs/RequestFactory'
import I18n from '../../i18n/i18n';

import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import Utils from '../../utils/Utils';
import Consts from '../../utils/Consts'
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import { getCurrencyName, formatCurrency } from '../../utils/Filters';
import OrderBook from './OrderBook';
import OrderBookSettingModal from './OrderBookSettingModal';

export default class OrderForm extends BaseScreen {

  constructor(props) {
    super(props)
    this.state = {
      selectedTab: Consts.TRADE_TYPE_BUY,
      type: Consts.ORDER_TYPE_LIMIT,
      currencyBalance: undefined,
      coinBalance: undefined,
    }
    this.balances = {};
    this.types = [
      { type: Consts.ORDER_TYPE_LIMIT, label: I18n.t('orderForm.limit') },
      { type: Consts.ORDER_TYPE_MARKET, label: I18n.t('orderForm.market') },
      { type: Consts.ORDER_TYPE_STOP_LIMIT, label: I18n.t('orderForm.stopLimit') },
      { type: Consts.ORDER_TYPE_STOP_MARKET, label: I18n.t('orderForm.stopMarket') }
    ]
    this.percents = [
      { value: 10, label: '10%' }, { value: 20, label: '20%' }, { value: 30, label: '30%' }, { value: 40, label: '40%' },
      { value: 50, label: '50%' }, { value: 60, label: '60%' }, { value: 70, label: '70%' }, { value: 80, label: '80%' },
      { value: 90, label: '90%' }, { value: 100, label: '100%' }
    ]
    this.krws = [
      { value: 50, label: '50K KRW' }, { value: 100, label: '100K KRW' }, { value: 300, label: '300K KRW' },
      { value: 500, label: '500K KRW' }, { value: 1000, label: '1000K KRW' }, { value: 1500, label: '1500K KRW' },
      { value: 2000, label: '2000K KRW' }, { value: 3000, label: '3000K KRW' }, { value: 5000, label: '5000K KRW' }
    ]
  }

  componentDidMount() {
    super.componentDidMount()
    let { coin, currency } = this.props
    if (coin && currency) {
      this._loadData()
    }
  }

  _getCurrency() {
    return this.props.currency;
  }

  _getCoin() {
    return this.props.coin;
  }

  async _loadData() {
    await this._getBalance();
  }

  async _getBalance() {
    let response = await rf.getRequest('UserRequest').getBalance();
    this._onBalanceUpdated(response.data);
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

  _typesSelected() {
    return true
  }

  render() {
    const tradeType = this.state.selectedTab;
    return (
      <View style={CommonStyles.matchParent}>
        {this._renderTabs()}
        {this._renderInputs()}
        {tradeType == Consts.TRADE_TYPE_BUY && this._renderEstimationBuyValues()}
        {tradeType == Consts.TRADE_TYPE_SELL && this._renderEstimationSellValues()}
        {this._renderSubmitButton()}
      </View>
    );
  }

  _renderTabs() {
    const isSelectedBuy = this.state.selectedTab == Consts.TRADE_TYPE_BUY;
    const isSelectedSell = this.state.selectedTab == Consts.TRADE_TYPE_SELL;
    return (
      <View style={styles.tabs}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.tab, isSelectedBuy ? styles.selectedBuy : {}]}
          onPress={() => this.setState({selectedTab: Consts.TRADE_TYPE_BUY})}>
          <Text style={[CommonStyles.priceIncreased]}>{I18n.t('orderForm.buy')}</Text>
        </TouchableOpacity>

        <View style={styles.tabSeparator}/>

        <TouchableOpacity
          activeOpacity={1}
          style={[styles.tab, isSelectedSell ? styles.selectedSell : {}]}
          onPress={() => this.setState({selectedTab: Consts.TRADE_TYPE_SELL})}>
          <Text style={[CommonStyles.priceDecreased]}>{I18n.t('orderForm.sell')}</Text>
        </TouchableOpacity>

        <View style={styles.tabSeparator}/>

        <TouchableOpacity
          activeOpacity={1}
          style={styles.tab}>
          <Text>{I18n.t('orderForm.pendingOrder')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderInputs() {
    return (
      <View style={styles.inputGroup}>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>{I18n.t('orderForm.type')}</Text>
          <View style={styles.inputValue}>
            {this._renderOrderType()}
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>{I18n.t('orderForm.price')}</Text>
          <View style={styles.inputValue}>
            <TextInput keyboardType='numeric' style={{ flex: 1 }} />
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>{I18n.t('orderForm.quantity')}</Text>
          <View style={styles.inputValue}>
            <TextInput keyboardType='numeric' style={{ flex: 1 }} />
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>{I18n.t('orderForm.total')}</Text>
          <View style={styles.inputValue}>
            <TextInput keyboardType='numeric' style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    );
  }

  _renderOrderType() {
    return (
      <View style={CommonStyles.matchParent}>
        <PopoverController>
          {({ openPopover, closePopover, popoverVisible, setPopoverAnchor, popoverAnchorRect }) => (
            <View style={CommonStyles.matchParent}>
              <TouchableWithoutFeedback onPress={() => openPopover()}>
                <View ref={setPopoverAnchor} style={styles.orderTypeGroup}>
                  <Text style={styles.typeLabel}>{this._getTypeLabel()}</Text>
                  <Icon style={styles.typeArrow}
                        name="caret-down"
                        size={scale(20)}
                        color='black'/>
                </View>
              </TouchableWithoutFeedback>
              <Popover
                duration={0}
                arrowStyle={styles.arrow}
                contentStyle={styles.popupContainer}
                visible={popoverVisible}
                onClose={() => closePopover()}
                fromRect={popoverAnchorRect}
                placement='bottom'
                supportedOrientations={['portrait']}>
                {this._renderOrderTypeList(closePopover)}
              </Popover>
            </View>
          )}
        </PopoverController>
      </View>
    );
  }

  _getTypeLabel() {
    for (let orderType of this.types) {
      if (orderType.type == this.state.type) {
        return orderType.label;
      }
    }
  }

  _renderOrderTypeList(closePopover) {
    return (
      <View style={styles.typesPopup}>
        {this.types.map((item, index) => {
          return (
            <TouchableOpacity key={index} onPress={() => {
              this._onPressOrderTypeItem(item, closePopover);
            }}>
              <View>
                <Text style={[styles.typesPopupItem, index == 0 ? styles.firstPopupItem : {}]}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  _onPressOrderTypeItem(item, closePopover) {
    closePopover();
    this.setState({ type: item.type });
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
            <Text style={styles.estimateValue}>999,755</Text>
            <Text style={styles.insideText}>{getCurrencyName(currency)}</Text>
          </View>
        </View>

        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationBuyCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.fee')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>0.000321</Text>
            <Text style={styles.insideText}>{getCurrencyName(coin)}</Text>
          </View>
        </View>

        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationBuyCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.estimateQuantity')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>0.320679</Text>
            <Text style={styles.insideText}>{getCurrencyName(coin)}</Text>
          </View>
        </View>
      </View>
    );
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
            <Text style={styles.estimateValue}>999,755</Text>
            <Text style={styles.insideText}>{getCurrencyName(coin)}</Text>
          </View>
        </View>
        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationSellCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.fee')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>0.000321</Text>
            <Text style={styles.insideText}>{getCurrencyName(currency)}</Text>
          </View>
        </View>
        <View style={styles.estimationRow}>
          <View style={[styles.estimationLeftCell, styles.estimationSellCell]}>
            <Text style={styles.estimateLabel}>{I18n.t('orderForm.estimateQuantity')}</Text>
          </View>
          <View style={styles.estimationRightCell}>
            <Text style={styles.estimateValue}>0.320679</Text>
            <Text style={styles.insideText}>{getCurrencyName(currency)}</Text>
          </View>
        </View>
      </View>
    );
  }

  _renderSubmitButton() {
    const isSubmitBuy = this.state.selectedTab == Consts.TRADE_TYPE_BUY;
    return (
      <TouchableOpacity style={[styles.submitButton, isSubmitBuy ? styles.submitBuy : styles.submitSell]}>
        <Text style={styles.submitText}>
          {getCurrencyName(this._getCoin()) + '/ ' + getCurrencyName(this._getCurrency())
            + ' ' + this._getOrderTypeText() + ' ' + this._getTradeTypeText()}
        </Text>
      </TouchableOpacity>
    );
  }

  _getOrderTypeText() {
    return '지정가';
  }

  _getTradeTypeText() {
    return '매수';
  }
}

const margin = scale(10);

const styles = ScaledSheet.create({
  tabs: {
    flexDirection: 'row',
    height: '35@s',
    alignItems: 'stretch'
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#EEF1F5',
    marginBottom: 1,
    paddingBottom: 1
  },
  tabSeparator: {
    width: 1,
    height: '15@s',
    marginBottom: 3,
    alignSelf: 'center',
    backgroundColor: '#515151'
  },
  selectedBuy: {
    borderBottomWidth: 3,
    borderColor: '#FF2C0D',
    marginBottom: 0,
    paddingBottom: 0
  },
  selectedSell: {
    borderBottomWidth: 3,
    borderColor: '#007AC5',
    marginBottom: 0,
    paddingBottom: 0
  },

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
    height: '100%',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: scale(3)
  },
  orderTypeGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: margin,
    marginRight: margin
  },
  typeLabel: {
    flex: 1,
    textAlign: 'center',
    includeFontPadding: false
  },
  popupContainer: {

  },
  typesPopup: {

  },
  typesPopupItem: {

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