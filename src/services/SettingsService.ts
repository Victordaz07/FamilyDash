import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  showTestingButtons: boolean;
  developerModeEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  showTestingButtons: false, // Por defecto oculto para usuarios finales
  developerModeEnabled: false, // Por defecto desactivado
};

class SettingsService {
    private static instance: SettingsService;
    private settings: AppSettings = DEFAULT_SETTINGS;

    static getInstance(): SettingsService {
        if (!SettingsService.instance) {
            SettingsService.instance = new SettingsService();
        }
        return SettingsService.instance;
    }

    async loadSettings(): Promise<AppSettings> {
        try {
            const stored = await AsyncStorage.getItem('appSettings');
            if (stored) {
                this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
            return this.settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return DEFAULT_SETTINGS;
        }
    }

    async saveSettings(settings: Partial<AppSettings>): Promise<void> {
        try {
            this.settings = { ...this.settings, ...settings };
            await AsyncStorage.setItem('appSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    getSettings(): AppSettings {
        return this.settings;
    }

  async toggleTestingButtons(): Promise<void> {
    await this.saveSettings({ showTestingButtons: !this.settings.showTestingButtons });
  }

  async toggleDeveloperMode(): Promise<void> {
    await this.saveSettings({ developerModeEnabled: !this.settings.developerModeEnabled });
  }
}

export default SettingsService.getInstance();
