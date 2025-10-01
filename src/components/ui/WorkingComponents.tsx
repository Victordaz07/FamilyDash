import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const buttonStyle = [
    styles.button,
    fullWidth && styles.button_fullWidth,
    disabled && styles.button_disabled,
    variant === 'outline' && styles.button_outline,
    style,
  ].filter(Boolean);

  const textStyle = [
    styles.buttonText,
    variant === 'outline' && styles.buttonText_outline,
  ].filter(Boolean);

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={buttonStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={textStyle}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={variant === 'primary' ? ['#3b82f6', '#2563eb'] : ['#a855f7', '#7c3aed']}
        style={styles.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.buttonText}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
}) => {
  const cardStyle = [styles.card, style].filter(Boolean);

  const content = (
    <View style={cardStyle}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  style,
}) => {
  const badgeStyle = [
    styles.badge,
    styles[`badge_${variant}`],
    style,
  ].filter(Boolean);

  const textStyle = [
    styles.badgeText,
    styles[`badgeText_${variant}`],
  ].filter(Boolean);

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};

interface AvatarProps {
  source?: { uri: string };
  size?: number;
  name?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 40,
  name,
  style,
}) => {
  const getInitials = () => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarStyle = [
    styles.avatar,
    { width: size, height: size, borderRadius: size / 2 },
    style,
  ].filter(Boolean);

  return (
    <View style={avatarStyle}>
      {source ? (
        <Image source={source} style={styles.avatarImage} />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
          {getInitials()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Button styles
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button_fullWidth: {
    width: '100%',
  },
  button_disabled: {
    opacity: 0.6,
  },
  button_outline: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: 'transparent',
  },
  buttonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  buttonText_outline: {
    color: '#3b82f6',
  },

  // Card styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
  },

  // Badge styles
  badge: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badge_primary: {
    backgroundColor: '#dbeafe',
  },
  badge_success: {
    backgroundColor: '#dcfce7',
  },
  badge_warning: {
    backgroundColor: '#fef3c7',
  },
  badge_error: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontWeight: '500',
    fontSize: 12,
  },
  badgeText_primary: {
    color: '#1e40af',
  },
  badgeText_success: {
    color: '#166534',
  },
  badgeText_warning: {
    color: '#92400e',
  },
  badgeText_error: {
    color: '#991b1b',
  },

  // Avatar styles
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  avatarText: {
    color: '#6b7280',
    fontWeight: '600',
  },
});
