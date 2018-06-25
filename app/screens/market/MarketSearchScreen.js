import React from 'react';
import {
  Text,
  TouchableOpacity,
  PixelRatio,
  TextInput,
  SafeAreaView,
  View
} from 'react-native';
import BaseScreen from '../BaseScreen';
import { TabNavigator, TabBarTop } from 'react-navigation';
import Consts from '../../utils/Consts';
import { CommonStyles } from '../../utils/CommonStyles';
import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet';
import I18n from '../../i18n/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MarketScreen from './MarketScreen';

const TabBarNavigator = TabNavigator(
  {
    MarketScreenKRW: {
      screen: (props) => <MarketScreen {...props} currency = {Consts.CURRENCY_KRW}/>,
      navigationOptions: () => ({
        tabBarLabel: Consts.CURRENCY_KRW,
      })
    },
    MarketScreenBTC: {
      screen: (props) => <MarketScreen {...props} currency = {Consts.CURRENCY_BTC}/>,
      navigationOptions: () => ({
        tabBarLabel: Consts.CURRENCY_BTC,
      })
    },
    MarketScreenETH: {
      screen: (props) => <MarketScreen {...props} currency = {Consts.CURRENCY_ETH}/>,
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

class MarketSearchScreen extends BaseScreen {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SafeAreaView style = {styles.screen}>
        {this._renderHeader()}
        <TabBarNavigator/>
      </SafeAreaView>
    )
  }

  _onTextChanged(text) {
    
  }

  _renderHeader() {
    const { isFavorite } = this.props.navigation.state.params || {};

    return (
      <View style={styles.header}>
        <View style={styles.leftView}>
          <TouchableOpacity style = {styles.favoriteButton}>
            <Icon
              name='star'
              size={15}
              color={isFavorite ? 'yellow' : 'grey'} />
          </TouchableOpacity>
          <Text>
            즐겨찾기
          </Text>
        </View>
        <View style={styles.searchView}>
          <TextInput style={styles.inputSearch}
            underlineColorAndroid='transparent'
            onChangeText={this._onTextChanged.bind(this)}
            placeholder='검색'
            placeholderTextColor="#A6A6A6"
          />
          <Icon name="magnify"
            size={PixelRatio.getPixelSizeForLayoutSize(7)}
            style={styles.searchIcon}
            color="#000" />
        </View>
      </View>
    )
  }

  _renderTabBar() {
    return (
      <View style = { styles.tabBar }>
        
      </View>
    )
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
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row'
  },
  searchView: {
    flex: 3,
    borderColor: '#BFBFBF',
    borderWidth: 1,
    flexDirection: 'row',
    borderRadius: '5@s',
    alignItems: 'center'
  },
  searchIcon: {
    marginTop: "10@s",
    alignSelf: 'flex-end'
  },
  inputSearch: {
    color: '#FFF',
    alignItems: 'center',
    fontSize: "12@s",
    width: "40@s",
    marginLeft: "6@s",
    borderColor: null,
    alignSelf: 'center'
  }
});

export default MarketSearchScreen;