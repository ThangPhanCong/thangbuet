import { getCoinSuccess, getFailure } from '../actions'
import RequestFactory from '../../libs/RequestFactory';

import 'rxjs'
import { Observable } from 'rxjs/Observable'
import ActionType from '../ActionType';

const getCoinList = action$ => {
  action$.ofType(ActionType.GET_COIN_LIST)
    .mergeMap(action =>
      Observable.fromPromise(RequestFactory.getRequest('MasterdataRequest'))
        .map(data => (getCoinList(data)))
        .catch(error => Observable.of(getFailure(error)))
      )
}

export default getCoinList;