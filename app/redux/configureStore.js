import { createStore, applyMiddleware } from 'redux';
import reducers from './reducer';

import { combineEpics, createEpicMiddleware } from 'redux-observable';

const _loadRootEpic = () => {
  const epics = require('./middleware/marketList').default;
  return combineEpics(...Object.values(epics));
}

const epicMiddleware = createEpicMiddleware();

export default function configureStore () {
  const store = createStore(reducers, applyMiddleware(epicMiddleware));
  return store;
}

epicMiddleware.run(_loadRootEpic());