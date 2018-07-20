import zlib from 'react-zlib-js';
import buffer from 'react-zlib-js/buffer';
import { AsyncStorage } from 'react-native'
import rf from '../libs/RequestFactory';
import { flatMap, uniq } from 'lodash';

const masterdataVersionKey = 'masterdata_version';
const masterdataKey = 'masterdata';
const translationVersionKey = 'translation_version';

let masterdataVersion = null;
let cacheMasterdata = null;

export default class MasterdataUtils {
  static loadData() {
    return Promise.all([
      AsyncStorage.getItem(masterdataVersionKey)
        .then(version => masterdataVersion = version),
      AsyncStorage.getItem(masterdataKey)
        .then(zipData => {
          if (!zipData) {
            return;
          }

          try {
            const buf = buffer(zipData, 'base64');
            const unzipData = zlib.unzipSync(buf).toString();
            cacheMasterdata = JSON.parse(unzipData);
            if (__DEV__) {
              console.log('Masterdata', cacheMasterdata);
            }
          } catch (e) {
            console.log(e);
          }
        })
    ]);
  }

  static isDataChanged(version) {
    return masterdataVersion != version;
  }

  static clearMasterdata() {
    return Promise.all([
      AsyncStorage.removeItem(masterdataVersionKey)
        .then(() => masterdataVersion = undefined),
      AsyncStorage.removeItem(masterdataKey)
        .then(() => cacheMasterdata = undefined)
    ]);
  }

  static saveMasterdata(version, data) {
    cacheMasterdata = data;
    masterdataVersion = version;

    let zipData = undefined;
    try {
      zipData = zlib.gzipSync(JSON.stringify(cacheMasterdata)).toString('base64');
    } catch (e) {
      console.log(e);
    }
    return AsyncStorage.setItem(masterdataVersionKey, masterdataVersion)
      .then(() => {
        return AsyncStorage.setItem(masterdataKey, zipData)
      });
  }

  static getCachedMasterdata() {
    return cacheMasterdata;
  }

  static async getTranslationVersion() {
    return await AsyncStorage.getItem(translationVersionKey);
  }

  static async saveTranslationVersion(version) {
    return await AsyncStorage.setItem(translationVersionKey, version)
  }

  static async getCoins() {
    let data = await rf.getRequest('MasterdataRequest').getAll();
    let coins = [];
    coins = flatMap(data.coin_settings, function (value) {
      return [value.coin];
    });
    coins = uniq(coins);
    return coins;
  }

  static async getCurrencies() {
    let data = await rf.getRequest('MasterdataRequest').getAll();
    let currencies = [];
    currencies = flatMap(data.coin_settings, function (value) {
      return [value.currency];
    });
    currencies = uniq(currencies);
    return currencies;
  }

  static async getCurrenciesAndCoins(callback) {
    let data = await rf.getRequest('MasterdataRequest').getAll();
    let currencies = [];
    let coins = [];
    currencies = flatMap(data.coin_settings, function (value) {
      return [value.currency];
    });
    coins = flatMap(data.coin_settings, function (value) {
      return [value.coin];
    });
    currencies = uniq(currencies.concat(coins));
    return currencies;
  }
};
