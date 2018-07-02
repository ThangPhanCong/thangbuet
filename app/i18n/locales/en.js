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
  orderForm: {
    buy: '매수',
    sell: '매도',
    pendingOrder: '미체결',
    limit: '지정가',
    market: '시장가',
    stopLimit: 'STOP 지정가',
    stopMarket: 'STOP 시장가',
    order: '주문',
    type: '주문종류',
    price: '주문가격',
    stop: '기준가격',
    quantity: '주문수량',
    total: '매수대금',
    balance: '주문가능금액',
    estimateTotal: '매수대금',
    fee: '수수료',
    estimateQuantity: '총매수량'
  },
  orderBook: {
    sell: '매도',
    buy: '매수',
    balance: '잔량',
    price: '가격',
    quantity: '수량',
    hand: '손절',
    fence: '익절'
  },
  orderBookSettings: {
    title: '주문창 설정',
    showEmptyRow: '빈 호가 표시',
    clickToOrder: '원클릭 주문',
    confirmOrder: '주문 확인',
    priceGroup: '호가 단위',
    notification: '알림 설정(공통)',
    notificationContent: '알림 내용(공통)',
    notificationCreated: '주문',
    notificationMatched: '체결',
    notificationCanceled: '취소',
    update: '확인'
  },
  fullScreenChart: {
    change24h: '24h Change',
    hour: 'Hour',
    min: 'min'
  },

  funds: {
    assetStatus: '자산현황',
    totalNumberOfCoin: '코인총매수',
    currency: 'KRW',
    coinValuation: '코인평가액',
    ratingYeild: '평가수익률',
    division: '구분',
    quantity: '보유수량',
    profitAndLoss: '손익',
    valuation: '평가',
    total: 'TOTAL'
  }
};