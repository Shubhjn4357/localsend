import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations - require is used for JSON to avoid TypeScript issues
const en = require('./locales/en.json');
const es = require('./locales/es.json');
const fr = require('./locales/fr.json');
const de = require('./locales/de.json');
const pt = require('./locales/pt.json');
const zh = require('./locales/zh.json');
const ja = require('./locales/ja.json');
const hi = require('./locales/hi.json');

const resources = {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    pt: { translation: pt },
    zh: { translation: zh },
    ja: { translation: ja },
    hi: { translation: hi },
};

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
