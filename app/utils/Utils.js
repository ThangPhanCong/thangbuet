import Numeral from '../libs/numeral';
import Consts from './Consts';
import { isNil } from 'lodash';

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, (match, number) => { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    })
  }
}

if (!String.format) {
  String.format = function(source, ...args) {
    return source.replace(/{(\d+)}/g, (match, number) => { 
      return typeof args[number] != 'undefined' ? args[number] : match;
    })
  }
}

export default {
  getPriceKey(currency, coin) {
    return currency + '_' + coin;
  },

  qs: function (key) {
    key = key.replace(/[*+?^$.[]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
    const match = location.href.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
    return (match && decodeURIComponent(match[1].replace(/\+/g, " ")) || null);
  },

  setI18nLocale(locale) {
    window.i18n.locale = locale;
  },

  formatCurrencyAmount(amount, currency, zeroValue) {
    let numberOfDecimalDigits = currency == Consts.CURRENCY_KRW ? 0 : 10;
    let format = numberOfDecimalDigits == 0 ?
      '0,0' :
      '0,0.[' + Array(numberOfDecimalDigits + 1).join('0') + ']';
    if (isNil(zeroValue)) {
      zeroValue = '';
    }
    return amount ? Numeral(amount).format(format) : zeroValue;
  },

  roundCurrencyAmount(amount, currency, zeroValue) {
    let numberOfDecimalDigits = currency == Consts.CURRENCY_KRW ? 0 : 10;
    let format = numberOfDecimalDigits == 0 ?
      '0' :
      '0[.' + Array(numberOfDecimalDigits + 1).join('0') + ']';
    if (isNil(zeroValue)) {
      zeroValue = '';
    }
    return amount ? Numeral(amount).format(format) : zeroValue;
  },

  getPrecision(num) {
    let decimalDigitCount = 0;
    while (num * Math.pow(10, decimalDigitCount) < 1) {
      decimalDigitCount++;
    }
    return decimalDigitCount > 0 ? decimalDigitCount + 1 : decimalDigitCount;
  },

  calculatePriceSettingDigits(priceSetting) {
    priceSetting.digits = this.getPrecision(priceSetting.value);
  },

  getCurrencyName(value) {
    return value ? value.toUpperCase() : value;
  },

  getTimzoneOffset() {
    let d = new Date();
    return d.getTimezoneOffset();
  },

  isWalletAddress(currency, address, destination_tag) {
    switch (currency) {
      case Consts.CURRENCY_KRW:
        //TO DO
        return /^.+$/.test(address);
      case "xrp":
        return /^r[rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz]{27,35}$/.test(address) && Number(destination_tag) < Math.pow(2, 32);
      case "etc":
        return /^[0-9A-HJ-NP-Za-km-z]{26,35}$/.test(address);
      case "eth":
        if (/^(0x)?[0-9a-fA-F]{40}$/.test(address)) {
          return true;
        }
        return false;
      case "btc":
      case "bch":
      case "wbc":
        return /^[123mn][1-9A-HJ-NP-Za-km-z]{26,35}$/.test(address);
      case "dash":
        return /^[0-9A-HJ-NP-Za-km-z]{26,35}$/.test(address);
      case "ltc":
        return /^[1-9A-HJ-NP-Za-km-z]{26,35}$/.test(address);
      default:
        return true;
    }
  },

  getTransactionUrl(currency, transactionId) {
    let erc20Tokens = ['wbc'];
    if (erc20Tokens.indexOf(currency) >= 0) {
      currency = 'erc20';
    }

    return `http://wallet.sotatek.com/${currency}/tx/${transactionId}`;
  }
};
