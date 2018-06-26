import { AsyncStorage } from 'react-native'
import * as Keychain from 'react-native-keychain';
import AppConfig from './AppConfig';
import Consts from './Consts';

export default class AppPreferences {
  static lastTradingSymbol = null;

  static async init() {
    const symbol = await AsyncStorage.getItem('lastTradingSymbol');
    if (symbol) {
      let [currency, coin] = symbol.split('_');
      AppPreferences.lastTradingSymbol = { currency, coin };
    } else {
      AppPreferences.lastTradingSymbol = {
        currency: Consts.CURRENCY_KRW,
        coin: Consts.CURRENCY_BTC
      };
    }
  }

  static saveAccessToken(token) {
    AppConfig.ACCESS_TOKEN = token;
    Keychain.setGenericPassword('access_token', token, { accessible: Keychain.ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY });
    AsyncStorage.setItem('token_saved', 'true');
  }

  static async getAccessToken() {
    const tokenSaved = await AsyncStorage.getItem('token_saved');
    if (tokenSaved) {
      return await Keychain.getGenericPassword();
    } else {
      return Promise.resolve({});
    }
  }

  static removeAccessToken() {
    AppConfig.ACCESS_TOKEN = '';
    Keychain.resetGenericPassword();
    AsyncStorage.setItem('token_saved', 'false');
  }

  static saveLocale(locale) {
    AsyncStorage.setItem('user_locale', locale);
  }

  static async getLocale() {
    return await AsyncStorage.getItem('user_locale');
  }

  static async isHideSmallBalance() {
    return await AsyncStorage.getItem('isHideSmallBalance');
  }

  static setHideSmallBalance(isHideSmallBalance) {
    AsyncStorage.setItem('isHideSmallBalance', isHideSmallBalance);
  }

  static getLastTradingSymbol() {
    return AppPreferences.lastTradingSymbol;
  }

  static setLastTradingSymbol(currency, coin) {
    AppPreferences.lastTradingSymbol = { currency, coin };
    const symbol = `${currency}_${coin}`;
    AsyncStorage.setItem('lastTradingSymbol', symbol);
  }
}