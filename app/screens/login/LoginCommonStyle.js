import {
  PixelRatio,
  StyleSheet,
  Dimensions
} from 'react-native';
import {
  CommonColors,
  CommonSize,
  CommonStyles
} from '../../utils/CommonStyles';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const LoginCommonStyle = {
  screen: {
    ...CommonStyles.screen,
    alignItems: 'center',
    paddingLeft: CommonSize.contentPadding,
    paddingRight: CommonSize.contentPadding
  },
  scrollView: {
    backgroundColor: CommonColors.screenBgColor,
  },
  logo: {
  },
  inputTitle: {
    color: CommonColors.inputTitleColor,
    fontSize: "15@s",
    alignSelf: 'flex-start',
    marginBottom: '6@s',
    marginTop: "15@s"
  },
  title: {
    color: 'white',
    marginTop: "15@s",
    fontSize: "30@s",
    fontWeight: '400',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: "0@s",
  },
  label: {
    color: 'white'
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderColor: '#fdd835',
    borderWidth: "1@s",
  },
  input: {
    height: "42@s",
    flex: 1,
    textAlign: 'left',
    color: 'white',
    fontSize: "15@s",
    paddingLeft: "10@s",
    backgroundColor: CommonColors.textInputBgColor,
    borderWidth: '1@s',
    borderColor: '#1c202c'
  },
  seperator: {
    alignSelf: 'stretch',
    marginTop: "2@s",
    marginBottom: "7@s",
  },
  txtInputFocused: {
    borderColor: '#1c202c',
  },
  txtInputUnFocused: {
    borderColor: '#1c202c',
  },
  buttons: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: "15@s"
  },
  button: {
    flex: 1,
    height: "45@s",
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: "16@s",
    fontWeight: 'bold',
    textAlign: 'center'
  },
  loginButton: {
    backgroundColor: CommonColors.btnSubmitBgColor,
    borderWidth: "1@s",
  },
  textPress: {
    color: '#0090eb',
    fontSize: "15@s",
  },
  text: {
    fontSize: "15@s",
    color: 'white',
    marginRight: "6@s",
  },
  textError: {
    color: 'red',
    fontSize: "12@s",
  },
  textInputError: {
    borderColor: 'red'
  },
  boxError: {
    borderRadius: "1@s",
    paddingVertical: "10@s",
    paddingHorizontal: "7@s",
    width: width * 0.5,
    backgroundColor: 'white',
    alignItems: 'center',
    position: 'absolute',
    top: height * 0.75,
  },
  rowFlexOne: {
    flex: 1,
  },
  rowFlexTwo: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowFlexSix: {
    flex: 6
  },
}

export default LoginCommonStyle