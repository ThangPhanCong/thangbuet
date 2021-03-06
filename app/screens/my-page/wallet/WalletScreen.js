import React from 'react';
import {
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  View,
  FlatList,
  Animated,
  Image
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { Card } from 'react-native-elements'
import Modal from 'react-native-modal';
import BaseScreen from '../../BaseScreen';
import rf from '../../../libs/RequestFactory';
import { CommonStyles, Fonts, CommonColors } from '../../../utils/CommonStyles';
import Utils from '../../../utils/Utils';
import I18n from '../../../i18n/i18n';
import { map, filter } from 'lodash';
import Consts from '../../../utils/Consts';
import TouchableTextHighlight from '../../../utils/TouchableTextHighlight';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScaledSheet from '../../../libs/reactSizeMatter/ScaledSheet';
import { scale } from '../../../libs/reactSizeMatter/scalingUtils';
import UIUtils from "../../../utils/UIUtils";
import AddressValidator from "../../../utils/AddressValidator";

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
      listCoin: {},
      addressValidated: true,
      newWalletParams: {},
      addNewWalletDialogVisible: false,
      removeWalletDialogVisible: false
    }
    this.addressValidator = new AddressValidator();
  }

  componentWillMount() {
    super.componentWillMount()
    this._loadWallets();
    this._getAvailableCoins();
  }

  componentDidMount() {
    super.componentDidMount()
    this._getListCoin()
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
        <TouchableOpacity
          style = {styles.buttonAddContainer}
          onPress={this._onShowAddNewWallet.bind(this)}>
          <Image
            style={styles.buttonAdd}
            source={require('../../../../assets/myPage/wallet/add.png')}/>
        </TouchableOpacity>


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
        <View style={styles.listItemContainer}>
          <View style={styles.coinGroup}>
            <Text style={styles.valueItem}>
              {I18n.t(`currency.${item.coin}.shortname`)}
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
        onBackButtonPress={this._dismissAddNewWalletModal.bind(this)}
        onBackdropPress={this._dismissAddNewWalletModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={styles.cardNewWallet}>
          <Text style={styles.titleNewWallet}>
            {I18n.t('myPage.wallet.addNewWalletHeader')}
          </Text>
          <View style={{ height: scale(1), backgroundColor: '#EBEBEB' }}/>

          <Text style={styles.addNewWalletTitle}>
            {I18n.t('myPage.wallet.coinType')}
          </Text>
          <View style={styles.viewModalDropDown}>
            <TouchableOpacity style={styles.menuDownNewWallet}
              onPress={this._onShowCoinListDropdown.bind(this)}>
              <Icon
                name='menu-down'
                color='#000'
                style={styles.iconMenuDown}
              />
            </TouchableOpacity>
            <ModalDropdown
              ref={ref => this._coinDropDown = ref}
              style={{ flex: 1, justifyContent: 'center' }}
              defaultValue=''
              dropdownStyle={[styles.modalAddWalletDropDown, {
                height: this._calculateModalHeight()
              }]}
              textStyle={styles.modalTextInput}
              dropdownTextStyle={styles.textModalDropDown}
              renderSeparator={() => <View style={{ height: 0 }}/>}
              options={this._generateOptionList()}
              onSelect={this._onCoinPickerSelect.bind(this)}/>
          </View>

          <Text style={styles.addNewWalletTitle}>
            {I18n.t('myPage.wallet.walletAddress')}
          </Text>
          <TextInput style={styles.addNewWalletTextInput}
                     value={this.state.newWalletParams.wallet_address}
                     underlineColorAndroid='transparent'
                     onChangeText={(text) => this._onChangeAddressInput(text)}/>
          {
            this.state.addressValidated
            ? (<Text style={styles.addressIncorrect}></Text>)
            : (<Text style={styles.addressIncorrect}>{I18n.t('myPage.wallet.addressIncorrect')}</Text>)
          }

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
            style={[styles.submitAddNewWallet, { marginTop: scale(20), marginBottom: scale(30) }]}
            onPress={this._onAddNewWallet.bind(this)}>
            <Text style={styles.submitWallet}>
              {I18n.t('myPage.wallet.addNewWalletSubmit')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _onShowCoinListDropdown() {
    this._coinDropDown.show();
  }

  _generateOptionList() {
    return map(this._coinTypes, e => {
      let t = I18n.t(`currency.${e}.fullname`)
      if (t)
        return t + ' - ' + Utils.getCurrencyName(e);
      else
        return Utils.getCurrencyName(e);
    })
  }

  _calculateModalHeight() {
    if (this._coinTypes.length == 0)
      return scale(39);
    if (this._coinTypes.length > 5)
      return scale(200);

    return this._coinTypes.length * scale(39);
  }

  _renderRemoveConfirmationModal() {
    return (
      <Modal
        isVisible={this.state.removeWalletDialogVisible}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackButtonPress={this._dismissRemoveConfirmationModal.bind(this)}
        onBackdropPress={this._dismissRemoveConfirmationModal.bind(this)}>
        <Card
          style={styles.dialog}
          containerStyle={styles.cardContainer}>
          <Text style={[styles.addNewWalletTitle, { textAlign: 'center' }]}>
            {I18n.t('myPage.wallet.removeConfirmDesc').format(this._selectedWallet.wallet_name)}
          </Text>

          <TouchableOpacity
            style={[styles.submitAddNewWallet, styles.removeWallet]}
            onPress={this._onRemove.bind(this)}>
            <Text style={styles.submitWallet}>
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
    this.setState({ addNewWalletDialogVisible: true })
  }

  async _onAddNewWallet() {
    if (this.state.addressValidated){
      this._addWallet();
    }
  }

  _onChangeAddressInput(text){
    this.setState({
      newWalletParams: {
        ...this.state.newWalletParams,
        wallet_address: text
      }
    }, () => {
      let coin = this.state.selectedCoinType.toLowerCase();
      let address = this.state.newWalletParams.wallet_address;

      this.addressValidator.validateAddress(coin, address, this.validateAddressStatus)
    })
  }

  validateAddressStatus = (addressValidated) => {
    this.setState({ addressValidated })
  };

  _onWithdraw(wallet) {
    // Navigate to withdraw screen
    let coin = wallet.coin;
    let symbol = {...wallet, ...this.state.listCoin[coin], code: coin};
    this.props.screenProps.navigation.navigate('Withdrawal', {symbol});
  }

  _onShowRemoveWalletConfirmation(wallet) {
    this._selectedWallet = wallet;
    this.setState({ removeWalletDialogVisible: true })
  }

  _onRemove() {
    this._removeWallet();
  }

  _dismissAddNewWalletModal() {
    this.state.selectedCoinType = '';
    this.setState({
      newWalletParams: {},
      addNewWalletDialogVisible: false,
      addressValidated: true
    })
  }

  _dismissRemoveConfirmationModal() {
    this.setState({ removeWalletDialogVisible: false }, () => {
      this._selectedWallet = {};
    })
  }

  _onCoinPickerSelect(index) {
    let selectedCoinType = this._coinTypes[index];
    this.setState({ selectedCoinType });
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
    catch (err) {
      if(err.message === Consts.NOT_LOGIN) {
        return this._onError(err);
      }

      console.log('WalletScreen._loadWallets', err);
      this.setState({
        isLoading: false
      })
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
        addNewWalletDialogVisible: false,
        addressValidated: true
      });
    }
    catch (err) {
      console.log('WalletScreen._addWallet', err);
    }
  }

  async _removeWallet() {
    try {
      await rf.getRequest('UserRequest').deleteWithdrawallAddress(this._selectedWallet.id);
      let wallets = filter(this.state.wallets, w => w !== this._selectedWallet);

      this._selectedWallet = {};
      this.setState({ wallets, removeWalletDialogVisible: false })
    }
    catch (err) {
      console.log('WalletScreen._removeWallet', err);
    }
  }

  async _getAvailableCoins() {
    try {
      let res = await rf.getRequest('MasterdataRequest').getAll();
      this._coinTypes = map(filter(res.coin_settings, ['currency', Consts.CURRENCY_KRW]), 'coin');
    }
    catch (err) {
      console.log('WalletScreen._getAvailableCoins', err);
    }
  }

  async _getListCoin(){
    try {
      const responseBalance = await rf.getRequest('UserRequest').getBalance();
      this.setState({listCoin: responseBalance.data});
    } catch (err) {
      if(err.message === Consts.NOT_LOGIN) {
        return this._onError(err);
      }
    }
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },
  listView: {
    flex: 1,
  },
  listItem: {
    height: '64@s'
  },
  listItemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '10@s',
    paddingRight: '10@s'
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
    fontSize: '13@s',
    ...Fonts.NanumGothic_Bold,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '36@s',
    backgroundColor: '#F8F9FB',
    paddingLeft: '10@s',
    paddingRight: '10@s',
    borderColor: CommonColors.separator,
    borderBottomWidth: '1@s'
  },
  valueItem: {
    fontSize: '12@s',
    textAlign: 'center',
    ...Fonts.NanumGothic_Regular,
  },
  buttonTitle: {
    fontSize: '13@s',
    marginStart: '15@s',
    marginEnd: '15@s',
    color: '#FF3300',
    ...Fonts.NanumGothic_Regular,
  },
  withdrawButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FF3300',
    borderWidth: '1@s',
    borderRadius: '5@s',
    height: '30@s'
  },
  dialog: {
    marginStart: '40@s',
    marginEnd: '40@s',
    backgroundColor: '#FFF'
  },
  submitAddNewWallet: {
    marginTop: '30@s',
    marginStart: '16@s',
    marginEnd: '16@s',
    height: '40@s',
    backgroundColor: '#0070C0',
    borderRadius: '5@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addNewWalletTitle: {
    fontSize: '13@s',
    marginTop: '16@s',
    marginStart: '16@s',
    marginEnd: '16@s',
    ...Fonts.NanumGothic_Regular,
  },
  addNewWalletTextInput: {
    marginTop: '2@s',
    marginStart: '16@s',
    marginEnd: '16@s',
    height: '40@s',
    borderColor: '#D9D9D9',
    borderRadius: '5@s',
    borderWidth: '1@s',
    paddingLeft: '16@s',
    paddingRight: '16@s',
    fontSize: '13@s',
    ...Fonts.NanumGothic_Regular
  },
  picker: {
    marginTop: '2@s',
    marginStart: '16@s',
    marginEnd: '16@s',
    height: '40@s',
    borderColor: '#D9D9D9',
    borderRadius: '5@s',
    borderWidth: '1@s',
  },
  cardContainer: {
    borderRadius: '5@s',
    padding: 0,
    marginStart: '30@s',
    marginEnd: '30@s',
    ...UIUtils.generatePopupShadow()
  },
  removeWallet: {
    marginTop: '20@s',
    marginBottom: '30@s'
  },
  cardNewWallet: {
    borderRadius: '5@s',
    padding: 0,
    marginStart: '30@s',
    marginEnd: '30@s',
    ...UIUtils.generatePopupShadow()
  },
  titleNewWallet: {
    fontSize: '13@s',
    marginTop: '16@s',
    marginBottom: '16@s',
    marginStart: '16@s',
    marginEnd: '16@s',
    ...Fonts.NanumGothic_Regular
  },
  menuDownNewWallet: {
    position: 'absolute',
    right: 0,
    justifyContent: 'center',
    flex: 1,
    height: '100%'
  },
  submitWallet: {
    fontSize: '13@s',
    color: '#FFF',
    ...Fonts.NanumGothic_Regular
  },
  iconMenuDown: {
    paddingRight: '10@s',
    fontSize: '28@s'
  },
  modalAddWalletDropDown: {
    position: 'absolute',
    marginTop: '20@s',
    right: '65@s',
    borderColor: '#D9D9D9',
    borderRadius: '3@s',
    borderWidth: '1@s',
    ...UIUtils.generatePopupShadow()
  },
  viewModalDropDown: {
    marginTop: '2@s',
    marginStart: '15@s',
    marginEnd: '16@s',
    height: '40@s',
    borderColor: '#D9D9D9',
    borderRadius: '5@s',
    borderWidth: '1@s'
  },
  textModalDropDown: {
    lineHeight: '22@s',
    fontSize: '13@s',
    color: '#000',
    textAlign: 'center',
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: '1@s',
    ...Fonts.NanumGothic_Regular,
  },
  modalTextInput: {
    textAlign: 'center',
    fontSize: '13@s',
    color: '#000',
    ...Fonts.NanumGothic_Regular,
  },
  buttonAdd: {
    width: '60@s',
    height: '60@s'
  },
  buttonAddContainer: {
    position: 'absolute',
    right: '15@s',
    bottom: '20@s',
  },
  addressIncorrect: {
    color: 'red',
    fontSize: '12@s',
    marginLeft: '18@s',
    lineHeight: '22@s',
    ...Fonts.NotoSans_Regular,
  }
});
