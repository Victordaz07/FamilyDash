/**
 * 📝 ENHANCED INPUT COMPONENT — FamilyDash+
 * Componente de input mejorado con validación en tiempo real
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface EnhancedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  error?: string | null;
  touched?: boolean;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  secureTextEntry?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  disabled?: boolean;
  maxLength?: number;
  style?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  placeholder,
  error,
  touched,
  required = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  maxLength,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const hasError = touched && error;
  const isActive = isFocused || value.length > 0;

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [hasError ? '#EF4444' : '#E5E7EB', hasError ? '#EF4444' : '#8B5CF6'],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [hasError ? '#EF4444' : '#6B7280', hasError ? '#EF4444' : '#8B5CF6'],
  });

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      <Animated.Text style={[
        styles.label,
        {
          color: labelColor,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -8],
            }),
          }],
        },
        labelStyle,
      ]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Animated.Text>

      {/* Input Container */}
      <Animated.View style={[
        styles.inputContainer,
        {
          borderColor,
          backgroundColor: disabled ? '#F9FAFB' : 'white',
        },
        isActive && styles.inputContainerActive,
        hasError && styles.inputContainerError,
      ]}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons name={leftIcon as any} size={20} color="#6B7280" />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          maxLength={maxLength}
        />

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={rightIcon === 'eye' || rightIcon === 'eye-off' ? togglePasswordVisibility : onRightIconPress}
          >
            <Ionicons
              name={rightIcon === 'eye' ? (showPassword ? 'eye-off' : 'eye') : rightIcon as any}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Error Message */}
      {hasError && (
        <Animated.View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={[styles.errorText, errorStyle]}>{error}</Text>
        </Animated.View>
      )}

      {/* Character Count */}
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerActive: {
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerError: {
    shadowColor: '#EF4444',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  leftIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  rightIconContainer: {
    marginLeft: 12,
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginLeft: 6,
    flex: 1,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
});

export default EnhancedInput;




