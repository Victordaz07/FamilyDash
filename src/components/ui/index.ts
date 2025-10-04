/**
 * Advanced UI Components Library
 * FamilyDash - Version 1.0
 * 
 * Provides a comprehensive set of modern, reusable UI components
 * with consistent theming and responsive design.
 */

// Theme System
export { 
  AdvancedTheme,
  defaultTheme,
  ThemeProvider,
  useTheme,
  withTheme,
  themeUtils,
  ThemeColorsType,
  ThemeTypographyType,
  ThemeSpacingType,
  ThemeShadowsType,
  ThemeBordersType,
  ThemeLayoutType,
} from './ThemeProvider';

export type {
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeShadows,
  ThemeBorders,
  ThemeLayout,
  AdvancedTheme as IAdvancedTheme,
} from './AdvancedTheme';

// Components
export { 
  AdvancedButton,
  ButtonVariant,
  ButtonSize,
} from './AdvancedButton';

export { 
  AdvancedCard,
  CardVariant,
  CardSize,
  CardHeader,
  CardBody,
  CardFooter,
} from './AdvancedCard';

export { 
  AdvancedInput,
  InputSize,
  InputVariant,
} from './AdvancedInput';

// Utility Types
export type { 
  AdvancedButtonProps,
} from './AdvancedButton';

export type { 
  AdvancedCardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from './AdvancedCard';

export type { 
  AdvancedInputProps,
} from './AdvancedInput';

// Version Information
export const UI_COMPONENTS_VERSION = '1.0.0';
export const COMPATIBLE_THEME_VERSION = '1.0.0';

// Quick Theme Access (for legacy components)
export const quickTheme = {
  // Colors
  primary: '#8B5CF6',
  secondary: '#3B82F6',
  accent: '#10B981',
  success: '#10B981',
  warning: '#F59E0B',

// Text Colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  
  // Background Colors
  background: '#FFFFFF',
  surface: '#F9FAFB',
  
  // Border Colors
  border: '#E5E7EB',
  
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  
  // Border Radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
};
