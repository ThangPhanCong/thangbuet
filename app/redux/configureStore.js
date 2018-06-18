import { createStore, applyMiddleware } from 'redux';
import reducers from './reducer';

import { combineEpics } from 'redux-observable';

const _loadMiddleware = () => {
  const epics = require('./middleware');
  return applyMiddleware(combineEpics(epics.value()));
}

export default function configureStore () {
  const store = createStore(reducers, _loadMiddleware());
  return store;
}