import { createStore, applyMiddleware } from 'redux';
import FileUtils from '../utils/FileUtils';
import app from './reducer';
import path from 'path';
import _ from 'lodash';

import { combineEpics } from 'redux-observable';

function loadEpics() {
  const rootDir = path.join(path.resolve('.'));
  let epicDirs = [];
  let appEpicDir = path.resolve(rootDir, 'middleware');
  if (FileUtils.isDirectorySync(appEpicDir)) {
    epicDirs.push(appEpicDir);
  }

  return _.map(epicDirs, (dir) => {
    return require(dir);
  });
}

const epicMiddleware = combineEpics(loadEpics());

export default function configureStore () {
  const store = createStore(app, applyMiddleware(epicMiddleware));
  return store;
}