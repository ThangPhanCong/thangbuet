import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  PixelRatio,
  TextInput,
  SafeAreaView,
  View,
  FlatList
} from 'react-native';
import BaseScreen from '../BaseScreen';
import { TabNavigator, TabBarTop } from 'react-navigation';
import Consts from '../../utils/Consts';
import { CommonStyles } from '../../utils/CommonStyles';
import I18n from '../../i18n/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MarketScreen from './MarketScreen';
import rf from '../../libs/RequestFactory';
import _ from 'lodash';

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
      <SafeAreaView style = {styles.screen}>
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
          <TouchableOpacity style = {styles.favoriteButton}
            onPress={this._onFavoriteFilter.bind(this)}>
            <Icon
              name='star'
              size={18}
              color={this.state.isFavoriteFilter ? '#FFC000' : '#D9D9D9'} />
          </TouchableOpacity>
          <Text style = {styles.titleLeftView}>
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
              placeholder='검색'
              placeholderTextColor="#A6A6A6"/>
            
            <View style={styles.iconContainer}>
              <Icon name="magnify"
                size={PixelRatio.getPixelSizeForLayoutSize(12)}
                style={styles.searchIcon}
                color="#000" />
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
        style={{position: 'absolute', top: 50, left: 0, right: 0, bottom: 0, zIndex: 99, backgroundColor: 'transparent'}}>
        <TouchableWithoutFeedback
          style={{flex: 1}}
          onPress={this._dismissSearchList.bind(this)}>
          <View style={{flex: 1, backgroundColor: 'transparent'}}>
            <View
              style={[styles.searchResult, { width: this._searchInputWidth }]}>
              <FlatList
                style={styles.listView}
                data={searchList}
                extraData={this.state}
                renderItem={this._renderItem.bind(this)}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={this._renderSeparator}/>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }

  _renderItem({ item }){
    return (
      <TouchableHighlight
        style={styles.listItem}
        onPress={() => this._onPressItem(item)}
        underlayColor='#FFECED'>
        <View style = {styles.listItemContainer}>
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
          screen: (props) => <MarketScreen {...props} currency = {Consts.CURRENCY_KRW} showMarketScreenDetail={this._onPressItem.bind(this)} ref = {ref => this._refs.marketKRW = ref}/>,
          navigationOptions: () => ({
            tabBarLabel: Consts.CURRENCY_KRW,
          })
        },
        MarketScreenBTC: {
          screen: (props) => <MarketScreen {...props} currency = {Consts.CURRENCY_BTC} showMarketScreenDetail={this._onPressItem.bind(this)} ref = {ref => this._refs.marketBTC = ref}/>,
          navigationOptions: () => ({
            tabBarLabel: Consts.CURRENCY_BTC,
          })
        },
        MarketScreenETH: {
          screen: (props) => <MarketScreen {...props} currency = {Consts.CURRENCY_ETH} showMarketScreenDetail={this._onPressItem.bind(this)} ref = {ref => this._refs.marketETH = ref}/>,
          navigationOptions: () => ({
            tabBarLabel: Consts.CURRENCY_ETH,
          })
        }
      },
      {
        navigationOptions: ({ navigation }) => ({
          gesturesEnabled: false
        }),
        tabBarComponent: TabBarTop,
        tabBarPosition: 'top',
        tabBarOptions: {
          upperCaseLabel: true,
          activeTintColor: '#FFC000',
          inactiveTintColor: '#D9D9D9',
          style: {
            backgroundColor: '#3B3838',
          },
          indicatorStyle: {
            backgroundColor: '#FFC000'
          },
          labelStyle: {
            fontSize: 16
          }
        },
        animationEnabled: false,
        swipeEnabled: false
      }
    );
  }

  _onPressItem(item) {
    console.log('Navigate to trading screen', item);
    // this.navigate('MarketDetailScreen', item);
  }

  _onFavoriteFilter() {
    this.setState({isFavoriteFilter: !this.state.isFavoriteFilter}, () => {
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

const styles = StyleSheet.create({
  screen: {
    ...CommonStyles.screen
  },

  header: {
    height: 60,
    flexDirection: 'row'
  },
  favoriteButton: {

  },
  leftView: {
    marginStart: 16,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  titleLeftView: {
    fontSize: 13,
    marginStart: 5
  },
  searchViewContainer: {
    flex: 3,
    justifyContent: 'center',
    marginEnd: 16
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: 2
  },
  searchView: {
    borderColor: '#BFBFBF',
    borderWidth: 1,
    flexDirection: 'row',
    borderRadius: 5,
    alignItems: 'center'
  },
  searchIcon: {
    alignSelf: 'flex-end'
  },
  inputSearch: {
    flex: 1,
    color: '#000',
    textAlign: 'center',
    fontSize: 13,
    height: 36,
    borderColor: null,
    alignSelf: 'center'
  },
  listView: {
    flex: 1
  },
  listItem: {
    height: 44
  },
  listItemContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 10
  },
  searchResultLabel: {
    color: '#3B3838',
    fontSize: 13
  },
  searchResult: {
    borderColor: '#D9D9D9',
    borderRadius: 2,
    borderWidth: 1,
    backgroundColor: '#FFF',
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0
  }
});

export default MarketSearchScreen;