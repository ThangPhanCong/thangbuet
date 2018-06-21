import { Observable } from 'rxjs';
import io from "socket.io-client";
import AppConfig from './utils/AppConfig';

export default class Socket {
  constructor() {
    this._socket = this._initSocket();
  }

  _events = [];
  _channels = [];
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

  listen(event, channel) {
    if (!this._obsevables[event]) {
      this._events.push(event);
      let observable = Observable.create(observer => {
        this._socket.on(event, data => {
          if (!this._channels.includes(channel))
            this._socket.join(channel);

          if (this._events.includes(event)) {
            observer.next({
              event,
              channel,
              data
            });
          }

          // Once observable is disposed, this handler closure will be not keept by any observable instance,
          // so this `observable` will be escaped from retain cycle by itself
          if (!this._socket || this._socket.disconnect || this._obsevables[event] !== observable) {
            observer.unsubscribe()
          }
        })
      })

      this._obsevables[event] = observable
    }

    return this._obsevables[event]
  }

  remove(event) {
    _.remove(this._events, e => e === event);
    this._obsevables[event] = null;
  }
}
