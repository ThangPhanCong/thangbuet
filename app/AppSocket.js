import { Observable } from 'rxjs';
import io from "socket.io-client";
import AppConfig from './utils/AppConfig';

export default class Socket {
  constructor() {
    this._socket = this._initSocket();
  }

  _events = [];
  _obsevables = {};

  _initSocket() {
    if (AppConfig.ACCESS_TOKEN) {
      return io.connect(AppConfig.getSocketServer(), {
        extraHeaders: {
          'Authorization': 'Bearer ' + AppConfig.ACCESS_TOKEN,
        }
      });
    }

    return null;
  }

  connect() {
    if (!this._socket.connected) {
      this._socket.connect();
    }
  }

  disconnect() {
    this._socket.disconnect();
  }

  listen(event, namspace) {
    if (!this._obsevables[event]) {
      this._events.push(event);
      this._obsevables[event] = Observable.create(observer => {
        this._socket.on(event, data => {
          if (this._events.includes(event)) {
            observer.next({
              event,
              namspace,
              data
            });
          }
        })
      })
    }

    return this._obsevables[event]
  }

  remove(event) {
    _.remove(this._events, e => e === event);
  }
}
