import AppConfig from '../utils/AppConfig';
import AppPreferences from '../utils/AppPreferences';
import MasterdataUtils from '../utils/MasterdataUtils';
import Consts from "../utils/Consts";

export default class BaseRequest {
  async get(url, params = {}) {
    let query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');
    let fullUrl = this._getFullUrl(url) + '?' + query;
    let response = await fetch(fullUrl, {
      method: 'GET',
      headers: this._getHeader()
    });
    this._logRequest('GET', url, params);
    return await this._processResponse(response, url);
  }

  async put(url, params = {}) {
    let response = await fetch(this._getFullUrl(url), {
      method: 'PUT',
      headers: this._getHeader(),
      body: JSON.stringify(params)
    });
    this._logRequest('PUT', url, params);
    return await this._processResponse(response, url);
  }

  async post(url, params = {}) {
    let response = await fetch(this._getFullUrl(url), {
      method: 'POST',
      headers: this._getHeader(),
      body: JSON.stringify(params)
    });
    this._logRequest('POST', url, params);
    return await this._processResponse(response, url);
  }

  async del(url, params = {}) {
    let response = await fetch(this._getFullUrl(url), {
      method: 'DELETE',
      headers: this._getHeader(),
      body: JSON.stringify(params)
    });
    this._logRequest('DELETE', url, params);
    return await this._processResponse(response, url);
  }

  _getFullUrl(url) {
    return AppConfig.getApiServer() + '/api/' + AppConfig.getApiVersion() + url
  }

  _getHeader() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + AppConfig.ACCESS_TOKEN
    }
  }

  async _processResponse(response, url) {
    await this._checkResponseCode(response, url);

    const content = await response.text();
    let data = undefined;
    try {
      data = content ? JSON.parse(content) : {};
      this._logResponse(response.status, data);
    } catch (error) {
      this._logResponse(response.status, content);
      throw error;
    }

    await this._checkMasterdataVersion(data);
    return data;
  }

  async _checkResponseCode(response, url) {
    console.log("response:", response)
    if (!response.ok) {
      // if (response.status == '401') {
      //   AppPreferences.removeAccessToken();
      //   window.GlobalSocket.disconnect();
      //   // RNRestart.Restart();
      //   if (!this._isLoginRequest(url)) {
      //     RNRestart.Restart();
      //   }
      // }
      //2:--data default
          //sang tab khac thi sang login.
      if(response.status === 401) {
        throw new Error(Consts.NOT_LOGIN);
      }

      const content = await response.text();
      let data = undefined;
      try {
        data = response ? JSON.parse(content) : {};
        this._logResponse(response.status, data);
      } catch (error) {
        this._logResponse(response.status, content);
        throw content;
      }

      throw data;
    }
  }

  _isLoginRequest(url) {
    return url === '/oauth/token';
  }

  _logRequest(method, url, params) {
    if (__DEV__) {
      console.log(method + ': ' + url, params);
    }
  }

  _logResponse(responseCode, data) {
    if (__DEV__) {
      console.log(responseCode, data);
    }
  }

  async _checkMasterdataVersion(data) {
    if (MasterdataUtils.isDataChanged(data.dataVersion)) {
      await MasterdataUtils.clearMasterdata();
    }
  }

  _responseHandler(resolve, res) {
    return resolve(res.body.data);
  }
}
