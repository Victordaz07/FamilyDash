/**
 * Advanced Theme System for FamilyDash
 * Provides consistent colors, typography, spacing, and styling patterns
 */

export interface ThemeColors {
    // Primary Colors
    primary: string;
    primaryDark: string;
    primaryLight: string;

    // Secondary Colors
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;

    // Accent Colors
    accent: string;
    accentDark: string;
    accentLight: string;

    // Success, Warning, Error
    success: string;
    successDark: string;
    successLight: string;

    warning: string;
    warningDark: string;
    warningLight: string;

    error: string;
    errorDark: string;
    errorLight: string;

    // Neutral Colors
    white: string;
    black: string;
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;

    // Background Colors
    background: string;
    surface: string;
    surfaceVariant: string;

    // Text Colors
    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    textInverse: string;

    // Border Colors
    border: string;
    borderLight: string;
    borderDark: string;

    // Overlay Colors
    overlay: string;
    overlayDark: string;
}

export interface ThemeTypography {
    fontFamily: {
        regular: string;
        medium: string;
        semibold: string;
        bold: string;
    };

    fontSize: {
        xs: number;
        sm: number;
        base: number;
        lg: number;
        xl: number;
        '2xl': number;
        '3xl': number;
        '4xl': number;
        '5xl': number;
    };

    lineHeight: {
        tight: number;
        normal: number;
        relaxed: number;
    };

    textStyles: {
        h1: TextStyle;
        h2: TextStyle;
        h3: TextStyle;
        h4: TextStyle;
        h5: TextStyle;
        h6: TextStyle;
        body: TextStyle;
        title: TextStyle;
        subtitle: TextStyle;
        caption: TextStyle;
        overline: TextStyle;
        button: TextStyle;
        label: TextStyle;
    };
}

export interface ThemeSpacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
}

export interface ThemeShadows {
    sm: ShadowStyle;
    md: ShadowStyle;
    lg: ShadowStyle;
    xl: ShadowStyle;
    '2xl': ShadowStyle;
}

export interface ThemeBorders {
    radius: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        '2xl': number;
        full: number;
    };
}

export interface ThemeLayout {
    containerPadding: number;
    screenPadding: number;
    componentPadding: {
        sm: number;
        md: number;
        lg: number;
    };
}

export interface AdvancedTheme {
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    shadows: ThemeShadows;
    borders: ThemeBorders;
    layout: ThemeLayout;
}

// Import required React Native types
import { TextStyle, ShadowStyle } from 'react-native';

// Default Theme Configuration
export const defaultTheme: AdvancedTheme = {
    colors: {
        // Primary - Purple/Violet
        primary: '#8B5CF6',
        primaryDark: '#7C3AED',
        primaryLight: '#A78BFA',

        // Secondary - Blue
        secondary: '#3B82F6',
        secondaryDark: '#2563EB',
        secondaryLight: '#60A5FA',

        // Accent - Green
        accent: '#10B981',
        accentDark: '#059669',
        accentLight: '#34D399',

        // Status Colors
        success: '#10B981',
        successDark: '#059669',
        successLight: '#34D399',

        warning: '#F59E0B',
        warningDark: '#D97706',
        warningLight: '#FBBF24',

        error: '#EF4444',
        errorDark: '#DC2626',
        errorLight: '#F87171',

        // Neutral Colors
        white: '#FFFFFF',
        black: '#000000',
        gray50: '#F9FAFB',
        gray100: '#F3F4F6',
        gray200: '#E5E7EB',
        gray300: '#D1D5DB',
        gray400: '#9CA3AF',
        gray500: '#6B7280',
        gray600: '#4B5563',
        gray700: '#374151',
        gray800: '#1F2937',
        gray900: '#111827',

        // Background Colors
        background: '#FFFFFF',
        surface: '#F9FAFB',
        surfaceVariant: '#F3F4F6',

        // Text Colors
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        textDisabled: '#9CA3AF',
        textInverse: '#FFFFFF',

        // Border Colors
        border: '#E5E7EB',
        borderLight: '#F3F4F6',
        borderDark: '#D1D5DB',

        // Overlay Colors
        overlay: 'rgba(0, 0, 0, 0.5)',
        overlayDark: 'rgba(0, 0, 0, 0.75)',
    },

    typography: {
        fontFamily: {
            regular: 'System',
            medium: 'System',
            semibold: 'System',
            bold: 'System',
        },

        fontSize: {
            xs: 12,
            sm: 14,
            base: 16,
            lg: 18,
            xl: 20,
            '2xl': 24,
            '3xl': 30,
            '4xl': 36,
            '5xl': 48,
        },

        lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75,
        },

        textStyles: {
            h1: {
                fontSize: 32,
                fontWeight: '700',
                lineHeight: 40,
                color: '#1F2937',
            },
            h2: {
                fontSize: 28,
                fontWeight: '600',
                lineHeight: 36,
                color: '#1F2937',
            },
            h3: {
                fontSize: 24,
                fontWeight: '600',
                lineHeight: 32,
                color: '#1F2937',
            },
            h4: {
                fontSize: 20,
                fontWeight: '600',
                lineHeight: 28,
                color: '#1F2937',
            },
            h5: {
                fontSize: 18,
                fontWeight: '600',
                lineHeight: 26,
                color: '#1F2937',
            },
            h6: {
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 24,
                color: '#1F2937',
            },
            body: {
                fontSize: 16,
                fontWeight: '400',
                lineHeight: 24,
                color: '#374151',
            },
            title: {
                fontSize: 18,
                fontWeight: '600',
                lineHeight: 26,
                color: '#1F2937',
            },
            subtitle: {
                fontSize: 14,
                fontWeight: '500',
                lineHeight: 20,
                color: '#6B7280',
            },
            caption: {
                fontSize: 12,
                fontWeight: '400',
                lineHeight: 16,
                color: '#9CA3AF',
            },
            overline: {
                fontSize: 10,
                fontWeight: '600',
                lineHeight: 14,
                color: '#6B7280',
                textTransform: 'uppercase',
            },
            button: {
                fontSize: 16,
                fontWeight: '600',
                lineHeight: 24,
                color: '#FFFFFF',
            },
            label: {
                fontSize: 14,
                fontWeight: '500',
                lineHeight: 20,
                color: '#374151',
            },
        },
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        '2xl': 40,
        '3xl': 48,
        '4xl': 64,
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        xl: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
        },
        '2xl': {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 12,
        },
    },

    borders: {
        radius: {
            xs: 4,
            sm: 8,
            md: 12,
            lg: 16,
            xl: 20,
            '2xl': 24,
            full: 9999,
        },
    },

    layout: {
        containerPadding: 20,
        screenPadding: 16,
        componentPadding: {
            sm: 8,
            md: 16,
            lg: 24,
        },
    },
};

export type ThemeColorsType = typeof defaultTheme.colors;
export type ThemeTypographyType = typeof defaultTheme.typography;
export type ThemeSpacingType = typeof defaultTheme.spacing;
export type ThemeShadowsType = typeof defaultTheme.shadows;
export type ThemeBordersType = typeof defaultTheme.borders;
export type ThemeLayoutType = typeof defaultTheme.layout;
