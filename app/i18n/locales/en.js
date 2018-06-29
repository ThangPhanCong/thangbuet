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
    },
    iPhone: 'iPhone',
    android: 'Android',
    appStore: 'Apple App Store',
    playStore: 'Google Play Store'
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
  marketList: {
    symbol: '코인',
    price: '현재가',
    change: '전일대비',
    volume: '거래대금',
    unit: '백만',
    favorite: '즐겨찾기'
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
  },
  myPage: {
    tab: {
      basic: '내 정보',
      security: '보안설정',
      connection: '접속관리',
      wallet: '출금주소록'
    },
    basic: {
      securityLevel: '인증 레벨',
      feeLevel: '수수료 등급',
      id: '아이디',
      phone: '휴대전화'
    },
    security: {
      verified: '인증 완료',
      unverified: '인증하기',
      cancelOTP: '사용 중단하기',
      notAllowed: '미인증',
      otpGuide: `안전한 거래를 위해 구글 OTP 인증을 사용하세요.\nAPP을 다운로드&설치하고 'NEXT'를 누르세요`,
      recoveryGuide: `구글 OTP인증이 완료되었습니다. \n이 화면을 벗어나면 복구 코드는 다시 볼 수 없습니다.\n반드시 아래 복구코드를 다른 곳에 잘 보관하세요.`,
      verificationGuide: `1. '추가' 를 선택하고 'SECRET KEY'를 입력하세요\n2. APP에 표시된 6자리의 OTP CODE를 입력하고 'ACTIVATE'를 클릭하세요`,
      next: 'next',
      recoveryCode: 'recovery code',
      secretKey: 'secret key',
      viewSecretKey: 'view secret key',
      copy: 'copy',
      otpCode: 'otp code',
      activate: 'activate'
    }
  }
};