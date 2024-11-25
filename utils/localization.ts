import i18n, { ModuleType } from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import English from "@/locales/english.json";
import Spanish from "@/locales/spanish.json";

const translations = {
  en: English,
  es: Spanish,
};

const languageDetector = {
  type: "languageDetector" as ModuleType,
  async: true,
  detect: async (callback: any) => {
    let phoneLanguage = getLocales()[0]?.languageCode;
    return callback(phoneLanguage ?? "en");
  },
  init: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: translations,
    fallbackLng: "en",
    debug: true,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
