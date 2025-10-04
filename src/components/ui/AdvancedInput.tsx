import React, { forwardRef, useState } from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeProvider';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'outlined' | 'filled' | 'ghost';

interface AdvancedInputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    variant?: InputVariant;
    size?: InputSize;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    labelStyle?: TextStyle;
    errorStyle?: TextStyle;
    helperStyle?: TextStyle;
}

export const AdvancedInput = forwardRef<TextInput, AdvancedInputProps>(({
    label,
    error,
    helperText,
    variant = 'default',
    size = 'md',
    icon,
    iconPosition = 'left',
    rightIcon,
    onRightIconPress,
    disabled = false,
    fullWidth = true,
    containerStyle,
    inputStyle,
    labelStyle,
    errorStyle,
    helperStyle,
    multiLine = false,
    numberOfLines = 1,
    style,
    ...props
}, ref) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Size configurations
    const sizeConfig = themeUtils.componentSizes.input[size];

    // Focus handlers
    const handleFocus = (e: any) => {
        setIsFocused(true);
        props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        props.onBlur?.(e);
    };

    // Get variant styles
    const getVariantStyles = () => {
        const basePaddingHorizontal = sizeConfig.paddingHorizontal;
        const paddingHorizontal = icon
            ? iconPosition === 'left'
                ? basePaddingHorizontal + 32
                : basePaddingHorizontal + (rightIcon ? 64 : 32)
            : basePaddingHorizontal;

        const baseStyles: ViewStyle = {
            height: multiLine ? 'auto' : sizeConfig.height,
            paddingHorizontal,
            paddingVertical: multiLine ? 12 : 0,
            fontSize: sizeConfig.fontSize,
            borderRadius: theme.borders.radius.md,
            borderWidth: 1,
            color: disabled ? theme.colors.textDisabled : theme.colors.textPrimary,
        };

        switch (variant) {
            case 'default':
                return [
                    baseStyles,
                    {
                        backgroundColor: theme.colors.white,
                        borderColor: error
                            ? theme.colors.error
                            : isFocused
                                ? theme.colors.primary
                                : theme.colors.border,
                    },
                ];
            case 'outlined':
                return [
                    baseStyles,
                    {
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderColor: error
                            ? theme.colors.error
                            : isFocused
                                ? theme.colors.primary
                                : theme.colors.border,
                    },
                ];
            case 'filled':
                return [
                    baseStyles,
                    {
                        backgroundColor: theme.colors.surfaceVariant,
                        borderWidth: 0,
                        ...(isFocused && {
                            borderBottomWidth: 2,
                            borderBottomColor: theme.colors.primary,
                        }),
                    },
                ];
            case 'ghost':
                return [
                    baseStyles,
                    {
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        ...(isFocused && {
                            borderBottomWidth: 1,
                            borderBottomColor: theme.colors.primary,
                        }),
                    },
                ];
            default:
                return [
                    baseStyles,
                    {
                        backgroundColor: theme.colors.white,
                        borderColor: theme.colors.border,
                    },
                ];
        }
    };

    // Container styles
    const containerStyles: ViewStyle[] = [
        styles.container,
        fullWidth && styles.fullWidth,
        containerStyle,
    ];

    // Input wrapper styles
    const wrapperStyles: ViewStyle[] = [
        styles.inputWrapper,
        ...getVariantStyles(),
        disabled && styles.disabled,
        style,
    ];

    // Render icon
    const renderIcon = (position: 'left' | 'right', iconName?: keyof typeof Ionicons.glyphMap, onPress?: () => void) => {
        if (!iconName) return null;

        const iconSize = size === 'sm' ? 16 : size === 'md' ? 18 : 20;
        const iconColor = disabled
            ? theme.colors.textDisabled
            : error
                ? theme.colors.error
                : isFocused
                    ? theme.colors.primary
                    : theme.colors.textSecondary;

        const iconStyle = [
            styles.icon,
            position === 'right' && styles.iconRight,
            position === 'left' && styles.iconLeft,
        ];

        if (onPress) {
            return (
                <TouchableOpacity
                    style={iconStyle}
                    onPress={disabled ? undefined : onPress}
                    disabled={disabled}
                >
                    <Ionicons name={iconName} size={iconSize} color={iconColor} />
                </TouchableOpacity>
            );
        }

        return (
            <View style={iconStyle}>
                <Ionicons name={iconName} size={iconSize} color={iconColor} />
            </View>
        );
    };

    return (
        <View style={containerStyles}>
            {/* Label */}
            {label && (
                <Text style={[
                    theme.typography.textStyles.label,
                    {
                        marginBottom: theme.spacing.xs,
                        color: error ? theme.colors.error : theme.colors.textPrimary,
                    },
                    labelStyle,
                ]}>
                    {label}
                </Text>
            )}

            {/* Input Container */}
            <View style={wrapperStyles}>
                {/* Left Icon */}
                {icon && iconPosition === 'left' && renderIcon('left', icon)}

                {/* Text Input */}
                <TextInput
                    ref={ref}
                    style={[
                        styles.input,
                        {
                            fontSize: sizeConfig.fontSize,
                            color: disabled ? theme.colors.textDisabled : theme.colors.textPrimary,
                            flex: 1,
                        },
                        multiLine && { textAlignVertical: 'top' },
                        inputStyle,
                    ]}
                    placeholderTextColor={theme.colors.textSecondary}
                    editable={!disabled}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    multiline={multiLine}
                    numberOfLines={multiLine ? numberOfLines : 1}
                    {...props}
                />

                {/* Right Icon */}
                {(icon && iconPosition === 'right') || rightIcon ? renderIcon('right', rightIcon || icon, onRightIconPress) : null}
            </View>

            {/* Helper Text / Error */}
            {(error || helperText) && (
                <Text style={[
                    theme.typography.textStyles.caption,
                    {
                        marginTop: theme.spacing.xs,
                        color: error ? theme.colors.error : theme.colors.textSecondary,
                    },
                    error ? errorStyle : helperStyle,
                ]}>
                    {error || helperText}
                </Text>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    fullWidth: {
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        paddingVertical: 0, // Reset default padding
    },
    disabled: {
        opacity: 0.6,
    },
    icon: {
        position: 'absolute',
        zIndex: 1,
    },
    iconLeft: {
        left: 12,
    },
    iconRight: {
        right: 12,
    },
});

// Convenience export of theme utils
export { themeUtils } from './ThemeProvider';
