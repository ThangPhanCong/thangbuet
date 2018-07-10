import BaseModelRequest from '../libs/BaseModelRequest';
import AppConfig from '../utils/AppConfig';
import Consts from '../utils/Consts';

export default class UserRequest extends BaseModelRequest {
  getModelName() {
    return 'users'
  }

  login(email, password, otp = '') {
    let params = {
      grant_type: 'password',
      client_id: '1',
      client_secret: AppConfig.getClientSecret(),
      username: email,
      password: password,
      scope: '*',
      otp: otp
    }
    return this.post('/oauth/token', params);
  }

  ressetPassword(email) {
    let url = '/reset-password';
    let params = {
      email: email
    }
    return this.post(url, params);
  }

  register(email, password, referralId = '') {
    let params = {
      email: email,
      password: password,
      password_confirmation: password,
      agree_term: 1,
      referrer_code: referralId
    }
    return this.post('/users', params);
  }

  getCurrentUser(useCache = true, params) {
    if (this.user && useCache) {
      return new Promise((resolve, reject) => {
        resolve(this.user);
      });
    }
    return new Promise((resolve, reject) => {
      let url = '/user';
      var self = this;
      this.get(url, params)
        .then(function (user) {
          self.user = user;
          resolve(user);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  getBalance() {
    if (window.GlobalSocket) {
      if (window.GlobalSocket.balance) {
        return new Promise((resolve, reject) => {
          resolve(window.GlobalSocket.balance);
        });
      }
    }

    return new Promise((resolve, reject) => {
      let url = '/balance';
      this.get(url)
        .then(function (res) {
          window.GlobalSocket.balance = res;
          resolve(res);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  getDetailsBalance(currency) {
    let url = '/balance/' + currency;
    return this.get(url);
  }

  getSecuritySettings(params) {
    let url = '/security-settings';
    return this.get(url, params);
  }

  getOrderBookSettings(params) {
    let url = '/order-book-settings';
    return this.get(url, params);
  }

  updateOrderBookSettings(params) {
    let url = '/order-book-settings';
    return this.put(url, params);
  }

  getDeviceRegister() {
    let url = '/devices';
    return this.get(url);
  }

  updateRestrictMode(params) {
    let url = '/restrict-mode';
    return this.put(url, params);
  }

  addDevice(params) {
    let url = '/add-device';
    return this.post(url, params);
  }

  deleteDevice(id) {
    let url = '/device/' + id;
    return this.del(url)
  }

  blockAccessDevice(id, state) {
    let url = '/device/' + id;
    return this.put(url, state)
  }

  getHistoryConnection(params) {
    let url = '/connections';
    return this.get(url, params);
  }

  getQRCodeGoogleUrl() {
    let url = '/key-google-authen';
    return this.get(url);
  }

  addSecuritySettingOtp(authentication_code) {
    let url = '/add-security-setting-otp';
    return this.put(url, { authentication_code });
  }

  verify(authentication_code) {
    let url = '/verify-google-authenticator';
    return this.get(url, authentication_code);
  }

  getWithdrawDaily(currency) {
    let url = '/transactions/withdraw-daily';
    return this.post(url, { currency: currency });
  }

  getWithdrawallAddresses() {
    let url = '/withdrawal-address';
    return this.get(url);
  }

  updateOrCreateWithdrawalAddress(params, typeCoin) {
    let url = '/withdrawal-address';
    if (typeCoin) {
      url += '/' + typeCoin;
    }
    return this.post(url, params);
  }

  deleteWithdrawallAddress(id) {
    let url = '/withdrawal-address/' + id;
    return this.del(url);
  }

  generateDepositAddress(params) {
    let url = '/deposit-address';
    return this.put(url, params);
  }

  changePassword(params) {
    let url = '/change-password';
    return this.put(url, params);
  }

  delGoogleAuth(params) {
    let url = '/google-auth';
    return this.del(url, params);
  }

  setUserLocale(params) {
    let url = '/locale';
    return this.put(url, params);
  }

  getInfoToAuthenticate() {
    let url = '/phone_verification_data';
    return this.get(url);
  }

  verifyBankAccount(params) {
    let url = '/bank-account';
    return this.put(url, params);
  }

  sendSmsOtp() {
    let url = '/send-sms-otp';
    return this.post(url);
  }

  verifyGoogleAuthentication(params) {
    let url = '/google-auth';
    return this.del(url, params)
  }

  getPhoneVerificationCipher() {
    let url = '/phone_verification_data';
    return this.get(url);
  }
}
