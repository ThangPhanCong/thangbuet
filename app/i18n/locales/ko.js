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
  currency: {
    symbol: '₩'
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

  }
}