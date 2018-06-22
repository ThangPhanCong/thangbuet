import React from 'react';
import { Image, View } from 'react-native';
import { initApp } from '../../App';
import AppConfig from '../utils/AppConfig';
import BaseScreen from './BaseScreen';
import { CommonColors, CommonStyles } from "../utils/CommonStyles";
import ScaledSheet from '../libs/reactSizeMatter/ScaledSheet';
import { connect } from 'react-redux';
import Consts from '../utils/Consts';
import ActionType from '../redux/ActionType';

class SplashScreen extends BaseScreen {
  static navigationOptions = {
    header: null,
    headerStyle: {
      backgroundColor: CommonColors.screenBgColor
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      email: undefined,
      password: undefined
    };
  }

  componentWillMount() {
    super.componentWillMount();
    // TODO start animation
    initApp()
      .then(() => {
        if (AppConfig.ACCESS_TOKEN) {
          this._dispatchAllSocketEvents();
        }
      })
      .then(() => {
        if (AppConfig.ACCESS_TOKEN) {
          this.navigate('MainScreen');
        } else {
          // TODO show market info
          this.navigate('LoginScreen');
        }
      });
  }

  render() {
    return (
      <View
        style={styles.screen}>
        <Image
          resizeMode={'contain'}
          style={styles.logoStyle}
          source={require('../../assets/common/logoLogin.png')}
        />
      </View>
    )
  }

  _dispatchAllSocketEvents() {
    let { listenPrivateEvent, listenPublicEvent } = this.props;
    listenPublicEvent(Consts.SOCKET_EVENTS.PRICE_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_PRICES);
    listenPublicEvent(Consts.SOCKET_EVENTS.ORDER_TRANSACTION_CREATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_ORDERS);
    listenPublicEvent(Consts.SOCKET_EVENTS.ORDER_BOOK_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_ORDER_BOOK);
    listenPublicEvent(Consts.SOCKET_EVENTS.COIN_MARKET_CAP_TICKET_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_COIN_MARKKETCAP_TICKER);
    listenPublicEvent(Consts.SOCKET_EVENTS.MARKET_PRICE_CHANGES_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_MARKET_PRICES_CHANGE);
    listenPublicEvent(Consts.SOCKET_EVENTS.PROFIT_RATE_UPDATED, Consts.SOCKET_CHANNEL.PUBLIC.APP_PROFIT_RATE);

    listenPrivateEvent(Consts.SOCKET_EVENTS.BALANCE_UPDATED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.TRANSACTION_CREATED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.USER_ORDER_BOOK_UPDATED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.ORDER_CHANGED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.USER_SESSION_REGISTERED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.FAVORITE_SYMBOLS_UPDATED);
    listenPrivateEvent(Consts.SOCKET_EVENTS.ORDER_LIST_UPDATED);
  }
}

const styles = ScaledSheet.create({
  screen: {
    ...CommonStyles.screen,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoStyle: {
    width: "180@s",
    height: "60@s"
  }
});

function mapDispatchToProps(dispatch) {
  return {
    listenPublicEvent: (event, channel) => dispatch({
      type: ActionType.LISTEN_PUBLIC_SOCKET_EVENT,
      event,
      channel
    }),
    listenPrivateEvent: (event) => dispatch({
      type: ActionType.LISTEN_PRIVATE_SOCKET_EVENT,
      event
    })
  }
}

export default connect(null, mapDispatchToProps)(SplashScreen);