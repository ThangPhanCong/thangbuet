import { StackNavigator } from 'react-navigation';
import { YellowBox } from 'react-native';
import MicroEvent from 'microevent';

import AppConfig from './app/utils/AppConfig';
import AppPreferences from './app/utils/AppPreferences';
import BaseScreen from './app/screens/BaseScreen';
import GlobalSocket from './app/GlobalSocket';
import MasterdataUtils from './app/utils/MasterdataUtils';
import Screens from './app/screens/Screens';

import I18n from './app/i18n/i18n';

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

function initApp() {
  MicroEvent.mixin(BaseScreen);

  AppPreferences.init();
  AppPreferences.getLocale().then((locale) => {
    if (!locale) {
      locale = 'vi';
      AppPreferences.saveLocale(locale);
    }
    I18n.locale = locale;
  });

  return AppPreferences.getAccessToken()
    .then(credentials => {
      AppConfig.ACCESS_TOKEN = credentials.password;
      window.GlobalSocket = new GlobalSocket();

      if (__DEV__) {
        console.log('API Server: ' + AppConfig.getApiServer());
        console.log('ACCESS_TOKEN: ' + AppConfig.ACCESS_TOKEN);
      }
    })
    .then(() => {
      return MasterdataUtils.loadData();
    });
}
export default App = StackNavigator(Screens, { headerMode: 'screen' });
export { initApp };
