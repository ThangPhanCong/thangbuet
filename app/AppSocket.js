import { Observable } from 'rxjs';
import Echo from 'laravel-echo';
import AppConfig from './utils/AppConfig';

export default class Socket {
  constructor() {
    this._echo = this._initEcho();
  }

  _obsevables = {};
  _eventChannels = [];

  _initEcho() {
    return new Echo({
      broadcaster: 'socket.io',
      host: AppConfig.getSocketServer(),
      encrypted: true,
      client: require('socket.io-client'),
      auth: {
        headers: {
          Authorization: 'Bearer ' + AppConfig.ACCESS_TOKEN,
        },
      },
    });
  }

  connect() {
    this._echo.connect();
  }

  disconnect() {
    if (this._echo)
      this._echo.disconnect();
  }

  listen(event, channel, isPrivate) {
    if (!this._obsevables[event]) {
      this._eventChannels.push({ event, channel });
      let observable;
      if (isPrivate) {
        observable = Observable.create(observer => {
          this._echo.private(channel)
            .listen(event, res => {
              observer.next({
                data: res.data,
                event,
                channel,
                isPrivate
              })

              // Once observable is disposed, this handler closure will be not keept by any observable instance,
              // so this `observable` will be escaped from retain cycle by itself
              if (!this._echo || this._obsevables[event] !== observable) {
                console.log('Unsubscribe observable');
                observer.unsubscribe()
              }
            });
        })
      }
      else {
        observable = Observable.create(observer => {
          this._echo.channel(channel)
            .listen(event, res => {
              observer.next({
                data: res.data,
                event,
                channel,
                isPrivate
              })

              // Once observable is disposed, this handler closure will be not keept by any observable instance,
              // so this `observable` will be escaped from retain cycle by itself
              if (!this._echo || this._obsevables[event] !== observable) {
                console.log('Unsubscribe observable');
                observer.unsubscribe()
              }
            });
        })
      }

      this._obsevables[event] = observable
    }

    return this._obsevables[event]
  }

  removeChannel(channel) {
    this._channels[channel] = null;
  }

  removeEvent(event) {
    _.remove(this._eventChannels, e => e.event === event);
    this._obsevables[event] = null;
  }
}
