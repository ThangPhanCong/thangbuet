import { Observable } from 'rxjs';
import io from "socket.io-client";
import AppConfig from '../../utils/AppConfig';
import { eventNames } from 'cluster';

export default class SocketEpic {
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

  listen(event) {
    if (!this._obsevables[event])
      this._events.push(event);
      this._obsevables[event] = Observable.create(observer => {
        this._socket.on(event, data => {
          observer.next(data);

          if (!this._events.includes(event)) {
            observer.completed();
          }
        })
      })

    return this._obsevables[event]
  }

  remove(event) {
    const observable = this._obsevables[event]
    if (observable) {
      this._socket.off(event, () => {
        this._obsevables[event] = null;
        _.remove(this._events, e => e !== event);
      });
    }
  }
}
