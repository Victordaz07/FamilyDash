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
    // Initialize synchronously with default language
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
        // Detect system language
        const locale = Localization.locale || 'en';
        this.currentLanguage = locale.startsWith('es') ? 'es' : 'en';
        await this.saveLanguage(this.currentLanguage);
      }
      this.initialized = true;
    } catch (error) {
      console.log('Error initializing language:', error);
      this.currentLanguage = 'en';
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

  public async changeLanguage(language: Language) {
    this.currentLanguage = language;
    await this.saveLanguage(language);
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
  const [language, setLanguage] = React.useState<Language>(i18n.getCurrentLanguage());
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      await i18n.initialize();
      setLanguage(i18n.getCurrentLanguage());
      setIsInitialized(true);
    };
    init();
  }, []);

  const changeLanguage = async (newLanguage: Language) => {
    await i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
  };

  const t = (key: string) => i18n.t(key);

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