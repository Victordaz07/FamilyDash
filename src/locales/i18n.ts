import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./en/translation.json";
import es from "./es/translation.json";

// Detect system language
const getSystemLanguage = () => {
  const locale = Localization.locale;
  if (locale.startsWith("es")) return "es";
  if (locale.startsWith("en")) return "en";
  return "en"; // Default fallback
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v3",
    lng: getSystemLanguage(),
    fallbackLng: "en",
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    interpolation: { 
      escapeValue: false 
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n;
