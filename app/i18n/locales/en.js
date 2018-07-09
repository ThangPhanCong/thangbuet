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
    fiatSymbol: '₩',
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
  tradeScreen: {
    balance: '보유 잔고',
    profit: '수익률'
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

  tabBar: {
    trading: '트레이딩',
    funds: '자산현황',
    balance: '입출금',
    transaction: '거래내역',
    myPage: 'MY PAGE'

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

  balances: {
    coin: '코인',
    quantity: '보유수량',
    action: '입출금',
    deposit: '입금',
    withdrawal: '출금',
    totalAssets: '총자산평가액',
    depositAndWithdrawal: '입출금',
    currency: 'KRW',
  },

  deposit: {
    title: '입금',
    account: '계좌잔액',
    amount: '입금신청금액',
    currency: 'w',
    apply: '입금신청',
    note: '입금시주의사항',
    check: '을확인했습니다.',
    noteTitle: '입금시주의사항',
    note1Key: '입금신청금액과같은액수',
    note1Title: '의금액을입금하세요.',
    note1Content: '-입금신청금액과실제입금액이다르면입금처리되지않습니다.',
    note2Key: "'입금코드'",
    note2Title: '를반드시입력하세요.',
    note2Content: '등록되지않은계좌를사용한경우거래가제한될수있습니다',
    note3Key: '반드시미리등록한본인명의의계좌를',
    note3Title: '사용하세요.',
    note3Content: '-등록되지않은계좌를사용한경우거래가제한될수있습니다.',
    note4Key: '',
    note4Title: '입금은최대10분이내에처리됩니다.',
    note4Content: '-정상적인경우입금처리에는평균약3분~5분정도의시간이소요되며입금처리가완료되면문자로알려드립니다.',
    note5Key: '',
    note5Title: '입금 지연시 고객센터로 연락하세요.',
    note5Content: '-콜센터 : 1588-1666 / 입금코드, 입금액이다를경우입금증명이필요합니다.',
    note5Link: '[입금 사실 증명] .',
    noteMore: '은행 시스템 점검 시간 중에는 출금이 제한됩니다.',
    noteTimeMore: '은행 점검 시간 : 매일 23:00 ~ 01:00 / 토요일 23:00 ~ 일요일 05:00',
    warning: '경고',
    bankAccount: '먼저 은행 계좌를 확인하십시오.',
    accept: '승인',
    pending: '대기중인 거래가 있으니 관리자에게 문의하십시오!',
    info: '정보',
    error: '몇 가지 오류가 발생했습니다.',
    confirm: '입금신청확인',
    confirmTitle: '입금신청취소확인',
    amountToDeposit: '입금신청금액',
    confirmContent: '위와같이입금을신청하시겠습니까?',
    actionConfirm: '확인',
    actionCancel: '취소',
    successMessage: '입금 신청이 접수되었습니다. 신청이 처리될 때까지 잠시 기다려주세요.',

    pendingAccount: '계좌잔액',
    pendingAmount: '입금신청금액',
    pendingBankName: '입금할은행',
    pendingAccountNote: '계좌주',
    pendingDepositCode: '입금코드',
    pendingCheck: '을 확인 했습니다',
    pendingNote: '입금시 주의 사항',
    pendingCancel: '입금 신청 취소',
    pendingBankAccount: '입금할 계좌',
    pendingConfirmContent: '입금 신청을 취소하시겠습니까?',
    pendingInfo: '이전 입금 신청이 처리 되지 않았습니다. 입금처리가 끝날 때까지 기다리시거나 입금 신청 취소 후 다시 신청하시기 바랍니다.'

  },

  withdrawal: {
    balance: '계좌 잔액',
    available: '출금 가능액',
    request: '출금 신청 금액',
    maximum: '최대',
    accountRegister: '등록된 입출금 계좌',
    confirm: '출금 신청',
    noteTitle: '출금시 주의 사항',
    noteLine1: 'KRW 출금은 신청 후 약 10분 이내로 반영됩니다.',
    noteLine2: '출금은 기존에 등록된 고객 명의의 계좌로만 가능합니다.',
    noteLine3: ' 은행 시스템 점검 시간 동안에는 KRW 입출금이 불가능합니다.',
    noteLine4: '은행 점검 시간 : 평일 23:00 ~ 01:00 / 토요일 23:00 ~ 일요일 05:00',
    noteLine5: '은행 점검 시간은 은행의 사정에 따라 지연 될 수 있습니다.',
    noteLine6: '부정거래가 의심될 경우 출금이 제한될 수 있습니다.',
    noteLine7: '1회 출금 한도 : 10,000,000 KRW',
    noteLine8: '1일 출금 한도 : 50,000,000 KRW',
    noteLine9: ' 출금 수수료 : 1,000 KRW',
    noteLine10: '보이스피싱, 파밍, 자금 세탁 등의 금융 사고 예방을 위해 이엑스코인에서는 암호화폐의 출금에 일부 제한 정책을 실시하고 있습니다.',
    noteLine11: '제한 사항은 첫 KRW 입금 후 암호화폐를 구입해서 다른 외부의 지갑으로 송금할 경우에만 해당됩니다. 이 경우 72시간 동안 출금이 제한 됩니다. KRW입금 없이 암호화폐만 입금했을 경우는 제한 없이 바로 출금할 수 있습니다.',
    tbTitleDepost: '입금',
    tbTitleTrades: '매매',
    tbtitleWithdrawal: '출금/송금',
    tbTitleLimit: '제한',

    row1Col1: 'KRW',
    row1Col2: '코인 매매',
    row1Col3: 'KRW 출금',
    row1Col4: '제한없음',

    row2Col1: '코인',
    row2Col2: '코인 매도',
    row2Col3: 'KRW 출금',
    row2Col4: '제한없음',

    row3Col1: '코인',
    row3Col2: '코인 매도',
    row3Col3: 'KRW 출금',
    row3Col4: '제한없음',

    row4Col1: 'KRW',
    row4Col2: '코인 매수',
    row4Col3: '코인 첫 출금',
    row4Col4: '72시간',

    amountConfirmTitle: '출금(송금) 신청 확인',
    amountNumber: '출금(송금) 신청 금액',
    amountAccount: '출금(송금)할 계좌',
    amountMessage: '출금(송금) 신청이 접수 되었습니다.',
    amountCancel: '취소',
    amountAccept: '확인',

    smsConfirmTitle: 'SMS 인증번호 확인',
    smsContent: '인증 번호를 입력하세요',
    smsRequestCode: '인증번호 요청',
    smsAction: '확인',

    optConfirmTitle: 'OTP CODE 확인',
    optContent: 'OTP CODE를 입력하세요',
    optErrMsg: 'OTP 번호가 잘못되었습니다. 다시 로그인 해주십시오.',
    optSuccessMsg: '거래 완료',

    errMinium: '출금 금액이 너무 적습니다.',
    errMaximum: '출금 금액이 너무 큽니다.',
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
      remove: '삭제',
      
      addNewWalletHeader: '출금 주소 등록',
      coinType: '코인 종류',
      walletAddress: '지갑 주소',
      destination: '데스티네이션',
      walletName: '지갑 이름(별칭)',
      addNewWalletSubmit: '입출금 계좌 등록',
      removeConfirmDesc: `'{0}' 을 삭제하시겠습니까`,
      removeConfirm: '확인'
    }
  },
  transactions: {
    title: '주문/체결 내역',
    orderHistoryTab: '체결내역',
    openOrderTab: '미체결내역',
    fundsHistoryTab: '입출금내역',
    profitLostTab: '기간별손익',
    search: '조회',
    time: '시간',
    pair: '종목',
    amount: '수량',
    orderPrice: '가격',
    excutedPrice: '거래 대금',
    fee: '수수료',
    cancel: '취소',
    success: '완료',
    pending: '진행중',
    funds: {
      amount: '수량/금액',
      account: 'TXID/계좌',
      status: '상태'
    },
    profit: {
      type: '구분',
      excess: '기초 보유 잔고',
      totalDeposit: '입금 합계',
      totalWithDrawl: '출금 합계',
      endingBalance: '기말 보유 잔고',
      inscreaseAssets: '자산 증감',
      rateChange: '증감률',
    }
  }
};