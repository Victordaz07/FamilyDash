/**
 * 🎴 ANIMATED CARD COMPONENT — FamilyDash+
 * Card con animaciones suaves y efectos visuales
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface AnimatedCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  gradient?: boolean;
  colors?: string[];
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  animationType?: 'fade' | 'slide' | 'scale' | 'none';
  delay?: number;
  shadow?: boolean;
  border?: boolean;
  borderColor?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  iconColor = '#8B5CF6',
  gradient = false,
  colors = ['#8B5CF6', '#A855F7'] as const,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  animationType = 'fade',
  delay = 0,
  shadow = true,
  border = false,
  borderColor = '#E5E7EB',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    const animate = () => {
      switch (animationType) {
        case 'fade':
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }).start();
          break;
        case 'slide':
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            delay,
            useNativeDriver: true,
          }).start();
          break;
        case 'scale':
          Animated.spring(scaleAnim, {
            toValue: 1,
            delay,
            useNativeDriver: true,
          }).start();
          break;
        default:
          break;
      }
    };

    animate();
  }, [fadeAnim, slideAnim, scaleAnim, animationType, delay]);

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'fade':
        return { opacity: fadeAnim };
      case 'slide':
        return { transform: [{ translateY: slideAnim }] };
      case 'scale':
        return { transform: [{ scale: scaleAnim }] };
      default:
        return {};
    }
  };

  const cardStyle = [
    styles.card,
    {
      shadowColor: shadow ? '#000' : 'transparent',
      shadowOffset: shadow ? { width: 0, height: 2 } : { width: 0, height: 0 },
      shadowOpacity: shadow ? 0.1 : 0,
      shadowRadius: shadow ? 4 : 0,
      elevation: shadow ? 3 : 0,
      borderWidth: border ? 1 : 0,
      borderColor: border ? borderColor : 'transparent',
    },
    style,
  ];

  const renderHeader = () => {
    if (!title && !subtitle && !icon) return null;

    return (
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon as any} size={24} color={iconColor} />
          </View>
        )}
        <View style={styles.headerText}>
          {title && (
            <Text style={[styles.title, titleStyle]}>{title}</Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderContent = () => (
    <Animated.View style={getAnimatedStyle()}>
      {gradient ? (
        <LinearGradient
          colors={colors}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderHeader()}
          <View style={styles.content}>{children}</View>
        </LinearGradient>
      ) : (
        <View style={cardStyle}>
          {renderHeader()}
          <View style={styles.content}>{children}</View>
        </View>
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
});

export default AnimatedCard;
