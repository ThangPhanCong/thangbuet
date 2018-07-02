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
      activate: 'activate',

      cancelOtpHeader: 'OTP 사용 중단하',
      cancelOtpDesc: `OTP 인증번호/복구 코드를 사용하여 OTP사용을 중단합니다. 복구 코드로 사용을 중단할 경우 자동으로 암호화폐 자산의 출금이 제한됩니다.`,
      otpVerificationNumber: 'OTP 인증 번호',
      dialogRecoveryCode: '복구 코드',
      cancelOtpSubmit: 'OTP사용 중단하기',
      initOtpVerification: 'OTP 인증 초기화',
      initOtpVerificationDesc: `복구 코드를 분실해서 OTP사용을 중단할 수 없을 경우 아래 내용과 같이 OTP 초기화 요청 이메일을 보내주시기 바랍니다.\n보낼 이메일 : help@bitkoex.com`,
      initOtpVerificationInstruction:
      `1. 이메일 제목: otp 사용 중단 요청
      2. 이메일 본문
      -실명
      -휴대전화 번호
      -빗코엑스 가입시 이메일
      3. 첨부파일
      “신분증+메모”사진
      “신분증+메모”를 들고 있는 본인 사진
      ★ 신분증은 반드시 주민번호 뒷자리는 가려주세요
      ★ 메모 입력 사항:otp 사용 중단 요청, 빗코엑스 가입한 이메일, 요청 날짜
      ★ 피싱 등 금융사고 예방을 위한 것으로 조금 불편하시더라도 양해 부탁드립니다`,
      existedPhoneHeader: '이미 등록된 전화번호입니다.',
      existedPhoneButtonText: '확인',
      bankAccountHeader: '입출금 계좌 등록',
      bankAccountOwner: '예금주',
      dateOfBirth: '생년월일(6자리)',
      bank: '은행',
      bankAccountNumber: '계좌번호',
      bankAccountSubmitText: '계좌번호 인증하기',
      changePasswordHeader: '비밀번호 변경',
      currentPassword: '현재 비밀번호',
      newPassword: '새 비밀번호',
      repeatPassword: '새 비밀번호 확인',
      changePasswordSubmit: '비밀번호 변경'
    },
    connection: {
      dateTime: '일시',
      device: '기기',
      operatingSystem: '운영체제',
      ipAddress: 'IP 주소'
    },
    wallet: {
      coin: '코인',
      walletName: '지갑 이름',
      withdraw: '출금',
      remove: '삭제'
    }
  }
};