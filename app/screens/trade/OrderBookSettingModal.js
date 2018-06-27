import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
import Modal from "react-native-modal";
import { Switch } from '../../libs/react-native-switch/Switch';
import CheckBox from 'react-native-check-box'
import _ from 'lodash';
import BaseScreen from '../BaseScreen'
import OrderBook from './OrderBook';
import TextInputMask from 'react-native-text-input-mask';
import I18n from '../../i18n/i18n';
import rf from '../../libs/RequestFactory';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../libs/reactSizeMatter/scalingUtils';
import { formatCurrency, getCurrencyName } from '../../utils/Filters';
import { CommonColors, CommonSize, CommonStyles } from '../../utils/CommonStyles';
import Events from '../../utils/Events';

export default class OrderBookSettingModal extends BaseScreen {
  state = {
    modalVisible: false,
    showEmptyRow: false,
    clickToOrder: false,
    confirmOrder: false,
    priceGroup: false,
    notification: false,
    notificationCreated: false,
    notificationMatched: false,
    notificationCanceled: false,
    priceGroup0: {},
    priceGroup1: {}
  };

  componentDidMount() {
    super.componentDidMount();
    this._loadData();
  }

  _getCoin() {
    return this.props.coin;
  }

  _getCurrency() {
    return this.props.currency;
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  async _loadData() {
    Promise.all([
      this._loadPriceGroups(),
      this._loadSettings()
    ]);
  }

  async _loadPriceGroups() {
    const masterdata = await rf.getRequest('MasterdataRequest').getAll();
    const priceGroups = masterdata.price_groups.filter(item => {
      return item.currency == this._getCurrency() && item.coin == this._getCoin()
    }).sort((a, b) => a.group - b.group);
    this.setState({
      priceGroup0: priceGroups[0],
      priceGroup1: priceGroups[1]
    });
  }

  async _loadSettings() {
    const params = {
      currency: this._getCurrency(),
      coin: this._getCoin(),
    };
    const response = await rf.getRequest('UserRequest').getOrderBookSettings(params);
    const state = this._convertSettingsToState(response.data);
    this.setState({
      ...state
    });
  }

  async _saveOrderBookSettings() {
    const settings = this._convertStateToSettings(this.state);
    const params = {
      currency: this._getCurrency(),
      coin: this._getCoin(),
      ...settings
    }
    const response = await rf.getRequest('UserRequest').updateOrderBookSettings(params);
    this.notify(Events.ORDER_BOOK_SETTINGS_UPDATED, response.data);
    this.setModalVisible(false);
  }

  _convertSettingsToState(settings) {
    let state = {};
    state.showEmptyRow = !!settings.show_empty_group;
    state.clickToOrder = !!settings.click_to_order;
    state.confirmOrder = !!settings.order_confirmation
    state.priceGroup = !!settings.price_group;
    state.notification = !!settings.notification;
    state.notificationCreated = !!settings.notification_created;
    state.notificationMatched = !!settings.notification_matched;
    state.notificationCanceled = !!settings.notification_canceled;
    return state;
  }

  _convertStateToSettings(state) {
    return {
      show_empty_group: state.showEmptyRow ? 1 : 0,
      click_to_order: state.clickToOrder ? 1 : 0,
      price_group: state.priceGroup ? 1 : 0,
      order_confirmation: state.confirmOrder ? 1 : 0,
      notification: state.notification ? 1 : 0,
      notification_created: state.notificationCreated ? 1 : 0,
      notification_matched: state.notificationMatched ? 1 : 0,
      notification_canceled: state.notificationCanceled ? 1 : 0
    };
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
            <View>
              {this._renderHeader()}
              {this._renderSettings()}
              {this._renderFooter()}
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  _renderHeader() {
    return (
      <View style={styles.popupHeader}>
        <Text>{I18n.t('orderBookSettings.title')}</Text>
        <Text> - {getCurrencyName(this._getCoin())} / {getCurrencyName(this._getCurrency())}</Text>

        <TouchableOpacity style={styles.popupCloseButton} onPress={() => this.setModalVisible(false)}>
          <Image
            resizeMode={'contain'}
            style={styles.popupCloseIcon}
            source={require('../../../assets/common/close.png')}/>
        </TouchableOpacity>
      </View>
    );
  }

  _renderSettings() {
    return (
      <View style={styles.content}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{I18n.t('orderBookSettings.showEmptyRow')}</Text>
          <View style={styles.settingContent}>
            <Switch
              value={this.state.showEmptyRow}
              onValueChange={(value) => this.setState({showEmptyRow: value})}
              {...CommonStyles.switch}
            />
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{I18n.t('orderBookSettings.clickToOrder')}</Text>
          <View style={styles.settingContent}>
            <Switch
              value={this.state.clickToOrder}
              onValueChange={(value) => this.setState({clickToOrder: value})}
              {...CommonStyles.switch}
            />
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{I18n.t('orderBookSettings.confirmOrder')}</Text>
          <View style={styles.settingContent}>
            <Switch
              value={this.state.confirmOrder}
              onValueChange={(value) => this.setState({confirmOrder: value})}
              {...CommonStyles.switch}
            />
          </View>
        </View>

        {this._renderPriceGroupSetting()}

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{I18n.t('orderBookSettings.notification')}</Text>
          <View style={styles.settingContent}>
            <Switch
              value={this.state.notification}
              onValueChange={(value) => this.setState({notification: value})}
              {...CommonStyles.switch}
            />
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{I18n.t('orderBookSettings.notificationContent')}</Text>
          <View style={styles.settingContent}>
            <CheckBox
              isChecked={this.state.notificationCreated}
              onClick={() => this.setState({notificationCreated: !this.state.notificationCreated})}
              rightText={I18n.t('orderBookSettings.notificationCreated')}
              style={{width: scale(55)}}
              rightTextStyle={{marginLeft: scale(5)}}
              {...CommonStyles.checkBox}/>

            <CheckBox
              isChecked={this.state.notificationMatched}
              onClick={() => this.setState({notificationMatched: !this.state.notificationMatched})}
              rightText={I18n.t('orderBookSettings.notificationMatched')}
              style={{width: scale(55)}}
              rightTextStyle={{marginLeft: scale(5)}}
              {...CommonStyles.checkBox}/>

            <CheckBox
              isChecked={this.state.notificationCanceled}
              onClick={() => this.setState({notificationCanceled: !this.state.notificationCanceled})}
              rightText={I18n.t('orderBookSettings.notificationCanceled')}
              style={{width: scale(48)}}
              rightTextStyle={{marginLeft: scale(5)}}
              {...CommonStyles.checkBox}/>
          </View>
        </View>
      </View>
    );
  }

  _renderPriceGroupSetting() {
    return (
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>
          {I18n.t('orderBookSettings.priceGroup')}
          ({getCurrencyName(this._getCurrency())})
        </Text>
        <View style={styles.settingContent}>
          <Text style={[styles.priceGroup0, !this.state.priceGroup ? styles.selectedPriceGroup : {}]}>
            {formatCurrency(this.state.priceGroup0.value, this._getCurrency())}
          </Text>
          <Switch
            value={this.state.priceGroup}
            onValueChange={(value) => this.setState({priceGroup: value})}
            circleSize={scale(14)}
            barHeight={scale(10)}
            switchLeftPx={3}
            switchRightPx={3}
            switchWidthMultiplier={1.5}
            circleBorderWidth={scale(1)}
            circleBorderActiveColor='#0000'
            circleBorderInactiveColor='#0000'
            backgroundActive='#3A3A3A'
            backgroundInactive='#3A3A3A'
          />
          <Text style={[styles.priceGroup1, this.state.priceGroup ? styles.selectedPriceGroup : {}]}>
            {formatCurrency(this.state.priceGroup1.value, this._getCurrency())}
          </Text>
        </View>
      </View>
    );
  }

  _renderFooter() {
    return (
      <TouchableOpacity style={styles.updateButton} onPress={this._saveOrderBookSettings.bind(this)}>
        <Text style={styles.updateButtonText}>{I18n.t('orderBookSettings.update')}</Text>
      </TouchableOpacity>
    );
  }
}

const margin = scale(30);

const styles = ScaledSheet.create({
  popup: {
    backgroundColor: '#FFF',
    borderRadius: '5@s'
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(60),
    paddingLeft: margin,
    borderBottomWidth: 1,
    borderColor: '#EFEEEF'
  },
  popupCloseButton: {
    position: 'absolute',
    top: scale(10),
    right: scale(10),
  },
  popupCloseIcon: {
    width: scale(10),
    height: scale(10)
  },

  content: {
    marginLeft: margin,
    marginRight: margin
  },
  settingRow: {
    flexDirection: 'row',
    marginTop: scale(15),
    marginBottom: scale(15)
  },
  settingLabel: {

  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  priceGroup0: {
    marginRight: scale(5),
    color: '#747474'
  },
  priceGroup1: {
    marginLeft: scale(5),
    color: '#747474'
  },
  selectedPriceGroup: {
    color: '#000'
  },

  updateButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '30@s',
    margin: margin,
    borderRadius: scale(3),
    backgroundColor: '#007AC5'
  },
  updateButtonText: {
    color: '#FFF'
  }
});