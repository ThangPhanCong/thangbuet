import React from 'react';
import {
  PixelRatio,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  FlatList
} from 'react-native';
import BaseScreen from '../BaseScreen'
import { TabNavigator, TabBarBottom } from 'react-navigation'

import ScaledSheet from '../../libs/reactSizeMatter/ScaledSheet'

import TradingGeneralScreen from './TradingGeneralScreen'
import TradingOrderScreen from './TradingOrderScreen'
import TradingChartScreen from './TradingChartScreen'
import TradingConclusionScreen from './TradingConclusionScreen'

const TradeTabs = TabNavigator(
  {
    General: {
      screen: TradingGeneralScreen,
      navigationOptions: () => ({
        tabBarLabel: 'General'
      })
    },
    Order: {
      screen: TradingOrderScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Order'
      })
    },
    Chart: {
      screen: TradingChartScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Chart'
      })
    },
    Conclusion: {
      screen: TradingConclusionScreen,
      navigationOptions: () => ({
        tabBarLabel: 'Conclusion'
      })
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;

      },
      header: null,
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'top',
    tabBarOptions: {
      style: {
        backgroundColor: '#11151C',
        height: PixelRatio.getPixelSizeForLayoutSize(15),
        elevation: 0,
        borderTopWidth: 0,
      },
      labelStyle: {
        fontSize: 14 * PixelRatio.getFontScale(),
      },
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
    animationEnabled: false,
    swipeEnabled: true,
  })

export default class TradingScreen extends BaseScreen {

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false
    }
  }

  render() {
    return (
      <View style={styles.main}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => this.setState({ modalVisible: true })}>
                <Image
                  style={{ width: 30, height: 30 }}
                  source={{ uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png' }} />
              </TouchableOpacity>
              <Text>비트코인 / KRW</Text>
            </View>
            <View style={styles.headerContent}>
              <Text>13,114,500</Text>
              <Image
                style={{ width: 15, height: 15 }}
                source={{ uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png' }} />
              <Text>3%</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerContent}>
              <Text>보유 잔고 0.06445370 BTC</Text>
            </View>
            <View style={styles.headerContent}>
              <Text>수익률 11.26 %</Text>
            </View>
          </View>
        </View>
        <TradeTabs style={styles.body} />

        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => { }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() => this.setState({ modalVisible: false })}>
                <Text style={{ color: '#FFFFFF' }}>Close</Text>
              </TouchableOpacity>
              <FlatList
                data={[{ key: 'a' }, { key: 'b' }]}
                renderItem={({ item }) => <Text style={{ color: '#FFFFFF' }}>{item.key}</Text>} />
            </View>
          </View>
        </Modal>

      </View>
    )
  }
}

const styles = ScaledSheet.create({
  main: {
    flex: 1,
    flexDirection: 'column'
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerLeft: {
    flex: 1,
    // backgroundColor: 'red',
    flexDirection: 'column',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  headerRight: {
    flex: 1,
    // backgroundColor: 'blue'
  },
  modalContent: {
    width: 300,
    height: 400,
    backgroundColor: '#11151C',
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  body: {
  }
});