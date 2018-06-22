import React from 'react';
import {
  PixelRatio,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  SafeAreaView,
  Modal,
  Switch,
  Picker,
  TouchableHighlight
} from 'react-native';
import BaseScreen from '../BaseScreen'
import rf from '../../libs/RequestFactory'
import MasterdataUtils from '../../utils/MasterdataUtils';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { filter, pickBy, startsWith, orderBy } from 'lodash'
import Utils from '../../utils/Utils';
import Consts from '../../utils/Consts'
import { ListItem, List, Icon, CheckBox, Input, Button } from 'react-native-elements'

export default class TradingGeneralScreen extends BaseScreen {

  constructor(props) {
    super(props)
    this.state = {
      settingsModal: false,
      settingsInfo: {},
      coin: '',
      currency: '',
      type: undefined,
      krwValue: undefined,
      percent: undefined,
    }
    this.types = [
      { value: Consts.ORDER_TYPE_LIMIT, label: 'Limit price' },
      { value: Consts.ORDER_TYPE_MARKET, label: 'Market price' },
      { value: Consts.ORDER_TYPE_STOP_LIMIT, label: 'Stop limit price' },
      { value: Consts.ORDER_TYPE_STOP_MARKET, label: 'Stop market price' }
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
    let { coin, currency } = this.props.screenProps
    if (coin && currency) {
      this._loadData()
    }
  }

  async _loadData() {
    let { coin, currency } = this.props.screenProps
    await this._getOrderBookSettings(currency, coin)
  }

  async _getOrderBookSettings(currency, coin) {
    try {
      // getOrderBookSettings currency=krw&coin=btc
      let result = await rf.getRequest('UserRequest').getOrderBookSettings({ currency, coin })
      this.setState({ settingsInfo: result.data })

    } catch (err) {
      console.log('TradingGeneralScreen._getOrderBookSettings', err);
    }

  }

  async _setOrderBookSettings() {
    try {
      let settingsInfo = { ...this.state.settingsInfo }
      settingsInfo.coin = this.state.coin
      settingsInfo.currency = this.state.currency
      let result = await rf.getRequest('UserRequest').updateOrderBookSettings(settingsInfo)

    } catch (err) {
      console.log('TradingGeneralScreen._getOrderBookSettings', err);
    }

  }

  _renderSettings() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.settingsModal}
        onRequestClose={() => { }}>
        <View style={styles.modalView}>
          <List containerStyle={styles.settingList} >
            <ListItem
              key="header"
              title={"주문창 설정 - " + (this.state.coin + "/" + this.state.currency).toUpperCase()}
              rightIcon={
                <TouchableOpacity onPress={() => {
                  this.setState({ settingsModal: false })
                  this._setOrderBookSettings()
                }}>
                  <Icon name="close" />
                </TouchableOpacity>
              }
              containerStyle={styles.hasBorderBottom} />
            <ListItem
              key="show_empty_group"
              title="빈 호가 표시"
              rightIcon={
                <Switch
                  style={styles.switchStyle}
                  value={this.state.settingsInfo.show_empty_group == 1}
                  onValueChange={(value) => {
                    let settingsInfo = { ...this.state.settingsInfo }
                    settingsInfo.show_empty_group = value ? 1 : 0;
                    this.setState({ settingsInfo })
                  }} />}
              containerStyle={styles.noBorderBottom} />
            <ListItem
              key="click_to_order"
              title="원클릭 주문"
              rightIcon={
                <Switch
                  style={styles.switchStyle}
                  value={this.state.settingsInfo.click_to_order == 1}
                  onValueChange={(value) => {
                    let settingsInfo = { ...this.state.settingsInfo }
                    settingsInfo.click_to_order = value ? 1 : 0;
                    this.setState({ settingsInfo })
                  }} />}
              containerStyle={styles.noBorderBottom} />
            <ListItem
              key="order_confirmation"
              title="주문 확인"
              rightIcon={
                <Switch
                  style={styles.switchStyle}
                  value={this.state.settingsInfo.order_confirmation == 1}
                  onValueChange={(value) => {
                    let settingsInfo = { ...this.state.settingsInfo }
                    settingsInfo.order_confirmation = value ? 1 : 0;
                    this.setState({ settingsInfo })
                  }} />}
              containerStyle={styles.noBorderBottom} />
            <ListItem
              key="price_group"
              title="호가 단위(KRW)"
              rightIcon={
                <Switch
                  style={styles.switchStyle}
                  value={this.state.settingsInfo.price_group == 1}
                  onValueChange={(value) => {
                    let settingsInfo = { ...this.state.settingsInfo }
                    settingsInfo.price_group = value ? 1 : 0;
                    this.setState({ settingsInfo })
                  }} />}
              containerStyle={styles.noBorderBottom} />
            <ListItem
              key="notification"
              title="알림 설정(공통)"
              rightIcon={
                <Switch
                  style={styles.switchStyle}
                  value={this.state.settingsInfo.notification == 1}
                  onValueChange={(value) => {
                    let settingsInfo = { ...this.state.settingsInfo }
                    settingsInfo.notification = value ? 1 : 0;
                    this.setState({ settingsInfo })
                  }} />}
              containerStyle={styles.noBorderBottom} />
            <ListItem
              key="notification_content"
              title="알림 내용(공통)"
              containerStyle={styles.noBorderBottom}
              rightIcon={
                <View style={styles.notificationGroup}>
                  <CheckBox
                    size={13}
                    textStyle={styles.settingCBText}
                    containerStyle={styles.settingCBWarp}
                    title='주문'
                    onPress={() => {
                      let settingsInfo = { ...this.state.settingsInfo }
                      settingsInfo.notification_created = !(this.state.settingsInfo.notification_created == 1) ? 1 : 0;
                      this.setState({ settingsInfo })
                    }}
                    checked={this.state.settingsInfo.notification_created == 1} />
                  <CheckBox
                    size={13}
                    title='체결'
                    textStyle={styles.settingCBText}
                    containerStyle={styles.settingCBWarp}
                    onPress={() => {
                      let settingsInfo = { ...this.state.settingsInfo }
                      settingsInfo.notification_matched = !(this.state.settingsInfo.notification_matched == 1) ? 1 : 0;
                      this.setState({ settingsInfo })
                    }}
                    checked={this.state.settingsInfo.notification_matched == 1} />
                  <CheckBox
                    size={13}
                    title='취소'
                    textStyle={styles.settingCBText}
                    containerStyle={styles.settingCBWarp}
                    onPress={() => {
                      let settingsInfo = { ...this.state.settingsInfo }
                      settingsInfo.notification_canceled = !(this.state.settingsInfo.notification_canceled == 1) ? 1 : 0;
                      this.setState({ settingsInfo })
                    }}
                    checked={this.state.settingsInfo.notification_canceled == 1} />
                </View>
              } />
          </List>
        </View>
      </Modal>
    )
  }

  _typesSelected() {
    return true
  }

  render() {
    return (
      <SafeAreaView style={styles.safeView}>
        <View style={{ flex: 1 }}>
          <View style={styles.settings}>
            <Text>손절</Text><TextInput value="15" keyboardType='numeric' /><Text>%</Text>
            <Text>익절</Text><TextInput value="-15" keyboardType='numeric' /><Text>%</Text>
            <TouchableOpacity onPress={() => {
              let { coin, currency } = this.props.screenProps
              this._getOrderBookSettings(currency, coin)
              this.setState({ settingsModal: true, coin, currency })
            }}>
              <Icon name='settings' />
            </TouchableOpacity >
          </View>
          <View style={styles.content}>
            <View style={styles.priceList}></View>
            <View style={styles.trades}>
              <View style={{ height: 40, flexDirection: 'row' }}>
                <TouchableOpacity style={{ flex: 1 }}><Text>매수</Text></TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }}><Text>매도</Text></TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }}><Text>미체결</Text></TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'column' }}>
                <View style={{ height: 50, flexDirection: 'row' }}>
                  <Text style={{ width: 60 }}>Type</Text>
                  <Picker
                    selectedValue={this.state.type}
                    style={{ height: 30, width: 200 }}
                    mode={'dropdown'}
                    onValueChange={(itemValue, itemIndex) => this.setState({ type: itemValue })}>
                    {
                      this.types.map((l, i) => (
                        <Picker.Item key={l.value + "_" + i} label={l.label} value={l.value} />
                      ))
                    }
                  </Picker>
                </View>
                <View style={{ height: 50, flexDirection: 'row' }}>
                  <Text style={{ width: 60 }}>Price</Text>
                  <TextInput keyboardType='numeric' style={{ width: 150, height: 30, borderWidth: 1 }} />
                </View>
                <View style={{ height: 50, flexDirection: 'row' }}>
                  <Text style={{ width: 60 }}>Quantity</Text>
                  <Picker
                    selectedValue={this.state.percent}
                    style={{ height: 30, width: 200 }}
                    mode={'dropdown'}
                    onValueChange={(itemValue, itemIndex) => this.setState({ percent: itemValue })}>
                    {
                      this.percents.map((l, i) => (
                        <Picker.Item key={l.value + "_" + i} label={l.label} value={l.value} />
                      ))
                    }
                  </Picker>
                </View>
                <View style={{ height: 50, flexDirection: 'row' }}>
                  <Text style={{ width: 60 }}>Total Sell</Text>
                  <Picker
                    selectedValue={this.state.krwValue}
                    style={{ height: 30, width: 200 }}
                    mode={'dropdown'}
                    onValueChange={(itemValue, itemIndex) => this.setState({ krwValue: itemValue })}>
                    {
                      this.krws.map((l, i) => (
                        <Picker.Item key={l.value + "_" + i} label={l.label} value={l.value} />
                      ))
                    }
                  </Picker>
                </View>
              </View>
              <View style={{ margin: 5 }}>
                <View style={styles.inforLineHeight}>
                  <View style={[styles.inforLeft, styles.noBorderBottom]}><Text>주문가능금액</Text></View>
                  <View style={[styles.inforRight, styles.noBorderBottom]}>
                    <Text>5,000,000 <Text style={styles.insideText}>KRW</Text></Text>
                  </View>
                </View>
                <View style={styles.inforLineHeight}>
                  <View style={[styles.inforLeft, styles.noBorderBottom]}><Text>매수대금</Text></View>
                  <View style={[styles.inforRight, styles.noBorderBottom]}>
                    <Text>999,755 <Text style={styles.insideText}>KRW</Text></Text>
                  </View>
                </View>
                <View style={styles.inforLineHeight}>
                  <View style={[styles.inforLeft, styles.noBorderBottom]}><Text>수수료</Text></View>
                  <View style={[styles.inforRight, styles.noBorderBottom]}>
                    <Text>0.000321 <Text style={styles.insideText}>BTC</Text></Text>
                  </View>
                </View>
                <View style={styles.inforLineHeight}>
                  <View style={[styles.inforLeft]}><Text>총매수량</Text></View>
                  <View style={[styles.inforRight]}>
                    <Text>0.320679 <Text style={styles.insideText}>BTC</Text></Text>
                  </View>
                </View>
              </View>
              <Button style={{ flex: 1 }} title='BUTTON' />

            </View>
          </View>
          {this._renderSettings()}
        </View>
      </SafeAreaView >
    )
  }
}

const styles = ScaledSheet.create({
  settings: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    height: 35
  },
  settingCBText: {
    fontSize: 10,
    color: '#FFFFFF'
  },
  settingCBWarp: {
    backgroundColor: 'rgba(52, 52, 52, 0)',
    borderWidth: 0,
    width: 60
  },
  switchStyle: {
    transform: [{ scaleX: .7 }, { scaleY: .7 }]
  },
  settingList: {
    backgroundColor: '#11151C',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    width: 350,
    height: 400,
    marginTop: 50
  },
  noBorderBottom: {
    borderBottomWidth: 0
  },
  hasBorderBottom: {
    borderBottomWidth: 1
  },
  modalView: {
    justifyContent: "center",
    alignItems: "center"
  },
  safeView: {
    flex: 1,
    backgroundColor: '#fff'
  },
  notificationGroup: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap'
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  priceList: {
    backgroundColor: 'red',
    flex: 2
  },
  trades: {
    flex: 3
  },
  inforLeft: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center'
  },
  inforRight: {
    flex: 1,
    borderWidth: 1,
    borderLeftWidth: 0,
    alignItems: 'flex-end'
  },
  insideText: {
    fontSize: 10
  },
  inforLineHeight: {
    flexDirection: 'row',
    borderWidth: 0,
    height: 30
  }
});