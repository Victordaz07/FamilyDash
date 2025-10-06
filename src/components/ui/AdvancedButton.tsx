import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, themeUtils } from './ThemeProvider';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
    | 'outline'
    | 'ghost'
    | 'link';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface AdvancedButtonProps extends TouchableOpacityProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    disabled?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    gradient?: boolean;
    children: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const AdvancedButton: React.FC<AdvancedButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    gradient = false,
    children,
    style,
    textStyle,
    onPress,
    ...props
}) => {
    const theme = useTheme();

    // Size configurations
    const sizeConfig = themeUtils.componentSizes.button[size];

    // Get variant colors
    const getVariantColors = (): { background: string[]; text: string; border?: string } => {
        switch (variant) {
            case 'primary':
                return {
                    background: gradient ? [theme.colors.primary, theme.colors.primary] : [theme.colors.primary],
                    text: theme.colors.white,
                };
            case 'secondary':
                return {
                    background: gradient ? [theme.colors.secondary, theme.colors.secondary] : [theme.colors.secondary],
                    text: theme.colors.white,
                };
            case 'accent':
                return {
                    background: gradient ? [theme.colors.accent, theme.colors.accent] : [theme.colors.accent],
                    text: theme.colors.white,
                };
            case 'success':
                return {
                    background: gradient ? [theme.colors.success, theme.colors.success] : [theme.colors.success],
                    text: theme.colors.white,
                };
            case 'warning':
                return {
                    background: gradient ? [theme.colors.warning, theme.colors.warning] : [theme.colors.warning],
                    text: theme.colors.white,
                };
            case 'error':
                return {
                    background: gradient ? [theme.colors.error, theme.colors.error] : [theme.colors.error],
                    text: theme.colors.white,
                };
            case 'outline':
                return {
                    background: ['transparent'],
                    text: theme.colors.primary,
                    border: theme.colors.primary,
                };
            case 'ghost':
                return {
                    background: ['transparent'],
                    text: theme.colors.primary,
                };
            case 'link':
                return {
                    background: ['transparent'],
                    text: theme.colors.primary,
                };
            default:
                return {
                    background: gradient ? [theme.colors.primary, theme.colors.primary] : [theme.colors.primary],
                    text: theme.colors.white,
                };
        }
    };

    const colors = getVariantColors();

    // Button styles
    const buttonStyle: ViewStyle[] = [
        styles.base,
        {
            height: sizeConfig.height,
            paddingHorizontal: sizeConfig.paddingHorizontal,
            borderRadius: theme.borders.radius.md,
            ...styles[variant],
            ...(fullWidth && styles.fullWidth),
            ...(disabled && styles.disabled),
        },
        style,
    ];

    // Text styles
    const textStyleOverride: TextStyle[] = [
        {
            fontSize: sizeConfig.fontSize,
            fontWeight: '600' as const,
            color: disabled ? theme.colors.textDisabled : colors.text,
        },
        ...(variant === 'link' ? [theme.typography.textStyles.button] : []),
        textStyle,
    ].filter(Boolean) as TextStyle[];

    // Icon styles
    const iconSize = size === 'sm' ? 16 : size === 'md' ? 18 : 20;
    const iconColor = disabled ? theme.colors.textDisabled : colors.text;

    // Render icon
    const renderIcon = () => {
        if (!icon || loading) return null;

        return (
            <Ionicons
                name={icon}
                size={iconSize}
                color={iconColor}
                style={[
                    iconPosition === 'right' && styles.iconRight,
                    styles.icon,
                ]}
            />
        );
    };

    // Render loading spinner
    const renderLoading = () => {
        if (!loading) return null;

        return (
            <ActivityIndicator
                size="small"
                color={iconColor}
                style={styles.loadingSpinner}
            />
        );
    };

    // Render button content
    const renderContent = () => {
        const iconElement = renderIcon();
        const loadingElement = renderLoading();
        const textElement = <Text style={textStyleOverride}>{children}</Text>;

        const elements = [];

        if (loadingElement) {
            elements.push(loadingElement);
        } else if (iconElement) {
            if (iconPosition === 'left') {
                elements.push(iconElement);
                elements.push(textElement);
            } else {
                elements.push(textElement);
                elements.push(iconElement);
            }
        } else {
            elements.push(textElement);
        }

        return (
            <>
                {elements.map((element, index) => (
                    <React.Fragment key={index}>{element}</React.Fragment>
                ))}
            </>
        );
    };

    // Render gradient button
    if (gradient && variant !== 'outline' && variant !== 'ghost' && variant !== 'link') {
        return (
            <TouchableOpacity
                onPress={disabled || loading ? undefined : onPress}
                disabled={disabled || loading}
                {...props}
            >
                <LinearGradient
                    colors={colors.background as unknown as readonly [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={buttonStyle}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Render regular button
    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={disabled || loading ? undefined : onPress}
            disabled={disabled || loading}
            {...props}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    primary: {
        backgroundColor: '#8B5CF6',
    },
    secondary: {
        backgroundColor: '#3B82F6',
    },
    accent: {
        backgroundColor: '#10B981',
    },
    success: {
        backgroundColor: '#10B981',
    },
    warning: {
        backgroundColor: '#F59E0B',
    },
    error: {
        backgroundColor: '#EF4444',
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#8B5CF6',
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    link: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.5,
    },
    icon: {
        marginHorizontal: 4,
    },
    iconRight: {
        marginLeft: 8,
    },
    loadingSpinner: {
        marginRight: 8,
    },
});

// Convenience export of theme utils
export { themeUtils } from './ThemeProvider';
