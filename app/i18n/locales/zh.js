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
  },
  transactions: {
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
  }
}