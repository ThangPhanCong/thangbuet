import { StackNavigator, NavigationActions, StackActions } from 'react-navigation';
import { YellowBox, ToastAndroid, Platform } from 'react-native';
import MicroEvent from 'microevent';

import AppConfig from './app/utils/AppConfig';
import AppPreferences from './app/utils/AppPreferences';
import BaseScreen from './app/screens/BaseScreen';
import GlobalSocket from './app/GlobalSocket';
import EventBus from './app/EventBus';
import MasterdataUtils from './app/utils/MasterdataUtils';
import Screens from './app/screens/Screens';
import { isEmpty } from 'lodash';
import I18n from './app/i18n/i18n';
import { Sentry } from 'react-native-sentry';

Sentry.config('https://7ab3c51453f748a28ccc242514285072@sentry.io/1259180').install();

const socketWarning = 'Setting a timer for a long period of time, i.e. multiple minutes, '
  + 'is a performance and correctness issue on Android as it keeps the timer module awake, '
  + 'and timers can only be called when the app is in the foreground. '
  + 'See https://github.com/facebook/react-native/issues/12981 for more info.\n'
  + '(Saw setTimeout with duration 85000ms)';
YellowBox.ignoreWarnings([
  'Warning: isMounted',
  'Module RCTImageLoader',
  'Class RCTC',
  'Remote debugger',
  socketWarning // socker.io pingInterval + pingTimeout
]);

MicroEvent.mixin(GlobalSocket);
MicroEvent.mixin(EventBus);

async function initApp() {
  MicroEvent.mixin(BaseScreen);
  await initI18n();
  window.EventBus = new EventBus();
  return await initMasterdata();
}

async function initI18n() {
  await AppPreferences.init();
  let locale = await AppPreferences.getLocale();
  ;
  if (!locale) {
    locale = 'ko';
    AppPreferences.saveLocale(locale);
  }
  I18n.init();
  I18n.locale = locale;
}

async function initMasterdata() {
  const credentials = await AppPreferences.getAccessToken();

  AppConfig.ACCESS_TOKEN = credentials.password;
  window.GlobalSocket = new GlobalSocket();

  if (__DEV__) {
    console.log('API Server: ' + AppConfig.getApiServer());
    console.log('ACCESS_TOKEN: ' + AppConfig.ACCESS_TOKEN);
  }

  return await MasterdataUtils.loadData();
}

const App = StackNavigator(Screens, { headerMode: 'screen' })

let defaultGetStateForAction;
let _lastTimeBackPress = 0;

function handleBackAction(callback) {
  _lastTimeBackPress = 0;

  if (!defaultGetStateForAction) {
    defaultGetStateForAction = App.router.getStateForAction;
  }

  const mainScreen = ['LoginScreen', 'MainScreen', 'PreviewScreen'];

  if (Platform.OS === 'android') {
    App.router.getStateForAction = (action, state) => {
      if (
        action.type === NavigationActions.BACK &&
        state.routes && !isEmpty(state.routes) &&
        mainScreen.indexOf(state.routes[state.index].routeName) >= 0
      ) {
        if (state.routes[state.index].routeName === "LoginScreen") {
          if (callback()) {
            return defaultGetStateForAction({
              type: 'Navigation/COMPLETE_TRANSITION',
              key: 'StackRouterRoot'
            }, {
              ...state,
              isTransitioning: true
            });
          }

          const resetAction = NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
              NavigationActions.navigate({ routeName: 'PreviewScreen' }),
            ]
          });

          return defaultGetStateForAction(resetAction, state);
        }

        let now = new Date().getTime();
        if (_lastTimeBackPress > 0 && now - _lastTimeBackPress <= 500) {
          return null;
        }

        if (_lastTimeBackPress == 0)
          _lastTimeBackPress = now;
        else
          _lastTimeBackPress = 0;

        ToastAndroid.showWithGravity(
          I18n.t('exit.content'),
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );

        return defaultGetStateForAction({
          type: 'Navigation/COMPLETE_TRANSITION',
          key: 'StackRouterRoot'
        }, {
          ...state,
          isTransitioning: true
        });
      }

      return defaultGetStateForAction(action, state);
    };
  }
}

export default App;
export { initApp, handleBackAction };
