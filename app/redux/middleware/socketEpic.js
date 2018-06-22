import { updateSocketData } from '../actions'
import RequestFactory from '../../libs/RequestFactory';
import ActionType from '../ActionType';


import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import Consts from '../../utils/Consts';
import { Observable } from 'rxjs';

const listenPublicSocketEvent = action$ =>
  action$
    .ofType(ActionType.LISTEN_PUBLIC_SOCKET_EVENT)
    .mergeMap(action => window.GlobalSocket.listen(action.event, action.channel, false))
    .map(res => updateSocketData(res))

const listenPrivateSocketEvent = action$ =>
  action$
    .ofType(ActionType.LISTEN_PRIVATE_SOCKET_EVENT)
    .mergeMap(action => {
      if (action.userId)
        return Observable.of({
            channel: Consts.SOCKET_CHANNEL.PRIVATE + userId,
            event: action.event
          })
      else
        return Observable
          .fromPromise(RequestFactory.getRequest('UserRequest').getCurrentUser())
          .map(res => res.data.id)
          .map(userId => {
            return {
              channel: Consts.SOCKET_CHANNEL.PRIVATE + userId,
              event: action.event
            }
          })
      }
    )
    .mergeMap(action => window.GlobalSocket.listen(action.event, action.channel, true))
    .map(res => updateSocketData(res))

export default { listenPublicSocketEvent, listenPrivateSocketEvent };