import React, { createContext, useContext, ReactNode } from 'react';
import { AdvancedTheme, defaultTheme } from './AdvancedTheme';

// Create Theme Context
interface ThemeContextType {
    theme: AdvancedTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Provider Props
interface ThemeProviderProps {
    children: ReactNode;
    theme?: AdvancedTheme;
}

// Theme Provider Component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    theme = defaultTheme,
}) => {
    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom Hook to use Theme
export const useTheme = (): AdvancedTheme => {
    const context = useContext(ThemeContext);

    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context.theme;
};

// Higher Order Component for theme access
export const withTheme = <P extends object>(
    Component: React.ComponentType<P>
): React.FC<P & { theme?: AdvancedTheme }> => {
    return (props) => {
        const theme = useTheme();
        return <Component {...props} theme={theme} />;
    };
};

// Theme utilities for quick access
export const themeUtils = {
    // Create gradient colors for common themes
    gradients: {
        primary: [defaultTheme.colors.primary, defaultTheme.colors.primaryDark],
        secondary: [defaultTheme.colors.secondary, defaultTheme.colors.secondaryDark],
        accent: [defaultTheme.colors.accent, defaultTheme.colors.accentDark],
        success: [defaultTheme.colors.success, defaultTheme.colors.successDark],
        warning: [defaultTheme.colors.warning, defaultTheme.colors.warningDark],
        error: [defaultTheme.colors.error, defaultTheme.colors.errorDark],
    },

    // Generate color variations
    getColorVariation: (baseColor: string, opacity: number = 1): string => {
        // This would generate opacity variations in a real implementation
        return baseColor;
    },

    // Create spacing utilities
    spacing: defaultTheme.spacing,

    // Create border radius utilities
    borderRadius: defaultTheme.borders.radius,

    // Create shadow utilities
    shadows: defaultTheme.shadows,

    // Create component size utilities
    componentSizes: {
        button: {
            sm: { height: 32, paddingHorizontal: 12, fontSize: 14 },
            md: { height: 40, paddingHorizontal: 16, fontSize: 16 },
            lg: { height: 48, paddingHorizontal: 20, fontSize: 18 },
        },
        input: {
            sm: { height: 36, paddingHorizontal: 12, fontSize: 14 },
            md: { height: 44, paddingHorizontal: 16, fontSize: 16 },
            lg: { height: 52, paddingHorizontal: 20, fontSize: 18 },
        },
        card: {
            sm: { padding: 12, borderRadius: 8 },
            md: { padding: 16, borderRadius: 12 },
            lg: { padding: 24, borderRadius: 16 },
        },
    },
};




