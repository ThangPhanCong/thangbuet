import I18n from 'react-native-i18n'
import en from './locales/en'
import ko from './locales/ko'
import zh from './locales/zh'

I18n.defaultLocale = 'ko';
I18n.locale = 'ko';
I18n.fallbacks = true;
I18n.missingTranslation = (scope, options) => null;

reloadTranslations();

export default I18n;

export function reloadTranslations() {
  let koCurrency = require('./locales/currency/ko.json');
  let enCurrency = require('./locales/currency/en.json');
  let zhCurrency = require('./locales/currency/zh.json');

  I18n.translations = {
    ko: Object.assign({}, ko, {currency: koCurrency}),
    en: Object.assign({}, en, {currency: enCurrency}),
    zh: Object.assign({}, zh, {currency: zhCurrency})
  }
}