import {
  API_SERVER as DEV_API_SERVER,
  SOCKET_SERVER as DEV_SOCKET_SERVER,
  CLIENT_SECRET as DEV_CLIENT_SECRET,
  ASSET_SERVER as DEV_ASSET_SERVER,
} from 'react-native-dotenv'

export default class AppConfig {
  static API_SERVER = 'http://api.bitkoex.com';
  static API_VERSION = 'v1';
  static SOCKET_SERVER = 'ws://socket.bitkoex.com:6001';
  static ASSET_SERVER = 'http://bitkoex.com';

  static CLIENT_SECRET = '';
  static ACCESS_TOKEN = '';
  static SUPPORT_URL = 'https://support.vcc.exchange/hc/en-us';
  static ABOUT_URL = 'https://vcc.exchange/about';
  static TERM_URL = 'https://support.vcc.exchange/hc/en-us';

  static getApiServer() {
    return __DEV__ ? DEV_API_SERVER : AppConfig.API_SERVER;
  }

  static getApiVersion() {
    return AppConfig.API_VERSION;
  }

  static getSocketServer() {
    return __DEV__ ? DEV_SOCKET_SERVER : AppConfig.SOCKET_SERVER;
  }

  static getClientSecret() {
    return __DEV__ ? DEV_CLIENT_SECRET : AppConfig.CLIENT_SECRET;
  }

  static getAssetServer() {
    return __DEV__ ? DEV_ASSET_SERVER : AppConfig.ASSET_SERVER;
  }
  static getSupportUrl() {
    return AppConfig.SUPPORT_URL;
  }
  static getAboutUrl() {
    return AppConfig.ABOUT_URL;
  }
  static getTermUrl() {
    return AppConfig.TERM_URL;
  }
}

