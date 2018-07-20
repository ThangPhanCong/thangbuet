import fs from 'react-native-fs';
import BaseRequest from '../libs/BaseRequest';
import MasterdataUtils from '../utils/MasterdataUtils';
import AppConfig from '../utils/AppConfig';
import I18n from '../i18n/i18n';
import { reloadTranslations } from '../i18n/i18n';

export default class MasterdataRequest extends BaseRequest {

  async getAll() {
    let data = MasterdataUtils.getCachedMasterdata();
    if (!data) {
      data = await this._get();
    }

    try {
      await this.downloadTranslationsIfNeed(data);
    } catch (e) {
      console.log('MasterdataRequest.getAll', 'Error when downloading translations', e);
    }
    return data;
  }

  find(table, id) {
    return new Promise((resolve, reject) => {
      this.getAll()
        .then(data => {
          let record = data[table].find(row => parseInt(row.id) === parseInt(id));
          return resolve(record);
        })
    });
  }

  getTable(api, params) {
    let url = `/masterdata`;
    if (!params) params = {};
    params._table = api;
    return this.get(url, params);
  }

  _get() {
    let url = '/masterdata';
    return this.get(url)
      .then((res) => {
        masterdataVersion = res.dataVersion;
        cacheMasterdata = res.data;

        return MasterdataUtils.saveMasterdata(res.dataVersion, res.data);
      })
      .then(data => {
        return MasterdataUtils.getCachedMasterdata();
      });
  }

  async downloadTranslationsIfNeed(masterdata) {
    if (__DEV__) {
      return; // always use local data in dev environment
    }
    const mobileSettings = masterdata['mobile_settings'];
    const translationVersion = mobileSettings['translation_version'];
    const localTranslationVersion = await MasterdataUtils.getTranslationVersion();

    if (translationVersion == localTranslationVersion) {
      return;
    }

    console.log('Downloading new translations, current version: ' + localTranslationVersion
      + ', new version: ' + translationVersion);

    let promises = [];
    for (let locale in I18n.translations) {
      promises.push(this.downloadTransation(locale));
    }

    await Promise.all(promises);
    await MasterdataUtils.saveTranslationVersion(translationVersion);
    await reloadTranslations();
  }

  async downloadTransation(locale) {
    const path = `${fs.DocumentDirectoryPath}/${locale}.json`;

    const url = AppConfig.getAssetServer() + '/storage/mobile/locales/' + locale + '.json';
    const response = await fetch(url, {
        method: 'GET',
        headers: this._getHeader()
    });
    const content = await response.text();
    JSON.parse(content); // validate json

    await fs.writeFile(path, content);
  }
}
