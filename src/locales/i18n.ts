import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './en/translation.json';
import es from './es/translation.json';

export type Language = 'en' | 'es';

export interface Translations {
  [key: string]: string | Translations;
}

class I18nManager {
  private currentLanguage: Language = 'en';
  private translations: Record<Language, Translations> = {
    en,
    es,
  };
  private initialized: boolean = false;

  constructor() {
    // Initialize synchronously with English as default
    this.currentLanguage = 'en';
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
        this.currentLanguage = savedLanguage as Language;
      } else {
        // Detect system language - prioritize English
        const locale = Localization.locale || 'en';
        console.log('Detected locale:', locale);

        // More comprehensive Spanish detection
        if (locale.startsWith('es') ||
          locale.includes('Spanish') ||
          locale.includes('Español') ||
          locale === 'es' ||
          locale === 'es-ES' ||
          locale === 'es-MX' ||
          locale === 'es-AR' ||
          locale === 'es-CO' ||
          locale === 'es-PE' ||
          locale === 'es-VE' ||
          locale === 'es-CL' ||
          locale === 'es-UY' ||
          locale === 'es-PY' ||
          locale === 'es-BO' ||
          locale === 'es-EC' ||
          locale === 'es-GT' ||
          locale === 'es-CU' ||
          locale === 'es-HN' ||
          locale === 'es-NI' ||
          locale === 'es-SV' ||
          locale === 'es-CR' ||
          locale === 'es-PA' ||
          locale === 'es-DO' ||
          locale === 'es-PR') {
          this.currentLanguage = 'es';
        } else {
          this.currentLanguage = 'en';
        }

        await this.saveLanguage(this.currentLanguage);
      }
      this.initialized = true;
      console.log('Language initialized to:', this.currentLanguage);
    } catch (error) {
      console.log('Error initializing language:', error);
      this.currentLanguage = 'en'; // Default to English
      this.initialized = true;
    }
  }

  private async saveLanguage(language: Language) {
    try {
      await AsyncStorage.setItem('app_language', language);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  }

  public async forceSpanish(): Promise<void> {
    this.currentLanguage = 'es';
    await this.saveLanguage('es');
    console.log('Language forced to Spanish');
  }

  public async forceEnglish(): Promise<void> {
    this.currentLanguage = 'en';
    await this.saveLanguage('en');
    console.log('Language forced to English');
  }

  public async clearLanguagePreference(): Promise<void> {
    try {
      await AsyncStorage.removeItem('app_language');
      console.log('Language preference cleared');
    } catch (error) {
      console.log('Error clearing language preference:', error);
    }
  }

  public getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  public t(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = this.translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  public getTranslations(): Record<Language, Translations> {
    return this.translations;
  }
}

// Create singleton instance
export const i18n = new I18nManager();

// Hook for React components
export const useTranslation = () => {
  const [language, setLanguage] = React.useState<Language>('en');
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      try {
        await i18n.initialize();
        const currentLang = i18n.getCurrentLanguage();
        setLanguage(currentLang);
        setIsInitialized(true);
        console.log('useTranslation initialized with language:', currentLang);
      } catch (error) {
        console.log('Error in useTranslation:', error);
        setLanguage('en');
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  const changeLanguage = async (newLanguage: Language) => {
    try {
      await i18n.changeLanguage(newLanguage);
      setLanguage(newLanguage);
      console.log('Language changed to:', newLanguage);
    } catch (error) {
      console.log('Error changing language:', error);
    }
  };

  const t = (key: string) => {
    try {
      return i18n.t(key);
    } catch (error) {
      console.log('Error translating key:', key, error);
      return key;
    }
  };

  return {
    t,
    language,
    changeLanguage,
    isInitialized,
    i18n: {
      changeLanguage,
      language: i18n.getCurrentLanguage(),
    },
  };
};

// For compatibility with react-i18next
export default i18n;