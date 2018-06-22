export default {
  exit: {
    title: 'Exit App',
    content: 'Exiting the application?',
    cancel: 'Cancel',
    ok: 'OK'
  },
  common: {
    buy: 'Buy',
    sell: 'Sell',
    fiatSign: '₫',
    message: {
      network_error: "Can't conect network"
    }
  },
  login: {
    email: 'Email',
    password: 'Password',
    login: 'Login',
    register: 'Register',
    forgotText: 'Forgot your password',
    questionRegister: "Don't have an account yet? ",
    registerForm: {
      referralID: 'Referral ID (optional)',
      textAcceptterm: "I agree to VCC's",
      term: 'terms of use',
      questionHaveAccount: 'Already Registered?',
      registerSuccessMessage: 'Successfully registered account at Vcc.exchange'
    },
    resetPasswordForm: {
      resetPassword: 'Submit',
      authenticationCode: 'Google authenticator code',
      resetSuccessMessage: 'Please check email to reset your password'
    },
    errorMessage: {
      errorLogin: 'Account or password incorrect      ',
      errorAuthentication: 'These credentials do not match our records',
      errorValidateEmpty: 'Not empty',
      errorEmailValidate: 'Enter email format error',
      errorGoogleAuthenFail: '2FA verification code error',
      errorRegister: 'Register failed',
      errorUnReadTerm: 'Please accept term',
      errorPasswordInvalid: 'Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ cái viết hoa, viết thường, số.',
      errorReferralCode: 'Referral Code  not exist',
      errorEmailUnverified: 'Email Unverified!'
    },
    title: {
      register: 'Register',
      ressetPassword: 'Reset Password',
      termOfUse: 'Terms Of Use',
      googleAuthentication: '2FA'
    }
  },
  marketDetail: {
    time: '시간',
    price: '체결가',
    amount: '거래량',
    low: 'Low',
    high: 'High',
    bid: 'Bid',
    ask: 'Ask',
    orderBook: 'Order Book',
    marketTrades: 'Market Trades',
    _minute: '{{minutes}}min',
    _hour: '{{hours}}h',
    _day: '{{days}}d',
    _week: '{{weeks}}w',
    depth: 'Depth',
    full: 'Full'
  },
  fullScreenChart: {
    change24h: '24h Change',
    hour: 'Hour',
    min: 'min'
  },
};