import { Observable } from 'rxjs';
import io from "socket.io-client";
import AppConfig from './utils/AppConfig';

export default class Socket {
  constructor() {
    this._socket = this._initSocket();
  }

  _obsevables = {};
  _eventChannels = [];

  _initSocket() {
    if (AppConfig.ACCESS_TOKEN) {
      return io.connect(AppConfig.getSocketServer(), {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: 'Bearer ' + AppConfig.ACCESS_TOKEN,
            }
          }
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
      this._eventChannels.push({event, channel});
      let observable = Observable.create(observer => {
        this._socket.on(event, data => {
          observer.next({
            event,
            channel,
            data
          });

          // Once observable is disposed, this handler closure will be not keept by any observable instance,
          // so this `observable` will be escaped from retain cycle by itself
          if (!this._socket || this._socket.disconnect || this._obsevables[event] !== observable) {
            observer.unsubscribe()
          }
        })
      })

      this._obsevables[event] = observable
    }

    if (!this._eventChannels.some(e => e.channel === channel))
      this._socket.emit('join', channel);

    return this._obsevables[event]
  }

  removeChannel(channel) {
    this._channels[channel] = null;
    this._socket.emit('leave', channel);
  }

  removeEvent(event) {
    _.remove(this._eventChannels, e => e.event === event);
    this._obsevables[event] = null;
  }
}
