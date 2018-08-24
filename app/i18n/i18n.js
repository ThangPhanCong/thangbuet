import I18n from 'react-native-i18n';
let en = require('./locales/en.json');
let ko = require('./locales/ko.json');
let zh = require('./locales/zh.json');
import fs from 'react-native-fs'

I18n.defaultLocale = 'ko';
I18n.locale = 'ko';
I18n.fallbacks = true;
I18n.translations = {
  ko,
  en,
  zh
}

I18n.missingTranslation = (scope, options) => '';

I18n.init = async () => {
  await reloadTranslations();
}

export default I18n;

export async function reloadTranslations() {
  try {
    for (let locale in I18n.translations) {
      await reloadTranslation(locale);
    }
  }
  catch(err) {}
}

async function reloadTranslation(locale) {
    let path = `${fs.DocumentDirectoryPath}/${locale}.json`;
    let fileExits = await fs.exists(path);

    if (!fileExits) {
      return;
    }

    let data = await fs.readFile(path);
    try {
      I18n.translations[locale] = JSON.parse(data);
    } catch (e) {
      console.log('I18n.reloadTranslation: load data error', e);
    }
}