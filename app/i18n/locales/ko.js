export default {
  exit: {
    title: 'Thoát ứng dụng',
    content: 'Bạn có muốn thoát ứng dụng không?',
    cancel: 'Không',
    ok: 'Thoát'
  },
  common: {
    buy: 'Mua',
    sell: 'Bán',
    fiatSign: '₫',
    message: {
      network_error: "Không thể kết nối"
    }
  },

  login: {
    email: 'Email',
    password: 'Mật khẩu',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    forgotText: 'Quên mật khẩu?',
    questionRegister: "Bạn không có tài khoản?",

    registerForm: {
      referralID: "Mã giới thiệu( không bắt buộc)",
      textAcceptterm: 'Bạn đồng ý',
      term: 'Điều khoản của Vcc',
      questionHaveAccount: 'Bạn đã có tài khoản?',
      registerSuccessMessage: 'Bạn đã đăng ký thành công tài khoản tại Vcc.exchange'
    },

    resetPasswordForm: {
      resetPassword: 'Gửi',
      authenticationCode: 'Mã xác thực',
      resetSuccessMessage: 'Hãy kiểm tra email để lấy lại mật khẩu'
    },

    errorMessage: {
      errorLogin: 'Tài khoản hoặc mật khẩu không đúng',
      errorAuthentication: 'Email chưa đăng ký',
      errorGoogleAuthenFail: 'Mã xác thực không đúng',
      errorValidateEmpty: 'Không được để trống',
      errorEmailValidate: 'Email không đúng định dạng',
      errorUnReadTerm: 'Bạn chưa đọc điều khoản sử dụng',
      errorRegister: 'Đăng ký thất bại',
      errorPasswordInvalid: 'Mật khẩu phải ít nhất 8 ký tự, bao gồm chữ cái viết hoa, viết thường, số.',
      errorReferralCode: 'Mã giới thiệu không tồn tại',
      errorEmailUnverified: 'Email chưa được xác nhận'
    },

    title: {
      register: 'Đăng ký',
      ressetPassword: 'Khôi phục mật khẩu',
      termOfUse: 'Điều khoản sử dụng',
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
    warning: 'Warning',
    bankAccount: 'Please verify your bank account first.',
    accept: 'OK',
    pending: 'You have a pending transasction, please contact administrator!',
    info: 'Information',
    success: 'Successful transaction!',
    error: 'Some errors has occurred',
    confirm: '입금신청확인',
    confirmTitle: '입금신청취소확인',
    amountToDeposit: '입금신청금액',
    confirmContent: '위와같이입금을신청하시겠습니까?',
    actionConfirm: '확인',
    actionCancel: '취소'

  }
}