import Numeral from '../libs/numeral';
import Consts from './Consts';
import { isNil } from 'lodash';
import moment from "moment";

function formatCurrency(amount, currency, zeroValue) {
  let numberOfDecimalDigits = currency == Consts.CURRENCY_KRW ? 0 : 10;
  let format = numberOfDecimalDigits == 0 ?
    '0,0' :
    '0,0.[' + Array(numberOfDecimalDigits + 1).join('0') + ']';
  if (isNil(zeroValue)) {
    zeroValue = '';
  }
  return amount ? Numeral(amount).format(format) : zeroValue;
}

function trimCurrency(value) {
  if (value) {
    value = value.toString();
  }
  if (value && value.indexOf('.') >= 0) {
    return value.replace(/\.[0]+$/g, '');
  } else {
    return value;
  }
}

function formatPercent(value, onlyFormat) {
  if (onlyFormat) {
    return Numeral(value).format("0.00")
  } else {
    return Numeral(value).format("0.00") + "%";
  }
};

function formatPercentSpace(value, onlyFormat) {
  if (onlyFormat) {
    return Numeral(value).format("0.00")
  } else {
    return Numeral(value).format("0.00") + " %";
  }
};

function getCurrencyName(value) {
  if (value == 'wbc') {
    return 'WWW';
  }
  return value ? value.toUpperCase() : value;
}

function getDateTime(timestamp) {
  return moment(timestamp, 'x').format('DD.MM.YYYY HH:mm:ss');
};

function getDayMonth(timestamp) {
  return moment(timestamp, 'x').format('MM.DD');
};

function getTime(timestamp) {
  return moment(timestamp, 'x').format('HH:mm:ss');
};

export {
  formatCurrency,
  trimCurrency,
  formatPercent,
  getCurrencyName,
  getDateTime,
  getDayMonth,
  getTime,
  formatPercentSpace
};