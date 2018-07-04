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
import ModalDropdown from 'react-native-modal-dropdown';
import { Card } from 'react-native-elements'
import Modal from 'react-native-modal';
import BaseScreen from '../../BaseScreen';
import rf from '../../../libs/RequestFactory';
import { CommonStyles } from '../../../utils/CommonStyles';
import Utils from '../../../utils/Utils';
import I18n from '../../../i18n/i18n';
import _ from 'lodash';
import Consts from '../../../utils/Consts';
import TouchableTextHighlight from '../../../utils/TouchableTextHighlight';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class WalletScreen extends BaseScreen {

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

      newWalletParams: {},

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
      <TouchableHighlight
        style={styles.listItem}
        underlayColor='#FFECED'
        onPress={() => this._onShowWalletEditor(item)}>
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
            <TouchableTextHighlight
              style={styles.withdrawButton}
              onPress={() => this._onWithdraw(item)}
              underlayColor='#FF3300'
              textStyle={styles.buttonTitle}
              underlayTextColor='#FFF'
              normalTextColor='#FF3300'
              text={I18n.t('myPage.wallet.withdraw')}
            />
          </View>

          <View style={styles.removeGroup}>
            <TouchableTextHighlight
                style={styles.withdrawButton}
                onPress={() => this._onShowRemoveWalletConfirmation(item)}
                underlayColor='#FF3300'
                textStyle={styles.buttonTitle}
                underlayTextColor='#FFF'
                normalTextColor='#FF3300'
                text={I18n.t('myPage.wallet.remove')}
              />
          </View>
        </View>
      </TouchableHighlight>
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
          <View style={styles.addNewWalletTextInput}>
            <View style={{ position: 'absolute', right: 0, justifyContent: 'center', flex: 1, height: '100%'}}>
              <Icon
                name='menu-down'
                size={22}
                color= '#000'/>
            </View>
            <ModalDropdown
              style={{flex: 1, justifyContent: 'center'}}
              defaultValue=''
              dropdownStyle={{
                position: 'absolute',
                marginTop: 20,
                left: 0,
                right: 65,
                height: 200
              }}
              renderSeparator={() => <View style={{height: 0}}/>}
              options={_.map(this._coinTypes, e => Utils.getCurrencyName(e))}
              onSelect={this._onCoinPickerSelect.bind(this)}/>
          </View>

          <Text style={styles.addNewWalletTitle}>
            {I18n.t('myPage.wallet.walletAddress')}
          </Text>
          <TextInput style={styles.addNewWalletTextInput}
            value={this.state.newWalletParams.wallet_address}
            underlineColorAndroid='transparent'
            onChangeText={text =>
              this.setState({
                newWalletParams: {
                  ...this.state.newWalletParams,
                  wallet_address: text
                }
              })
            }/>

          <Animated.View>
            {
              this.state.selectedCoinType === 'xrp' &&
              <View>
                <Text style={styles.addNewWalletTitle}>
                  {I18n.t('myPage.wallet.destination')}
                </Text>
                <TextInput style={styles.addNewWalletTextInput}
                  value={this.state.newWalletParams.tag}
                  underlineColorAndroid='transparent'
                  onChangeText={text => 
                    this.setState({
                      newWalletParams: {
                        ...this.state.newWalletParams,
                        tag: text
                      }
                    })
                  }/>
              </View>
            }
          </Animated.View>

          <Text style={styles.addNewWalletTitle}>
            {I18n.t('myPage.wallet.walletName')}
          </Text>
          <TextInput style={styles.addNewWalletTextInput}
            value={this.state.newWalletParams.wallet_name}
            underlineColorAndroid='transparent'
            onChangeText={text =>
              this.setState({
                newWalletParams: {
                  ...this.state.newWalletParams,
                  wallet_name: text
                }
              })
            }/>
          
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
            {I18n.t('myPage.wallet.removeConfirmDesc').format(this._selectedWallet.wallet_name)}
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

  _onShowWalletEditor(wallet) {
    this.setState({
      newWalletParams: {
        wallet_name: wallet.wallet_name,
        wallet_address: wallet.wallet_address,
        tag: wallet.tag
      },

      addNewWalletDialogVisible: true,
      selectedCoinType: wallet.coin
    })
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

  _onRemove() {
    this._removeWallet();
  }

  _dismissAddNewWalletModal() {
    this.state.selectedCoinType = '';
    this.setState({
      newWalletParams: {},
      addNewWalletDialogVisible: false
    })
  }

  _dismissRemoveConfirmationModal() {
    this.setState({removeWalletDialogVisible: false}, () => {
      this._selectedWallet = {};
    })
  }

  _onCoinPickerSelect(index) {
    let selectedCoinType = this._coinTypes[index];
    this.setState({selectedCoinType});
  }

  async _loadWallets() {
    if (!this._hasNext) {
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
        isLoading: false
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
      let res = await rf.getRequest('UserRequest').updateOrCreateWithdrawalAddress(this.state.newWalletParams, this.state.selectedCoinType);
      let newWallet = res.data;

      let wallets = this.state.wallets;
      wallets.push(newWallet);
      this.state.selectedCoinType = '';
      this.setState({
        newWalletParams: {},
        wallets,
        addNewWalletDialogVisible: false
      });
    }
    catch(err) {
      console.log('WalletScreen._addWallet', err);
    }
  }

  async _removeWallet() {
    try {
      await rf.getRequest('UserRequest').deleteWithdrawallAddress(this._selectedWallet.id);
      let wallets = _.filter(this.state.wallets, w => w === this._selectedWallet);

      this._selectedWallet = {};
      this.setState({ wallets, removeWalletDialogVisible: false })
    }
    catch(err) {
      console.log('WalletScreen._removeWallet', err);
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
    marginStart: 15,
    marginEnd: 15,
    color: '#FF3300'
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