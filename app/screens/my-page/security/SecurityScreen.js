import {
  Easing,
  Animated
} from 'react-native'
import { StackNavigator } from 'react-navigation';
import SecurityOverviewScreen from './SecurityOverviewScreen';
import OTPGuideScreen from './OTPGuideScreen';
import OTPVerifyScreen from './OTPVerifyScreen';
import OTPSecretCodeScreen from './OTPSecretCodeScreen';

export default StackNavigator({
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
}, {
  headerMode: 'none',
  transitionConfig: opacityTransition
})

const opacityTransition = {
  transitionSpec: {
    duration: 750,
    easing: Easing.out(Easing.poly(4)),
    timing: Animated.timing,
    useNativeDriver: true,
  },
  screenInterpolator: sceneProps => {      
    const { position, scene } = sceneProps

    const thisSceneIndex = scene.index
    
    const opacity = position.interpolate({
      inputRange: [thisSceneIndex - 1, thisSceneIndex],
      outputRange: [0, 1],
    })
    
    return { opacity };
  }
} 