import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ColorTheme {
    name: string;
    value: string;
    gradient: string[];
    light: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        textInverse: string;
        textInverseSecondary: string;
        inputBackground: string;
        border: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
    };
    dark: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        textInverse: string;
        textInverseSecondary: string;
        inputBackground: string;
        border: string;
        accent: string;
        success: string;
        warning: string;
        error: string;
        info: string;
    };
}

export interface FontSizeTheme {
    label: string;
    size: number;
    description: string;
    // Scale factors for different text elements
    scale: {
        h1: number;
        h2: number;
        h3: number;
        body: number;
        caption: number;
        button: number;
    };
}

export interface Theme {
    mode: ThemeMode;
    color: ColorTheme;
    fontSize: FontSizeTheme;
    isDark: boolean;
}

interface ThemeContextType {
    theme: Theme;
    setThemeMode: (mode: ThemeMode) => Promise<void>;
    setColorTheme: (color: ColorTheme) => Promise<void>;
    setFontSizeTheme: (fontSize: FontSizeTheme) => Promise<void>;
    toggleTheme: () => Promise<void>;
    resetTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Predefined color themes
export const colorThemes: ColorTheme[] = [
    {
        name: 'Purple',
        value: '#667eea',
        gradient: ['#667eea', '#764ba2'],
        light: {
            primary: '#667eea',
            secondary: '#764ba2',
            background: '#f8fafc',
            surface: '#ffffff',
            text: '#1e293b',
            textSecondary: '#64748b',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#f1f5f9',
            border: '#e2e8f0',
            accent: '#667eea',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
        },
        dark: {
            primary: '#8b5cf6',
            secondary: '#a78bfa',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#1e293b',
            border: '#334155',
            accent: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#60a5fa',
        },
    },
    {
        name: 'Blue',
        value: '#3b82f6',
        gradient: ['#3b82f6', '#1d4ed8'],
        light: {
            primary: '#3b82f6',
            secondary: '#1d4ed8',
            background: '#f8fafc',
            surface: '#ffffff',
            text: '#1e293b',
            textSecondary: '#64748b',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#f1f5f9',
            border: '#e2e8f0',
            accent: '#3b82f6',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
        },
        dark: {
            primary: '#60a5fa',
            secondary: '#3b82f6',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#1e293b',
            border: '#334155',
            accent: '#60a5fa',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#60a5fa',
        },
    },
    {
        name: 'Green',
        value: '#4ade80',
        gradient: ['#4ade80', '#22c55e'],
        light: {
            primary: '#22c55e',
            secondary: '#16a34a',
            background: '#f8fafc',
            surface: '#ffffff',
            text: '#1e293b',
            textSecondary: '#64748b',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#f1f5f9',
            border: '#e2e8f0',
            accent: '#22c55e',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
        },
        dark: {
            primary: '#10b981',
            secondary: '#059669',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#1e293b',
            border: '#334155',
            accent: '#10b981',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#60a5fa',
        },
    },
    {
        name: 'Orange',
        value: '#f59e0b',
        gradient: ['#f59e0b', '#d97706'],
        light: {
            primary: '#f59e0b',
            secondary: '#d97706',
            background: '#f8fafc',
            surface: '#ffffff',
            text: '#1e293b',
            textSecondary: '#64748b',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#f1f5f9',
            border: '#e2e8f0',
            accent: '#f59e0b',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
        },
        dark: {
            primary: '#f59e0b',
            secondary: '#d97706',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#1e293b',
            border: '#334155',
            accent: '#f59e0b',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#60a5fa',
        },
    },
    {
        name: 'Pink',
        value: '#ec4899',
        gradient: ['#ec4899', '#be185d'],
        light: {
            primary: '#ec4899',
            secondary: '#be185d',
            background: '#f8fafc',
            surface: '#ffffff',
            text: '#1e293b',
            textSecondary: '#64748b',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#f1f5f9',
            border: '#e2e8f0',
            accent: '#ec4899',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
        },
        dark: {
            primary: '#f472b6',
            secondary: '#ec4899',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#1e293b',
            border: '#334155',
            accent: '#f472b6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#60a5fa',
        },
    },
    {
        name: 'Red',
        value: '#ef4444',
        gradient: ['#ef4444', '#dc2626'],
        light: {
            primary: '#ef4444',
            secondary: '#dc2626',
            background: '#f8fafc',
            surface: '#ffffff',
            text: '#1e293b',
            textSecondary: '#64748b',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#f1f5f9',
            border: '#e2e8f0',
            accent: '#ef4444',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
        },
        dark: {
            primary: '#f87171',
            secondary: '#ef4444',
            background: '#0f172a',
            surface: '#1e293b',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            textInverse: '#ffffff',
            textInverseSecondary: '#e2e8f0',
            inputBackground: '#1e293b',
            border: '#334155',
            accent: '#f87171',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#60a5fa',
        },
    },
];

// Predefined font size themes
export const fontSizeThemes: FontSizeTheme[] = [
    {
        label: 'Small',
        size: 14,
        description: 'Compact',
        scale: {
            h1: 1.8,
            h2: 1.5,
            h3: 1.3,
            body: 1.0,
            caption: 0.8,
            button: 1.1,
        },
    },
    {
        label: 'Medium',
        size: 16,
        description: 'Default',
        scale: {
            h1: 2.0,
            h2: 1.7,
            h3: 1.4,
            body: 1.0,
            caption: 0.9,
            button: 1.2,
        },
    },
    {
        label: 'Large',
        size: 18,
        description: 'Comfortable',
        scale: {
            h1: 2.2,
            h2: 1.9,
            h3: 1.5,
            body: 1.0,
            caption: 1.0,
            button: 1.3,
        },
    },
    {
        label: 'Extra Large',
        size: 20,
        description: 'Easy to read',
        scale: {
            h1: 2.4,
            h2: 2.1,
            h3: 1.6,
            body: 1.0,
            caption: 1.1,
            button: 1.4,
        },
    },
];

const defaultTheme: Theme = {
    mode: 'auto',
    color: colorThemes[0], // Purple
    fontSize: fontSizeThemes[1], // Medium
    isDark: false,
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [theme, setTheme] = useState<Theme>(defaultTheme);

    // Load saved theme settings
    useEffect(() => {
        loadThemeSettings();
    }, []);

    // Update dark mode when theme mode or system scheme changes
    useEffect(() => {
        const isDark = theme.mode === 'dark' || (theme.mode === 'auto' && systemColorScheme === 'dark');
        setTheme(prev => ({ ...prev, isDark }));
    }, [theme.mode, systemColorScheme]);

    const loadThemeSettings = async () => {
        try {
            const savedMode = await AsyncStorage.getItem('theme_mode');
            const savedColor = await AsyncStorage.getItem('theme_color');
            const savedFontSize = await AsyncStorage.getItem('theme_font_size');

            let newTheme = { ...defaultTheme };

            if (savedMode) {
                newTheme.mode = savedMode as ThemeMode;
            }

            if (savedColor) {
                const colorTheme = colorThemes.find(c => c.value === savedColor);
                if (colorTheme) {
                    newTheme.color = colorTheme;
                }
            }

            if (savedFontSize) {
                const fontSizeTheme = fontSizeThemes.find(f => f.size === parseInt(savedFontSize));
                if (fontSizeTheme) {
                    newTheme.fontSize = fontSizeTheme;
                }
            }

            // Calculate initial dark mode
            newTheme.isDark = newTheme.mode === 'dark' || (newTheme.mode === 'auto' && systemColorScheme === 'dark');

            setTheme(newTheme);
        } catch (error) {
            console.error('Error loading theme settings:', error);
        }
    };

    const saveThemeSettings = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error('Error saving theme settings:', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        const newTheme = { ...theme, mode };
        setTheme(newTheme);
        await saveThemeSettings('theme_mode', mode);
    };

    const setColorTheme = async (color: ColorTheme) => {
        const newTheme = { ...theme, color };
        setTheme(newTheme);
        await saveThemeSettings('theme_color', color.value);
    };

    const setFontSizeTheme = async (fontSize: FontSizeTheme) => {
        const newTheme = { ...theme, fontSize };
        setTheme(newTheme);
        await saveThemeSettings('theme_font_size', fontSize.size.toString());
    };

    const toggleTheme = async () => {
        const newMode: ThemeMode = theme.isDark ? 'light' : 'dark';
        await setThemeMode(newMode);
    };

    const resetTheme = async () => {
        const resetTheme = { ...defaultTheme };
        resetTheme.isDark = resetTheme.mode === 'dark' || (resetTheme.mode === 'auto' && systemColorScheme === 'dark');
        setTheme(resetTheme);

        await saveThemeSettings('theme_mode', defaultTheme.mode);
        await saveThemeSettings('theme_color', defaultTheme.color.value);
        await saveThemeSettings('theme_font_size', defaultTheme.fontSize.size.toString());
    };

    const contextValue: ThemeContextType = {
        theme,
        setThemeMode,
        setColorTheme,
        setFontSizeTheme,
        toggleTheme,
        resetTheme,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Helper hooks for easier access to theme properties
export const useThemeColors = () => {
    const { theme } = useTheme();
    return theme.isDark ? theme.color.dark : theme.color.light;
};

export const useThemeFonts = () => {
    const { theme } = useTheme();
    return {
        h1: theme.fontSize.size * theme.fontSize.scale.h1,
        h2: theme.fontSize.size * theme.fontSize.scale.h2,
        h3: theme.fontSize.size * theme.fontSize.scale.h3,
        body: theme.fontSize.size * theme.fontSize.scale.body,
        caption: theme.fontSize.size * theme.fontSize.scale.caption,
        button: theme.fontSize.size * theme.fontSize.scale.button,
    };
};

export const useThemeGradient = () => {
    const { theme } = useTheme();
    return theme.color.gradient;
};
