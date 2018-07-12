import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
  StyleSheet
} from 'react-native';
import Modal from "react-native-modal";
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
import DropdownMenu from '../common/DropdownMenu';

export default class OrderQuantityModal extends BaseScreen {
  state = {
    quantity: '',
    quantityPrecision: 4,
    tradeType: Consts.TRADE_TYPE_BUY,
    price: undefined
  };
  balances = {};
  sourcePosition = {};

  componentDidMount() {
    super.componentDidMount();
    this._loadData();
  }

  getSocketEventHandlers() {
    return {
      BalanceUpdated: this._onBalanceUpdated.bind(this)
    }
  }

  async _loadData() {
    await Promise.all([
      this._loadCoinSettings(),
      this._loadBalances()
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

  _onBalanceUpdated(balances) {
    this.balances = Object.assign({}, this.balances, balances);
  }

  _getCoin() {
    return this.props.coin;
  }

  _getCurrency() {
    return this.props.currency;
  }

  showModal(tradeType, price, submitCallback) {
    this.setState({
      tradeType: tradeType,
      price: price,
      modalVisible: true
    });
    this.submitCallback = submitCallback;
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
    this.submitCallback(this.state.quantity);
    this.hideModal();
  }

  render() {
    return (
      <View>
        <Modal
          animationType="slide"
          isVisible={this.state.modalVisible}
          backdropColor={'black'}
          backdropOpacity={0.3}
          onBackButtonPress={() => this.hideModal()}
          onBackdropPress={() => this.hideModal()}>
          <View style={styles.screen}>
            <View style={styles.popup}>
              {this._renderHeader()}
              {this._renderContent()}
            </View>
            {this._renderDropdown()}
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
    return (
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <View style={styles.dropdownSource} ref={ref => this._inputView = ref}/>
          <CurrencyInput
            value={this.state.quantity}
            precision={this.state.quantityPrecision}
            onChangeText={this._onQuantityChanged.bind(this)}
            keyboardType='numeric'
            style={styles.inputText}
            underlineColorAndroid='transparent'/>
          <TouchableWithoutFeedback onPress={this._showPercentDropdown.bind(this)}>
            <View style={styles.caretContainer}>
              <Icon name='triangle-down' type='entypo' size={scale(18)}/>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={this._onPressSubmit.bind(this)}>
          <Text style={styles.updateButtonText}>{I18n.t('orderBookSettings.update')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _showPercentDropdown() {
    let items = [];
    for (let i = 100; i > 0; i-= 10) {
      items.push(i + '%');
    }
    const options = {
      sourceView: this._inputView
    };
    this._dropdownMenu.show(items, options);
  }

  _renderDropdown() {
    return (
      <DropdownMenu
        ref={ref => this._dropdownMenu = ref}
        onSelectItem={this._onPressPercent.bind(this)}
        dropdownStyle={styles.dropdown}
        itemButtonStyle={styles.dropdownButton}
        itemTextStyle={styles.dropdownText}
        separatorStyle={styles.separator}/>
    );
  }
}

const margin = scale(30);
const inputHeight = scale(30);

const styles = ScaledSheet.create({
  screen: {
    height: '100%',
    justifyContent: 'center'
  },
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
    paddingTop: 0,
    paddingBottom: 0,
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
  dropdownSource: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '80@s',
    height: inputHeight,
    backgroundColor: '#FFF',
    opacity: 0
  },

  dropdown: {
    backgroundColor: '#FFF',
    borderRadius: '3@s'
  },
  dropdownButton: {
    width: '100%',
    height: '30@s',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  dropdownText: {
    color: '#000',
    textAlign: 'center'
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