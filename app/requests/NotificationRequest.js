import BaseRequest from '../libs/BaseRequest';

export default class NotificationRequest extends BaseRequest {

  getUnreadNotifications() {
    let url = '/notifications/unread';
    return this.get(url);
  }

  markAllAsRead() {
    let url = '/notifications/read';
    return this.put(url);
  }

}
