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
  Switch
} from 'react-native';
import BaseScreen from '../BaseScreen'
import rf from '../../libs/RequestFactory'
import MasterdataUtils from '../../utils/MasterdataUtils';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'
import { filter, pickBy, startsWith, orderBy } from 'lodash'
import Utils from '../../utils/Utils';
import { ListItem, List, Icon, CheckBox, Input } from 'react-native-elements'

export default class TradingGeneralScreen extends BaseScreen {

  constructor(props) {
    super(props)
    this.state = {
      settingsModal: false,
      settingsInfo: {},
      coin: '',
      currency: ''
    }
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

  render() {
    return (
      <SafeAreaView style={styles.safeView}>
        <View>
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


        </View>
      </SafeAreaView>
    )
  }
}

const styles = ScaledSheet.create({
  settings: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
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
    flexDirection: 'row', flex: 1,
    flexWrap: 'wrap'
  }
});