/**
 * Tema simplificado para FamilyDash
 */

export const colors = {
    primary: '#8B5CF6',
    primaryDark: '#7C3AED',
    primaryLight: '#F3F4F6',
    secondary: '#a855f7',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f9fafb',
    gradientEnd: '#e5e7eb', // Faltaba este valor
    textPrimary: '#111827',
    cardBackground: '#ffffff',
    surface: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    gray: '#6B7280',
    border: '#e5e7eb',
    white: '#ffffff',
};

export const spacing = {
    xs: 4,
    sm: 8,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
};

export const borderRadius = {
    sm: 8,
    small: 8,
    medium: 12,
    md: 12,
    lg: 16,
    large: 16,
    xl: 20,
    full: 9999,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    small: {
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
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
};

export const typography = {
    fontSize: {
        small: 12,
        medium: 14,
        large: 16,
        xlarge: 18,
        xxlarge: 20,
        xxxlarge: 24,
    },
    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
};

export const theme = {
    colors,
    spacing,
    borderRadius,
    shadows,
    typography,
};

export default theme;
