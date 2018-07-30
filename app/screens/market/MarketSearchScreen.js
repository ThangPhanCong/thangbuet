import React from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TextInput,
  SafeAreaView,
  View,
  FlatList,
  Image,
  Keyboard,
  Dimensions
} from 'react-native';
import { Card } from 'react-native-elements';
import BaseScreen from '../BaseScreen';
import { TabNavigator, TabBarTop } from 'react-navigation';
import Consts from '../../utils/Consts';
import UIUtils from '../../utils/UIUtils';
import { getCurrencyName } from '../../utils/Filters';
import { CommonColors, CommonStyles, Fonts } from '../../utils/CommonStyles';
import I18n from '../../i18n/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MarketScreen from './MarketScreen';
import rf from '../../libs/RequestFactory';
import { each, isEmpty, filter } from 'lodash';
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";
import Modal from 'react-native-modal';

let TabBarNavigator;

class MarketSearchScreen extends BaseScreen {
  _refs = {};

  _searchInputWidth = 0;
  _screenHeight = 0;

  constructor(props) {
    super(props);
    this.state = {
      searchList: [],
      searchListVisible: false,
      isFavoriteFilter: false,
      isShowComingSoon: false
    }
    TabBarNavigator = this._initTabNavigator();
  }

  render() {
    return (
      <SafeAreaView style={styles.screen}
        onLayout={event => this._screenHeight = event.nativeEvent.layout.height}>
        {this._renderHeader()}
        <TabBarNavigator onNavigationStateChange={this._onTabChanged.bind(this)}/>
        {this._renderSearchList()}
        {this._renderComingSoon()}
      </SafeAreaView>
    )
  }

  _renderHeader() {
    return (
      <View style={styles.header}>
        <View style={styles.leftView}>
          <TouchableOpacity style={styles.favoriteButton}
                            onPress={this._onFavoriteFilter.bind(this)}>
            <Icon
              name='star'
              size={scale(18)}
              color={this.state.isFavoriteFilter ? '#FFC000' : '#D9D9D9'}/>
          </TouchableOpacity>
          <Text style={styles.titleLeftView}>
            {I18n.t('marketList.favorite')}
          </Text>
        </View>
        <View style={styles.searchViewContainer}
          onLayout={(event) => this._searchInputWidth = event.nativeEvent.layout.width}>
          <View style={styles.searchView}>
            <TextInput style={styles.inputSearch}
                       underlineColorAndroid='transparent'
                       onChangeText={this._onTextChanged.bind(this)}
                       onFocus={this._onSearchFocus.bind(this)}
                       placeholder={I18n.t('marketList.search')}
                       placeholderTextColor="#A6A6A6"/>

            <View style={styles.iconContainer}>
              <Image source={require('../../../assets/search/search.png')} style={styles.searchIcon}/>
            </View>
          </View>
        </View>
      </View>
    )
  }

  _renderSearchList() {
    let { searchList } = this.state;

    return (
      this.state.searchListVisible &&
      <View
        style={{
          position: 'absolute',
          top: scale(50),
          left: 0,
          right: 0,
          height: this._calculateSearchViewHeight()
        }}>
        <TouchableWithoutFeedback
          onPress={this._dismissSearchList.bind(this)}>
          <View
            style={{flex: 1}}>
            <FlatList
              style={[styles.searchResult, { marginStart: Dimensions.get('window').width - this._searchInputWidth - scale(16)}]}
              keyboardDismissMode='interactive'
              keyboardShouldPersistTaps='handled'
              data={searchList}
              extraData={this.state}
              renderItem={this._renderItem.bind(this)}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={this._renderSeparator}/>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }

  _calculateSearchViewHeight() {
    return Math.min(this.state.searchList.length * scale(44), this._screenHeight - scale(50))
  }

  _renderItem({ item }) {
    return (
      <TouchableHighlight
        style={styles.listItem}
        onPressIn={() => this._onPressItem(item)}
        underlayColor='#FFECED'>
        <View style={styles.listItemContainer}>
          <Text style={styles.searchResultLabel}>
            {item.coinPair}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }

  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View key="rowID" style={styles.separator}/>
    );
  }

  _initTabNavigator() {
    return TabNavigator(
      {
        MarketScreenKRW: {
          screen: (props) => <MarketScreen {...props} currency={Consts.CURRENCY_KRW}
                                           showMarketScreenDetail={this._onPressItem.bind(this)}
                                           ref={ref => this._refs.marketKRW = ref}/>,
          navigationOptions: () => ({
            tabBarLabel: (options) => UIUtils.renderTabItem(getCurrencyName(Consts.CURRENCY_KRW), options)
          })
        },
        MarketScreenBTC: {
          screen: (props) => <MarketScreen {...props} currency={Consts.CURRENCY_BTC}
                                           showMarketScreenDetail={this._onPressItem.bind(this)}
                                           ref={ref => this._refs.marketBTC = ref}/>,
          navigationOptions: () => ({
            tabBarLabel: (options) => UIUtils.renderTabItem(getCurrencyName(Consts.CURRENCY_BTC), options)
          })
        },
        MarketScreenETH: {
          screen: (props) => <MarketScreen {...props} currency={Consts.CURRENCY_ETH}
                                           showMarketScreenDetail={this._onPressItem.bind(this)}
                                           ref={ref => this._refs.marketETH = ref}/>,
          navigationOptions: () => ({
            tabBarLabel: (options) => UIUtils.renderTabItem(getCurrencyName(Consts.CURRENCY_ETH), options, false)
          })
        }
      },
      {
        navigationOptions: ({ navigation }) => ({
          gesturesEnabled: false,
          tabBarOnPress: ({previousScene, scene, jumpToIndex}) => {
            console.log('onPress:', scene.route);
            if (scene.index > 0) {
              this.setState({
                isShowComingSoon: true
              })
              return;
            }

            jumpToIndex(scene.index);
          }
        }),
        tabBarComponent: TabBarTop,
        ...CommonStyles.tabOptions
      }
    );
  }

  _renderComingSoon() {
    return (
      <Modal
        isVisible={this.state.isShowComingSoon}
        avoidKeyboard={true}
        useNativeDriver={true}
        backdropColor='transparent'
        onBackdropPress={() => this.setState({isShowComingSoon: false})}>
        <Card
          style={styles.dialog}
          containerStyle={styles.cardContainer}>
          <Text style={styles.comingSoonTitle}>
            {I18n.t('common.comingSoon')}
          </Text>
          <View style={{ height: scale(1), backgroundColor: '#EBEBEB' }}/>
          <TouchableOpacity
            style={styles.comingSoonConfirmButton}
            onPress={() => this.setState({isShowComingSoon: false})}>
            <Text style={styles.comingSoonConfirmButtonText}>
              {I18n.t('common.confirm')}
            </Text>
          </TouchableOpacity>
        </Card>
      </Modal>
    )
  }

  _onPressItem(item) {
    Keyboard.dismiss();
    this.navigate('TradingScreen', item);
  }

  _onFavoriteFilter() {
    this.setState({ isFavoriteFilter: !this.state.isFavoriteFilter }, () => {
      each(Object.values(this._refs), marketScreen => {
        if (marketScreen.filterFavoriteChanged)
          marketScreen.filterFavoriteChanged(this.state.isFavoriteFilter);
      })
    })
  }

  _onTabChanged(prevState, nextState, action) {
    each(Object.values(this._refs), marketScreen => {
      if (marketScreen.setFavoriteFilter)
        marketScreen.setFavoriteFilter(this.state.isFavoriteFilter);
    })
  }

  _dismissSearchList() {
    if (this.state.searchListVisible) {
      this.setState({
        searchListVisible: false
      })
    }
  }

  _onTextChanged(searchText) {
    if (isEmpty(searchText)) {
      this.setState({
        searchList: [],
        searchListVisible: false
      })
      return;
    }

    this._searchList(searchText.toLowerCase().replace(/[^a-zA-Z]/g, ""));
  }

  _onSearchFocus(event) {
    if (isEmpty(this.state.searchList)) 
      return;

    this.setState({
      searchListVisible: true
    })
  }

  async _searchList(searchText) {
    try {
      let symbolResponse = await rf.getRequest('MasterdataRequest').getAll();
      let rawSymbols = filter(symbolResponse.coin_settings, e => e.currency === 'krw'); // only krw base
      rawSymbols.map(symbol => {
        symbol.coinPair = symbol.coin.toUpperCase() + '/' + symbol.currency.toUpperCase();
        symbol.noSeparatorCoinPair = symbol.coin + symbol.currency;
        symbol.reverseNoSeparatorCoinPair = symbol.currency + symbol.coin;
        return symbol;
      })
      let symbols = filter(
        rawSymbols,
        symbol => symbol.currency.includes(searchText) ||
                  symbol.coin.includes(searchText) ||
                  symbol.noSeparatorCoinPair.includes(searchText) ||
                  symbol.reverseNoSeparatorCoinPair.includes(searchText)
      );

      this.setState({
        searchList: symbols,
        searchListVisible: true
      })
    } catch (err) {
      console.log('MarketScreen._getSymbols', err);
    }
  }

  onBackButtonPressAndroid() {
    super.onBackButtonPressAndroid();

    if (this.state.searchListVisible) {
      this.setState({
        searchListVisible: false
      })
    }
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen
  },

  header: {
    height: '60@s',
    flexDirection: 'row'
  },
  favoriteButton: {
    width: '40@s',
    height: '40@s',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftView: {
    marginStart: '8@s',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  titleLeftView: {
    marginStart: -scale(5),
    fontSize: '12@s',
    ...Fonts.NotoSans_Bold
  },
  searchViewContainer: {
    flex: 3,
    justifyContent: 'center',
    marginStart: '10@s',
    marginEnd: '16@s'
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: '2@s'
  },
  searchView: {
    borderColor: '#BFBFBF',
    borderWidth: 1,
    flexDirection: 'row',
    borderRadius: '5@s',
    alignItems: 'center'
  },
  searchIcon: {
    alignSelf: 'flex-end',
    width: '10@s',
    height: '10@s',
    margin: '5@s',
    marginRight: '8@s'
  },
  inputSearch: {
    flex: 1,
    color: '#000',
    textAlign: 'center',
    fontSize: '9@s',
    height: '36@s',
    borderColor: null,
    alignSelf: 'center',
    ...Fonts.NanumGothic_Regular
  },
  listView: {
    flex: 1
  },
  listItem: {
    height: '44@s'
  },
  listItemContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: '10@s',
    paddingRight: '10@s'
  },
  searchResultLabel: {
    color: '#3B3838',
    fontSize: '13@s'
  },
  searchResult: {
    borderColor: '#D9D9D9',
    borderRadius: '2@s',
    borderWidth: '1@s',
    backgroundColor: '#FFF',
    marginEnd: '16@s'
  },
  dialog: {
    marginStart: '40@s',
    marginEnd: '40@s',
    backgroundColor: '#FFF'
  },
  cardContainer: {
    borderRadius: '5@s',
    padding: 0,
    marginStart: '30@s',
    marginEnd: '30@s',
    ...UIUtils.generatePopupShadow()
  },
  comingSoonConfirmButtonText: {
    marginStart: '30@s',
    marginEnd: '30@s',
    fontSize: '13@s',
    color: '#FFF',
    ...Fonts.NanumGothic_Regular
  },
  comingSoonConfirmButton: {
    marginTop: '10@s',
    marginBottom: '10@s',
    height: '40@s',
    backgroundColor: '#0070C0',
    borderRadius: '5@s',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  comingSoonTitle: {
    marginTop: '20@s',
    marginBottom: '20@s',
    textAlign: 'center',
    fontSize: '13@s',
    ...Fonts.NanumGothic_Regular
  }
});

export default MarketSearchScreen;