import I18n from 'react-native-i18n'
import en from './locales/en'
import ko from './locales/ko'
import zh from './locales/zh'
import fs from 'react-native-fs'

I18n.defaultLocale = 'ko';
I18n.locale = 'ko';
I18n.fallbacks = true;
I18n.translations = {
  ko,
  en,
  zh
}
I18n.missingTranslation = (scope, options) => null;

reloadTranslations();

export default I18n;

export async function reloadTranslations() {
  try {
    let path = fs.DocumentDirectoryPath + '/currency.json';
    let currencyFileExits = await fs.exists(path);

    if (!currencyFileExits) {
      return;
    }

    let data = await fs.readFile(path);
    let tCurrency = JSON.parse(data);
    
    I18n.translations = {
      ko: Object.assign({}, ko, {currency: tCurrency.ko}),
      en: Object.assign({}, en, {currency: tCurrency.en}),
      zh: Object.assign({}, zh, {currency: tCurrency.zh})
    }
  }
  catch(err) {}
}