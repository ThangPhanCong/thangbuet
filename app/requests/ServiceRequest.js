import BaseRequest from '../libs/BaseRequest';

export default class ServiceRequest extends BaseRequest {

  sendContact(params) {
    let url = '/contact';
    return this.post(url, params);
  }
}