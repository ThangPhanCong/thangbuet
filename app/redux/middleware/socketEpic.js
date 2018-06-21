import { updateSocketData } from '../actions'
import RequestFactory from '../../libs/RequestFactory';
import ActionType from '../ActionType';

import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import Consts from '../../utils/Consts';

const listenPublicSocketEvent = action$ =>
  action$
    .ofType(ActionType.LISTEN_PUBLIC_SOCKET_EVENT)
    .switchMap(action => window.socket.listen(action.event, action.channel))
    .map(res => updateSocketData(res.event, res.channel, false, res.data))

const listenPrivateSocketEvent = action$ =>
  action$
    .ofType(ActionType.LISTEN_PRIVATE_SOCKET_EVENT)
    .switchMap(action =>
        Observable
          .fromPromise(RequestFactory.getRequest('UserRequest').getCurrentUser())
          .map(res => res.data.id)
          .map(userId => {
            return {
              channel: Consts.SOCKET_CHANNEL.PRIVATE + userId,
              event: action.event
            }
          })
    )
    .map(action => window.socket.listen(action.event, action.channel))
    .map(res => updateSocketData(res.event, res.channel, true, res.data))

export default { listenPublicSocketEvent, listenPrivateSocketEvent };