import React from 'react';
import {
  Text,
  TouchableOpacity,
  TouchableHighlight,
  PixelRatio,
  TextInput,
  SafeAreaView,
  View,
  FlatList
} from 'react-native';
import {
  Card
} from 'react-native-elements';
import BaseScreen from '../BaseScreen';
import { TabNavigator, TabBarTop } from 'react-navigation';
import Consts from '../../utils/Consts';
import { CommonStyles } from '../../utils/CommonStyles';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import I18n from '../../i18n/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MarketScreen from './MarketScreen';
import rf from '../../libs/RequestFactory';
import _ from 'lodash';

let TabBarNavigator;

class MarketSearchScreen extends BaseScreen {
  constructor(props) {
    super(props);
    this.state = {
      searchList: []
    }
    TabBarNavigator = this._initTabNavigator();
  }

  render() {
    return (
      <SafeAreaView style = {styles.screen}>
        {this._renderHeader()}
        <TabBarNavigator/>
      </SafeAreaView>
    )
  }

  _renderHeader() {
    const { isFavorite } = this.props.navigation.state.params || {};

    return (
      <View style={styles.header}>
        <View style={styles.leftView}>
          <TouchableOpacity style = {styles.favoriteButton}>
            <Icon
              name='star'
              size={18}
              color={isFavorite ? '#FFC000' : '#D9D9D9'} />
          </TouchableOpacity>
          <Text style = {styles.titleLeftView}>
            즐겨찾기
          </Text>
        </View>
        <View style={styles.searchViewContainer}>
          <View style={styles.searchView}>
            <TextInput style={styles.inputSearch}
              underlineColorAndroid='transparent'
              onChangeText={this._onTextChanged.bind(this)}
              placeholder='검색'
              placeholderTextColor="#A6A6A6"
            />
            <View style={styles.iconContainer}>
              <Icon name="magnify"
                size={PixelRatio.getPixelSizeForLayoutSize(8)}
                style={styles.searchIcon}
                color="#000" />
            </View>
          </View>
          {this._renderSearchList()}
        </View>
      </View>
    )
  }

  _renderSearchList() {
    let { searchList } = this.state;
    if (_.isEmpty(searchList))
      return null;

    return (
      <Card style={styles.searchResult}>
        <FlatList
          style={styles.listView}
          data={this.state.searchList}
          extraData={this.state}
          renderItem={this._renderItem.bind(this)}
        />
      </Card>
    )
  }

  _renderItem(item){
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

  _initTabNavigator() {
    return TabNavigator(
      {
        MarketScreenKRW: {
          screen: (props) => <MarketScreen {...props} currency = {Consts.CURRENCY_KRW} showMarketScreenDetail={this._onPressItem.bind(this)}/>,
          navigationOptions: () => ({
            tabBarLabel: Consts.CURRENCY_KRW,
          })
        },
        MarketScreenBTC: {
          screen: (props) => <MarketScreen {...props} currency = {Consts.CURRENCY_BTC} showMarketScreenDetail={this._onPressItem.bind(this)}/>,
          navigationOptions: () => ({
            tabBarLabel: Consts.CURRENCY_BTC,
          })
        },
        MarketScreenETH: {
          screen: (props) => <MarketScreen {...props} currency = {Consts.CURRENCY_ETH} showMarketScreenDetail={this._onPressItem.bind(this)}/>,
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

  async _onTextChanged(searchText) {
    let searchList;
    if (_.isEmpty(searchText))
      searchList = [];
    else
      searchList = await this._searchList(searchText.toLowerCase());
    
    this.setState({
      searchList
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
      return symbols;
    } catch (err) {
      console.log('MarketScreen._getSymbols', err);
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

  },
  leftView: {
    marginStart: '16@s',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  titleLeftView: {
    marginStart: '5@s'
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
    alignSelf: 'flex-end'
  },
  inputSearch: {
    flex: 1,
    color: '#000',
    textAlign: 'center',
    fontSize: "12@s",
    height: "30@s",
    marginStart: "6@s",
    borderColor: null,
    alignSelf: 'center'
  },
  listView: {
    flex: 1,
  },
  listItem: {
    height: "44@s"
  },
  listItemContainer: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: "10@s",
    paddingRight: "10@s"
  },
  searchResultLabel: {
    color: '#3B3838',
    fontSize: '14@s'
  },
  searchResult: {
    zIndex: 99,
    marginTop: '3@s'
  }
});

export default MarketSearchScreen;