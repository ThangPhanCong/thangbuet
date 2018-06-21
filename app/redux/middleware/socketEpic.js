import { updateSocketData } from '../actions'

import ActionType from '../ActionType';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

const listenSocketEvent = action$ =>
  action$
    .ofType(ActionType.LISTEN_SOCKET_EVENT)
    .mergeMap(action => window.socket.listen(action.event))
    .map(res => updateSocketData(res.namespace, res.event, res.data))

export default listenSocketEvent;