import { SwitchNavigator } from 'react-navigation';
import SecurityOverviewScreen from './SecurityOverviewScreen';
import OTPGuideScreen from './OTPGuideScreen';
import OTPVerifyScreen from './OTPVerifyScreen';
import OTPSecretCodeScreen from './OTPSecretCodeScreen';

export default SwitchNavigator({
  SecurityOverviewScreen: {
    screen: SecurityOverviewScreen  
  },
  OTPGuideScreen: {
    screen: OTPGuideScreen  
  },
  OTPVerifyScreen: {
    screen: OTPVerifyScreen  
  },
  OTPSecretCodeScreen: {
    screen: OTPSecretCodeScreen  
  }
})