/**
 * Sistema de diseño moderno para FamilyDash
 * Paleta de colores cohesiva y profesional
 */

export const colors = {
    // Colores primarios - Azul moderno
    primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Color principal
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
    },

    // Colores secundarios - Púrpura elegante
    secondary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7', // Color secundario
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
    },

    // Colores de éxito - Verde moderno
    success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e', // Verde principal
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
    },

    // Colores de advertencia - Naranja vibrante
    warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b', // Naranja principal
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
    },

    // Colores de error - Rojo elegante
    error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444', // Rojo principal
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
    },

    // Colores neutros - Grises modernos
    neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },

    // Colores especiales
    special: {
        gold: '#fbbf24',
        silver: '#9ca3af',
        bronze: '#cd7f32',
        pink: '#ec4899',
        cyan: '#06b6d4',
        lime: '#84cc16',
    },

    // Colores de fondo
    background: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
        dark: '#111827',
        card: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)',
    },

    // Colores de texto
    text: {
        primary: '#111827',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
        inverse: '#ffffff',
        disabled: '#d1d5db',
    },

    // Colores de borde
    border: {
        light: '#e5e7eb',
        medium: '#d1d5db',
        dark: '#9ca3af',
        focus: '#3b82f6',
    },
};

export const gradients = {
    // Gradientes primarios
    primary: ['#3b82f6', '#2563eb'],
    secondary: ['#a855f7', '#7c3aed'],
    success: ['#22c55e', '#16a34a'],
    warning: ['#f59e0b', '#d97706'],
    error: ['#ef4444', '#dc2626'],

    // Gradientes especiales
    sunset: ['#f59e0b', '#ec4899'],
    ocean: ['#06b6d4', '#3b82f6'],
    forest: ['#22c55e', '#16a34a'],
    royal: ['#7c3aed', '#3b82f6'],
    fire: ['#ef4444', '#f59e0b'],

    // Gradientes de fondo
    background: ['#ffffff', '#f9fafb'],
    card: ['#ffffff', '#f8fafc'],
    dark: ['#1f2937', '#111827'],
};

export const shadows = {
    // Sombras sutiles
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    // Sombras estándar
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    // Sombras grandes
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },

    // Sombras extra grandes
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

export const typography = {
    // Tamaños de fuente
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
        '6xl': 60,
    },

    // Pesos de fuente
    fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },

    // Altura de línea
    lineHeight: {
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
    },
};

export const spacing = {
    // Espaciado consistente
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
};

export const borderRadius = {
    // Bordes redondeados
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
};

export const animations = {
    // Duración de animaciones
    duration: {
        fast: 200,
        normal: 300,
        slow: 500,
        slower: 800,
    },

    // Easing functions
    easing: {
        linear: 'linear',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
    },
};

// Tema completo
export const theme = {
    colors,
    gradients,
    shadows,
    typography,
    spacing,
    borderRadius,
    animations,
};

export default theme;




