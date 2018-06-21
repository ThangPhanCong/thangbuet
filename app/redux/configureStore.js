import { createStore, applyMiddleware } from 'redux';
import reducers from './reducer';

import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { createLogger } from 'redux-logger';

const _loadRootEpic = () => {
  const epics = require('./middleware/marketEpic').default;
  const socketEpic = require('./middleware/socketEpic').default;
  return combineEpics(...Object.values(epics), socketEpic);
}

const epicMiddleware = createEpicMiddleware();
const logger = createLogger();

export default function configureStore () {
  const store = createStore(reducers, applyMiddleware(epicMiddleware, logger));
  epicMiddleware.run(_loadRootEpic());
  return store;
}