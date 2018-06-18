import BaseRequest from '../libs/BaseRequest';
import MasterdataUtils from '../utils/MasterdataUtils';

export default class MasterdataRequest extends BaseRequest {
  getAll() {
    let cacheMasterdata = MasterdataUtils.getCachedMasterdata();
    if (cacheMasterdata) {
      return Promise.resolve(cacheMasterdata);
    } else {
      return this._get();
    }
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

}
