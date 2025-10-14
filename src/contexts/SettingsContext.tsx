import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SettingsService, { AppSettings } from '@/services/SettingsService';

interface SettingsContextType {
  settings: AppSettings;
  loading: boolean;
  toggleTestingButtons: () => Promise<void>;
  toggleDeveloperMode: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({ showTestingButtons: false, developerModeEnabled: false });
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const loadedSettings = await SettingsService.loadSettings();
            setSettings(loadedSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTestingButtons = async () => {
        try {
            await SettingsService.toggleTestingButtons();
            const updatedSettings = SettingsService.getSettings();
            setSettings(updatedSettings);
        } catch (error) {
            console.error('Error toggling testing buttons:', error);
        }
    };

    const toggleDeveloperMode = async () => {
    try {
      await SettingsService.toggleDeveloperMode();
      const updatedSettings = SettingsService.getSettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error toggling developer mode:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
        try {
            await SettingsService.saveSettings(newSettings);
            const updatedSettings = SettingsService.getSettings();
            setSettings(updatedSettings);
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      toggleTestingButtons,
      toggleDeveloperMode,
      updateSettings,
    }}>
            {children}
        </SettingsContext.Provider>
    );
};
