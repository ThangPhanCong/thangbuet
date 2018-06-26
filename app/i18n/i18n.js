import I18n from 'react-native-i18n'
import en from './locales/en'
import ko from './locales/ko'
import zh from './locales/zh'

I18n.defaultLocale = 'ko';
I18n.locale = 'ko';
I18n.fallbacks = true;

I18n.translations = {
  ko,
  en,
  zh
};
export default I18n;