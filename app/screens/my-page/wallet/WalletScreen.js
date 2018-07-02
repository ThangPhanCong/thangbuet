import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  FlatList
} from 'react-native';
import { Card } from 'react-native-elements'
import Modal from 'react-native-modal';
import BaseScreen from '../../BaseScreen';
import rf from '../../../libs/RequestFactory';
import { CommonStyles } from '../../../utils/CommonStyles';
import I18n from '../../../i18n/i18n';

export default class WalletScreen extends BaseScreen {

  _newWallet = {}
  _coinType = '';

  _page = 1;
  _hasNext = true;
  _limit = 10;

  constructor(props) {
    super(props);

    this.state = {
      wallets: [],
      isLoading: false,

      addNewWalletDialogVisible: false
    }
  }

  componentWillMount() {
    super.componentWillMount()
    this._loadWallets();
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
          {this._renderAddNewWalletModal()}
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
              {item.created_at}
            </Text>
          </View>

          <View style={styles.nameGroup}>
            <Text style={styles.valueItem}>
              {item.device}
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
              onPress={() => this._onRemove(item)}
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

  _onRefresh() {
    this._page = 1;
    this._hasNext = true;
    this.setState({
      wallets: []
    })
    this._loadConnections();
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

  _onRemove(wallet) {
    this._removeWallet(wallet);
  }

  _dismissAddNewWalletModal() {
    this.setState({addNewWalletDialogVisible: false})
  }

  async _loadWallets() {
    if (!this.state._hasNext) {
      this.setState({
        isLoading: false
      })
      return;
    }
    else {
      this.setState({
        isLoading: true
      })
    }

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
      let res = await rf.getRequest('UserRequest').updateOrCreateWithdrawalAddress(this._newWallet, this._coinType);
      let newWallet = res.data;

      let wallets = this.state.wallets;
      wallets.push(newWallet);
      this.setState({ wallets });
    }
    catch(err) {
      console.log('WalletScreen._loadWallets', err);
    }
  }

  async _removeWallet(wallet) {
    try {
      
    }
    catch(err) {
      console.log('WalletScreen._loadWallets', err);
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
  }
});