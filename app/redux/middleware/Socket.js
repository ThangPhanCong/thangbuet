import { Observable } from 'rxjs';
import io from "socket.io-client";
import AppConfig from '../../utils/AppConfig';

export default class SocketEpic {
  constructor() {
    this._socket = this._initSocket();
  }

  _events = {};

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

  listen(event) {
    if (!this._events[event])
      this._events[event] = Observable.create(observer => {
        this._socket.on(event, data => {
          observer.next(data);
        })
      })

    return this._events[event]
  }

  remove(event) {
    const observable = this._events[event]
    if (observable) {
      this._socket.off(event, () => {
        this._events[event] = null;
      });
    }
  }
}
