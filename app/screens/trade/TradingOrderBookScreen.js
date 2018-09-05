import React from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import {
  createBottomTabNavigator,
  createStackNavigator,
} from 'react-navigation'
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { CommonColors, CommonSize, CommonStyles, Fonts } from '../../utils/CommonStyles';
import I18n from '../../i18n/i18n';
import rf from '../../libs/RequestFactory';
import BaseScreen from '../BaseScreen'
import OrderBook from './OrderBook';
import OrderBookSettingModal from './OrderBookSettingModal';
import OrderQuantityModal from './OrderQuantityModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import CurrencyInput from '../common/CurrencyInput';
import Utils from '../../utils/Utils';
import Consts from '../../utils/Consts'
import Events from '../../utils/Events';
import OrderUtils from '../../utils/OrderUtils';
import { scale } from "../../libs/reactSizeMatter/scalingUtils";

export default class TradingOrderBookScreen extends BaseScreen {
  constructor(props) {
    super(props)
    this.state = {
      currency: props.screenProps.currency,
      coin: props.screenProps.coin,
      quantity: '',
      quantityPrecision: 4,
      settingsOrderConfirmation: undefined
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { currency, coin } = this.props.screenProps;
    if (currency != this.state.currency || coin != this.state.coin) {
      this.setState({ currency, coin });
    }
  }

  componentDidMount() {
    super.componentDidMount();
    this._loadData();
  }

  getDataEventHandlers() {
    return {
      [Events.ORDER_BOOK_SETTINGS_UPDATED]: this._onOrderBookSettingsUpdated.bind(this),
      [Events.ORDER_BOOK_ROW_PRESSED]: this._onOrderBookRowClicked.bind(this)
    };
  }

  async _loadData() {
    await Promise.all([
      this._loadCoinSettings(),
      this._getOrderBookSettings()
    ]);
  }

  async _loadCoinSettings() {
    try {
      const masterdata = await rf.getRequest('MasterdataRequest').getAll();
      const settings = masterdata.coin_settings.find(item => {
        return item.currency == this._getCurrency() && item.coin == this._getCoin()
      });
      this.setState({
        quantityPrecision: Utils.getPrecision(settings.minimum_quantity)
      });
    } catch (err) {
      console.log('GetMasterData._error:', err)
    }
  }

  async _getOrderBookSettings() {
    try {
      const params = {
        currency: this._getCurrency(),
        coin: this._getCoin()
      };
      const response = await rf.getRequest('UserRequest').getOrderBookSettings(params);
      this._onOrderBookSettingsUpdated(response.data);
    } catch (err) {
      if(err.message === Consts.NOT_LOGIN) {
        const params = {
          currency: this._getCurrency(),
          coin: this._getCoin()
        };

        const defaultOrderBookSetting = { ...Consts.DEFAULT_ORDER_BOOK_SETTING, ...params };
        return this._onOrderBookSettingsUpdated(defaultOrderBookSetting);
      }
      console.log('GetOrderBookSettings._error:', err)
    }
  }

  _onOrderBookSettingsUpdated(settings) {
    this.settingsOrderConfirmation = settings.order_confirmation;
  }

  _getCurrency() {
    return this.state.currency;
  }

  _getCoin() {
    return this.state.coin;
  }

  _onOrderBookRowClicked(data) {
    if (data.orderBookType != OrderBook.TYPE_FULL) {
      return;
    }

    if (this.state.quantity) {
      this._submitOrder(data);
    } else {
      this._orderQuantityModal.showModal(data.tradeType, data.price, async quantity => {
        await this.setState({ quantity });
        this._submitOrder(data);
      });
    }
  }

  _submitOrder(data) {
    let params = {
      trade_type: data.tradeType,
      currency: this._getCurrency(),
      coin: this._getCoin(),
      type: Consts.ORDER_TYPE_LIMIT,
      quantity: this.state.quantity,
      price: data.price
    };

    var errors = OrderUtils.validateOrderInput(params);
    if (errors.length > 0) {
      this._showError(errors[0].message);
      return;
    }
    if (this.settingsOrderConfirmation) {
      this._confirmCreateOrder(params);
    } else {
      this._sendOrderRequest(params);
    }
  }

  _showError(message) {
    //TODO show error
    console.log(message);
  }

  _confirmCreateOrder(data) {
    this._orderModal.show(data, () => {
      this._sendOrderRequest(data);
    });
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

  _onQuantityChanged(formatted, extracted) {
    let quantity = OrderUtils.getMaskInputValue(formatted, extracted);
    this.setState({ quantity });
  }

  render() {
    return (
      <View style={CommonStyles.matchParent}>
        <OrderConfirmationModal ref={ref => this._orderModal = ref}/>
        {this._renderOrderBookSettingModal()}
        {this._renderQuantityModal()}
        {this._renderQuantityAndSetting()}
        <OrderBook currency={this._getCurrency()} coin={this._getCoin()} type={OrderBook.TYPE_FULL}/>
      </View>
    )
  }

  _renderOrderBookSettingModal() {
    return (
      <OrderBookSettingModal
        ref={ref => this._orderBookSettingModal = ref}
        currency={this._getCurrency()}
        coin={this._getCoin()}/>
    );
  }

  _renderQuantityModal() {
    return (
      <OrderQuantityModal
        ref={ref => this._orderQuantityModal = ref}
        currency={this._getCurrency()}
        coin={this._getCoin()}/>
    );
  }

  _renderQuantityAndSetting() {
    return (
      <View style={styles.quantityAndSettingGroup}>
        <Text style={styles.headerLabel}>{I18n.t('orderBook.quantity')}</Text>
        <CurrencyInput
            value={this.state.quantity}
            precision={this.state.quantityPrecision}
            onChangeText={this._onQuantityChanged.bind(this)}
            keyboardType='numeric'
            style={[styles.input, styles.quantityInput]}
            underlineColorAndroid='transparent'
            placeholderTextColor='#4E545E'/>

        <TouchableOpacity onPress={this._openOrderBookSettingModal.bind(this)}
                          style={{position: 'absolute', right: scale(10)}}>
          <Image
            resizeMode={'contain'}
            style={styles.setting}
            source={require('../../../assets/orderBook/setting.png')}/>
        </TouchableOpacity>
      </View>
    );
  }

  _openOrderBookSettingModal() {
    this._orderBookSettingModal.setModalVisible(true);
  }
}

const styles = ScaledSheet.create({
  quantityAndSettingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '37@vs',
    paddingTop: '1@s',
    paddingLeft: '10@s',
    paddingRight: '10@s'
  },
  headerLabel: {
    fontSize: '10@s',
    ...Fonts.NotoSans
  },
  quantityInput: {
    flex: 0.5,
    marginLeft: '10@s',
    marginRight: '15@s'
  },
  setting: {
    width: '18@s'
  },

  input: {
    height: '25@s',
    paddingLeft: '5@s',
    paddingRight: '5@s',
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: '5@s',
    marginRight: '5@s',
    borderWidth: 1,
    borderColor: CommonColors.border,
    borderRadius: '3@s',
    textAlign: 'right',
    fontSize: '11@s',
    ...Fonts.OpenSans
  },
  percentText: {
    fontSize: '8@s',
    marginRight: '10@s',
    ...Fonts.OpenSans
  }
});