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
  Dimensions
} from 'react-native';
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
import _ from 'lodash';
import ScaledSheet from "../../libs/reactSizeMatter/ScaledSheet";
import { scale } from "../../libs/reactSizeMatter/scalingUtils";

let TabBarNavigator;

class MarketSearchScreen extends BaseScreen {
  _refs = {};

  _searchInputWidth = 0;

  constructor(props) {
    super(props);
    this.state = {
      searchList: [],
      searchListVisible: false,
      isFavoriteFilter: false
    }
    TabBarNavigator = this._initTabNavigator();
  }

  render() {
    return (
      <SafeAreaView style={styles.screen}>
        {this._renderHeader()}
        <TabBarNavigator onNavigationStateChange={this._onTabChanged.bind(this)}/>
        {this._renderSearchList()}
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
              size={18}
              color={this.state.isFavoriteFilter ? '#FFC000' : '#D9D9D9'}/>
          </TouchableOpacity>
          <Text style={styles.titleLeftView}>
            {I18n.t('marketList.favorite')}
          </Text>
        </View>
        <View style={styles.searchViewContainer}>
          <View style={styles.searchView}
                onLayout={(event) => this._searchInputWidth = event.nativeEvent.layout.width}>
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
          left: scale(97),
          right: 0,
          bottom: 0,
        }}>
        <TouchableWithoutFeedback onPress={this._dismissSearchList.bind(this)}>
          <View
            style={[styles.searchResult, { width: this._searchInputWidth }]}>
            <FlatList
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

  _renderItem({ item }) {
    return (
      <TouchableHighlight
        style={styles.listItem}
        onPress={() => this._onPressItem(item)}
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
          gesturesEnabled: false
        }),
        tabBarComponent: TabBarTop,
        ...CommonStyles.tabOptions
      }
    );
  }

  _onPressItem(item) {
    this.navigate('TradingScreen', item);
  }

  _onFavoriteFilter() {
    this.setState({ isFavoriteFilter: !this.state.isFavoriteFilter }, () => {
      _.each(Object.values(this._refs), marketScreen => {
        if (marketScreen.filterFavoriteChanged)
          marketScreen.filterFavoriteChanged(this.state.isFavoriteFilter);
      })
    })
  }

  _onTabChanged(prevState, nextState, action) {
    _.each(Object.values(this._refs), marketScreen => {
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
    if (_.isEmpty(searchText)) {
      this.setState({
        searchList: [],
        searchListVisible: false
      })
      return;
    }

    this._searchList(searchText.toLowerCase());
  }

  _onSearchFocus(event) {
    if (_.isEmpty(this.state.searchList))
      return;

    this.setState({
      searchListVisible: true
    })
  }

  async _searchList(searchText) {
    try {
      let symbolResponse = await rf.getRequest('MasterdataRequest').getAll();
      let symbols = _.filter(symbolResponse.coin_settings, symbol => symbol.currency.includes(searchText) || symbol.coin.includes(searchText));
      symbols.map(symbol => {
        symbol.coinPair = symbol.currency.toUpperCase() + '/' + symbol.coin.toUpperCase();
        return symbol;
      })

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
    height: '59@s',
    flexDirection: 'row'
  },
  favoriteButton: {},
  leftView: {
    marginStart: '16@s',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  titleLeftView: {
    fontSize: '12@s',
    marginStart: '5@s',
    ...Fonts.NotoSans
  },
  searchViewContainer: {
    flex: 3,
    justifyContent: 'center',
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
    margin: '5@s'
  },
  inputSearch: {
    flex: 1,
    color: '#000',
    textAlign: 'center',
    fontSize: '9@s',
    height: '30@s',
    borderColor: null,
    alignSelf: 'center'
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
  }
});

export default MarketSearchScreen;