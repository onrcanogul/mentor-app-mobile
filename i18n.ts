import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import tr from "./locales/tr.json";
import es from "./locales/es.json";

const LANGUAGE_PREFERENCE_KEY = "user-language";

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
      if (savedLang) {
        callback(savedLang);
      } else {
        const deviceLang = Localization.locale.startsWith("tr")
          ? "tr"
          : Localization.locale.startsWith("es")
          ? "es"
          : "en";
        callback(deviceLang);
      }
    } catch (e) {
      console.log("Language detection error:", e);
      callback("en");
    }
  },
  init: () => {},
  cacheUserLanguage: async (lang: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, lang);
    } catch (e) {
      console.log("Language save error:", e);
    }
  },
};

i18n
  .use(languageDetector as any) // <== kullanıcının dil tercihine göre başlat
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    resources: {
      en: { translation: en },
      tr: { translation: tr },
      es: { translation: es },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
