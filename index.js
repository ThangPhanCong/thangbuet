import React from 'react'
import {
  AppRegistry
} from 'react-native'

import { Provider } from 'react-redux';
import configureStore from './app/redux/configureStore';
import App from './app';

const store = configureStore();

const ReduxApp = () => (
  <Provider store = { store }>
    <App/>
  </Provider>
)

AppRegistry.registerComponent('Bitkoex', () => ReduxApp);
