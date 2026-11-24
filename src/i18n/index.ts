import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR/translation.json';
import es from './locales/es/translation.json';
import en from './locales/en/translation.json';
import { readStorage } from '../utils/storage';
import { LanguageCode } from '../types/christmas';

const savedLang = readStorage<LanguageCode>('language', 'pt-BR');

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    es: { translation: es },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'pt-BR',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
