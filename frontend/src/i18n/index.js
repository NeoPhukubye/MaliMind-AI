import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import af from './locales/af.json'
import zu from './locales/zu.json'
import xh from './locales/xh.json'
import st from './locales/st.json'
import tn from './locales/tn.json'
import nso from './locales/nso.json'
import ts from './locales/ts.json'
import ve from './locales/ve.json'
import nr from './locales/nr.json'
import ss from './locales/ss.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      af: { translation: af },
      zu: { translation: zu },
      xh: { translation: xh },
      st: { translation: st },
      tn: { translation: tn },
      nso: { translation: nso },
      ts: { translation: ts },
      ve: { translation: ve },
      nr: { translation: nr },
      ss: { translation: ss },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa' },
  { code: 'st', name: 'Sesotho' },
  { code: 'tn', name: 'Setswana' },
  { code: 'nso', name: 'Sepedi' },
  { code: 'ts', name: 'Xitsonga' },
  { code: 've', name: 'Tshivenḓa' },
  { code: 'nr', name: 'isiNdebele' },
  { code: 'ss', name: 'siSwati' },
]

export default i18n
