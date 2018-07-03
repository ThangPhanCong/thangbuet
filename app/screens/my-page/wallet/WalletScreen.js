import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  FlatList,
  Animated
} from 'react-native';
import { Picker } from 'native-base';
import { Card } from 'react-native-elements'
import Modal from 'react-native-modal';
import BaseScreen from '../../BaseScreen';
import rf from '../../../libs/RequestFactory';
import { CommonStyles } from '../../../utils/CommonStyles';
import Utils from '../../../utils/Utils';
import I18n from '../../../i18n/i18n';
import _ from 'lodash';
import Consts from '../../../utils/Consts';
import ActionButton from 'react-native-action-button';

export default class WalletScreen extends BaseScreen {

  _newWalletParams = {};
  _coinTypes = [];

  _selectedWallet = {};

  _page = 1;
  _hasNext = true;
  _limit = 10;

  constructor(props) {
    super(props);

    this.state = {
      wallets: [],
      isLoading: false,
      selectedCoinType: '',

      addNewWalletDialogVisible: false,
      removeWalletDialogVisible: false
    }
  }

  componentWillMount() {
    super.componentWillMount()
    this._loadWallets();
    this._getAvailableCoins();
  }

  render() {
    return (
      <View style={styles.screen}>
        {this._renderHeader()}
        <FlatList
          style={styles.listView}
          data={this.state.wallets}
          extraData={this.state}
          renderItem={this._renderItem.bind(this)}
          ItemSeparatorComponent={this._renderSeparator}
          onRefresh={this._onRefresh.bind(this)}
          onEndReachedThreshold={1}
          onEndReached={this._onLoadMore.bind(this)}
          refreshing={this.state.isLoading}
          keyExtractor={(item, index) => index.toString()}/>
        <ActionButton
          buttonColor='rgba(255,192,0,1)'
          elevation={5}
          shadowColor='#000'
          shadowOpacity={0.3}
          shadowOffset={{width: 2, height: 1}}
          onPress={this._onShowAddNewWallet.bind(this)}/>
        {this._renderAddNewWalletModal()}
        {this._renderRemoveConfirmationModal()}
      </View>
    )
  }

  _renderItem({ item }) {
    return (
      <View
        style={styles.listItem}>
        <View style = {styles.listItemContainer}>
          <View style={styles.coinGroup}>
            <Text style={styles.valueItem}>
              {Utils.getCurrencyName(item.coin)}
            </Text>
          </View>

          <View style={styles.nameGroup}>
            <Text style={styles.valueItem}>
              {item.wallet_name}
            </Text>
          </View>

          <View style={styles.withdrawGroup}>
            <TouchableHighlight style={styles.withdrawButton}
              onPress={() => this._onWithdraw(wallet)}
              underlayColor='#FF3300'>
              <Text style={styles.buttonTitle}>
                {I18n.t('myPage.wallet.withdraw')}
              </Text>
            </TouchableHighlight>
          </View>

          <View style={styles.removeGroup}>
            <TouchableHighlight style={styles.withdrawButton}
              onPress={() => this._onShowRemoveWalletConfirmation(item)}
              underlayColor='#FF3300'>
              <Text style={styles.buttonTitle}>
                {I18n.t('myPage.wallet.remove')}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View key="rowID" style={styles.separator}/>
    );
  }

  _renderHeader() {
    return (
      <View style={styles.tabBar}>
        <View style={styles.coinGroup}>
          <Text style={styles.normalHeader}>
            {I18n.t('myPage.wallet.coin')}
          </Text>
        </View>

        <View style={styles.nameGroup}>
          <Text style={styles.normalHeader}>
            {I18n.t('myPage.wallet.walletName')}
          </Text>
        </View>

        <View style={styles.withdrawGroup}>
          <Text style={styles.normalHeader}>
            {I18n.t('myPage.wallet.withdraw')}
          </Text>
        </View>

        <View style={styles.removeGroup}>
          <Text style={styles.normalHeader}>
            {I18n.t('myPage.wallet.remove')}
          </Text>
        </View>
      </View>
    );
  }

  _renderAddNewWalletModal() {
    return (
      <Modal
        isVisible={this.state.addNewWalletDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackdropPress={this._dismissAddNewWalletModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={{borderRadius: 5, padding: 0, marginStart: 30, marginEnd: 30}}>
          <Text style={{fontSize: 13, marginTop: 16, marginBottom: 16, marginStart: 16, marginEnd: 16}}>
            {I18n.t('myPage.wallet.addNewWalletHeader')}
          </Text>
          <View style={{height: 1, backgroundColor: '#EBEBEB'}}/>

          <Text style={styles.addNewWalletTitle}>
            {I18n.t('myPage.wallet.coinType')}
          </Text>
          <Picker
            style={styles.picker}
            selectedValue={this.state.selectedCoinType}
            mode='dropdown'
            onValueChange={this._onCoinPickerSelect.bind(this)}
            itemStyle={{width: '100%'}}>
            {this._renderItems()}
          </Picker>

          <Text style={styles.addNewWalletTitle}>
            {I18n.t('myPage.wallet.walletAddress')}
          </Text>
          <TextInput style={styles.addNewWalletTextInput}
            underlineColorAndroid='transparent'
            onChangeText={text => this._newWalletParams.wallet_address = text}/>

          <Animated.View>
            {
              this.state.selectedCoinType === 'xrp' &&
              <View>
                <Text style={styles.addNewWalletTitle}>
                  {I18n.t('myPage.wallet.destination')}
                </Text>
                <TextInput style={styles.addNewWalletTextInput}
                  underlineColorAndroid='transparent'
                  onChangeText={text => this._newWalletParams.tag = text}/>
              </View>
            }
          </Animated.View>

          <Text style={styles.addNewWalletTitle}>
            {I18n.t('myPage.wallet.walletName')}
          </Text>
          <TextInput style={styles.addNewWalletTextInput}
            underlineColorAndroid='transparent'
            onChangeText={text => this._newWalletParams.wallet_name = text}/>
          
          <TouchableOpacity
            style={[styles.submitAddNewWallet, { marginTop: 20, marginBottom: 30 }]}
            onPress={this._onAddNewWallet.bind(this)}>
            <Text style={{fontSize: 13, color: '#FFF'}}>
              {I18n.t('myPage.wallet.addNewWalletSubmit')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _renderRemoveConfirmationModal() {
    return (
      <Modal
        isVisible={this.state.removeWalletDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackdropPress={this._dismissRemoveConfirmationModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={{borderRadius: 5, padding: 0, marginStart: 30, marginEnd: 30}}>
          <Text style={[styles.addNewWalletTitle, {textAlign: 'center'}]}>
            {I18n.t('myPage.wallet.removeConfirmDesc')}
          </Text>
          
          <TouchableOpacity
            style={[styles.submitAddNewWallet, { marginTop: 20, marginBottom: 30 }]}
            onPress={this._onRemove.bind(this)}>
            <Text style={{fontSize: 13, color: '#FFF'}}>
              {I18n.t('myPage.wallet.removeConfirm')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _renderItems() {
    return _.map(this._coinTypes, (coin, index) => (
      <Picker.Item value={coin} label={Utils.getCurrencyName(coin)} key={`${index}`}/>
    ));
  }

  _onRefresh() {
    this._page = 1;
    this._hasNext = true;
    this.setState({
      wallets: []
    })
    this._loadWallets();
  }

  _onLoadMore(info) {
    this._loadWallets();
  }

  _onShowAddNewWallet() {
    this.setState({addNewWalletDialogVisible: true})
  }

  _onAddNewWallet() {
    this._addWallet();
  }

  _onWithdraw(wallet) {
    this._withdraw(wallet);
  }

  _onShowRemoveWalletConfirmation(wallet) {
    this._selectedWallet = wallet;
    this.setState({removeWalletDialogVisible: true})
  }

  _onRemove(wallet) {
    this._removeWallet(wallet);
  }

  _dismissAddNewWalletModal() {
    this._newWalletParams = {};
    this.state.selectedCoinType = '';
    this.setState({addNewWalletDialogVisible: false})
  }

  _dismissRemoveConfirmationModal() {
    this._selectedWallet = {};
    this.setState({removeWalletDialogVisible: false})
  }

  _onCoinPickerSelect(itemValue, itemPosition) {
    this.setState({selectedCoinType: itemValue});
  }

  async _loadWallets() {
    if (!this.state._hasNext) {
      this.setState({
        isLoading: false
      })
      return;
    }

    this.setState({
      isLoading: true
    })

    try {
      let res = await rf.getRequest('UserRequest').getWithdrawallAddresses();
      let wallets = res.data;
      this._hasNext = false;
      this.setState({
        wallets: this.state.wallets.concat(wallets),
        isLoading: false,

        addNewWalletDialogVisible: false
      })
    }
    catch(err) {
      console.log('WalletScreen._loadWallets', err);
      this.setState({
        isLoading: false
      })
    }
  }

  async _withdraw(wallet) {
    try {
      
    }
    catch(err) {
      console.log('WalletScreen._loadWallets', err);
    }
  }

  async _addWallet() {
    try {
      let res = await rf.getRequest('UserRequest').updateOrCreateWithdrawalAddress(this._newWalletParams, this.state.selectedCoinType);
      let newWallet = res.data;

      let wallets = this.state.wallets;
      wallets.push(newWallet);
      this._newWalletParams = {};
      this.state.selectedCoinType = '';
      this.setState({ wallets });
    }
    catch(err) {
      console.log('WalletScreen._loadWallets', err);
    }
  }

  async _removeWallet(wallet) {
    try {
      
      this._dismissRemoveConfirmationModal();
    }
    catch(err) {
      console.log('WalletScreen._loadWallets', err);
    }
  }

  async _getAvailableCoins() {
    try {
      let res = await rf.getRequest('MasterdataRequest').getAll();
      this._coinTypes = _.map(_.filter(res.coin_settings, ['currency', Consts.CURRENCY_KRW]), 'coin');
    }
    catch(err) {
      console.log('WalletScreen._getAvailableCoins', err);
    }
  }
}

const styles = StyleSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  listView: {
    flex: 1,
  },
  listItem: {
    height: 64
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#DEE3EB',
    opacity: 0.3
  },
  coinGroup: {
    flex: 3,
    alignItems: 'center',
  },
  nameGroup: {
    flex: 3,
    alignItems: 'center',
  },
  withdrawGroup: {
    flex: 2,
    alignItems: 'center',
  },
  removeGroup: {
    flex: 2,
    alignItems: 'center',
  },
  normalHeader: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold'
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    backgroundColor: '#F8F9FB',
    paddingLeft: 10,
    paddingRight: 10,
  },
  valueItem: {
    fontSize: 12,
    textAlign: 'center'
  },
  buttonTitle: {
    fontSize: 13,
    marginStart: 5,
    marginEnd: 5
  },
  withdrawButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FF3300',
    borderWidth: 1,
    borderRadius: 5,
    height: 30
  },
  dialog: {
    marginStart: 40,
    marginEnd: 40,
    backgroundColor: '#FFF'
  },
  submitAddNewWallet: {
    marginTop: 30,
    marginStart: 16,
    marginEnd: 16,
    height: 40,
    backgroundColor: '#0070C0',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addNewWalletTitle: {
    fontSize: 13,
    marginTop: 16,
    marginStart: 16,
    marginEnd: 16
  },
  addNewWalletTextInput: {
    marginTop: 2,
    marginStart: 16,
    marginEnd: 16,
    height: 40,
    borderColor: '#D9D9D9',
    borderRadius: 5,
    borderWidth: 1
  },
  picker: {
    marginTop: 2,
    marginStart: 16,
    marginEnd: 16,
    height: 40,
    borderColor: '#D9D9D9',
    borderRadius: 5,
    borderWidth: 1,
  }
});