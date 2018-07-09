import BaseRequest from '../libs/BaseRequest';
import MasterdataUtils from '../utils/MasterdataUtils';
import fs from 'react-native-fs';
import { reloadTranslations } from '../i18n/i18n';

export default class MasterdataRequest extends BaseRequest {

  getAll() {
    let cacheMasterdata = MasterdataUtils.getCachedMasterdata();
    let data;
    if (cacheMasterdata) {
      data = Promise.resolve(cacheMasterdata);
    } else {
      data = this._get();
    }

    let currencyTranslation = this.getCurrencyTranslation()
      .catch(err => {})

    return Promise.all([
      data,
      currencyTranslation
    ]).then(res => res[0])
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

  getCurrencyTranslation(forceUpdate = false) {
    let path = fs.DocumentDirectoryPath + '/currency.json';
    return fs.exists(path)
    .then((exists) => {
      if (exists && !forceUpdate) {
        return null;
      }
  
      // let url = '';
      // return this.get(url)
      return fetch('http://192.168.1.97:3000/currency', {
        method: 'GET',
        headers: this._getHeader()
      })
      .then(res => res.text())
      .then(res => JSON.parse(res));
    })
    .then(res => {
      if (res) {
        let data = res.data;
        return fs.writeFile(path, JSON.stringify(data), 'utf8')
          .then(() => true);
      }

      return false;
    })
    .then(success => {
      if (success)
        reloadTranslations()
    })
  }
}
