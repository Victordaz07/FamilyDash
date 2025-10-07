/**
 * 🎯 ANIMATED BUTTON COMPONENT — FamilyDash+
 * Botón con animaciones suaves y efectos visuales
 */

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
  colors?: string[];
  animationType?: 'scale' | 'bounce' | 'pulse' | 'none';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  gradient = true,
  colors,
  animationType = 'scale',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animationType === 'scale') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#8B5CF6',
          textColor: 'white',
          borderColor: '#8B5CF6',
        };
      case 'secondary':
        return {
          backgroundColor: '#6B7280',
          textColor: 'white',
          borderColor: '#6B7280',
        };
      case 'success':
        return {
          backgroundColor: '#10B981',
          textColor: 'white',
          borderColor: '#10B981',
        };
      case 'warning':
        return {
          backgroundColor: '#F59E0B',
          textColor: 'white',
          borderColor: '#F59E0B',
        };
      case 'danger':
        return {
          backgroundColor: '#EF4444',
          textColor: 'white',
          borderColor: '#EF4444',
        };
      default:
        return {
          backgroundColor: '#8B5CF6',
          textColor: 'white',
          borderColor: '#8B5CF6',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 16,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
          iconSize: 20,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: 18,
          iconSize: 24,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
          iconSize: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: disabled ? '#E5E7EB' : variantStyles.backgroundColor,
      borderColor: disabled ? '#D1D5DB' : variantStyles.borderColor,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
    },
    style,
  ];

  const textStyleFinal = [
    styles.text,
    {
      color: disabled ? '#9CA3AF' : variantStyles.textColor,
      fontSize: sizeStyles.fontSize,
    },
    textStyle,
  ];

  const iconSize = sizeStyles.iconSize;

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && (
        <Ionicons
          name={icon as any}
          size={iconSize}
          color={disabled ? '#9CA3AF' : variantStyles.textColor}
          style={styles.iconLeft}
        />
      )}
      <Text style={textStyleFinal}>{title}</Text>
      {icon && iconPosition === 'right' && (
        <Ionicons
          name={icon as any}
          size={iconSize}
          color={disabled ? '#9CA3AF' : variantStyles.textColor}
          style={styles.iconRight}
        />
      )}
    </>
  );

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  if (gradient && !disabled) {
    const gradientColors = colors || [
      variantStyles.backgroundColor,
      variantStyles.backgroundColor + 'DD',
    ];

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradientColors}
            style={[styles.gradientButton, { paddingVertical: sizeStyles.paddingVertical }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default AnimatedButton;
