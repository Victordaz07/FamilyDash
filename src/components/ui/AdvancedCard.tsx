import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'gradient' | 'glass';
export type CardSize = 'sm' | 'md' | 'lg';

interface AdvancedCardProps extends TouchableOpacityProps {
  variant?: CardVariant;
  size?: CardSize;
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: string[];
  gradientDirection?: 'vertical' | 'horizontal' | 'diagonal';
  glassOpacity?: number;
  disabled?: boolean;
  pressable?: boolean;
}

export const AdvancedCard: React.FC<AdvancedCardProps> = ({
  variant = 'default',
  size = 'md',
  children,
  style,
  gradientColors,
  gradientDirection = 'horizontal',
  glassOpacity = 0.1,
  disabled = false,
  pressable = false,
  onPress,
  ...props
}) => {
  const theme = useTheme();
  
  // Size configurations
  const sizeConfig = themeUtils.componentSizes.card[size];
  
  // Get variant styles
  const getVariantStyles = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      padding: sizeConfig.padding,
      borderRadius: sizeConfig.borderRadius,
    };
    
    switch (variant) {
      case 'default':
        return [
          baseStyle,
          {
            backgroundColor: theme.colors.white,
            ...theme.shadows.sm,
          },
        ];
      case 'elevated':
        return [
          baseStyle,
          {
            backgroundColor: theme.colors.white,
            ...theme.shadows.lg,
          },
        ];
      case 'outlined':
        return [
          baseStyle,
          {
            backgroundColor: theme.colors.white,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
        ];
      case 'glass':
        return [
          baseStyle,
          {
            backgroundColor: `${theme.colors.white}${Math.round(glassOpacity * 255).toString(16).padStart(2, '0')}`,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
            backdropFilter: 'blur(10px)',
          },
        ];
      default:
        return [
          baseStyle,
          {
            backgroundColor: theme.colors.white,
            ...theme.shadows.md,
          },
        ];
    }
  };
  
  const cardStyles: ViewStyle[] = [
    styles.base,
    ...getVariantStyles(),
    disabled && styles.disabled,
    style,
  ];
  
  // Get gradient direction configuration
  const getGradientProps = () => {
    switch (gradientDirection) {
      case 'vertical':
        return {
          start: { x: 0, y: 0 },
          end: { x: 0, y: 1 },
        };
      case 'diagonal':
        return {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
        };
      case 'horizontal':
      default:
        return {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 },
        };
    }
  };
  
  // Render gradient card
  if (variant === 'gradient') {
    const colors = gradientColors || [`${theme.colors.primary}20`, `${theme.colors.secondary}20`];
    const gradientProps = getGradientProps();
    
    return (
      <TouchableOpacity
        disabled={disabled || !pressable}
        onPress={disabled || !pressable ? undefined : onPress}
        style={[styles.base, styles.gradientPadding]}
        {...props}
      >
        <LinearGradient
          colors={colors}
          {...gradientProps}
          style={[
            {
              padding: sizeConfig.padding,
              borderRadius: sizeConfig.borderRadius,
            },
            disabled && styles.disabled,
            style,
          ]}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  // Render regular card
  const CardComponent = pressable ? TouchableOpacity : View;
  
  return (
    <CardComponent
      disabled={disabled}
      onPress={pressable ? onPress : undefined}
      style={cardStyles}
      {...(pressable ? props : {})}
    >
      {children}
    </CardComponent>
  );
};

// Card Header Component
interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.header, { marginBottom: theme.spacing.sm }, style]}>
      {children}
    </View>
  );
};

// Card Body Component
interface CardBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, style }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.body, { marginBottom: theme.spacing.sm }, style]}>
      {children}
    </View>
  );
};

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  gradientPadding: {
    padding: 0,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    // Additional header styles can be added here
  },
  body: {
    // Additional body styles can be added here
  },
  footer: {
    // Additional footer styles can be added here
  },
});

// Convenience export of theme utils
export { themeUtils } from './ThemeProvider';
