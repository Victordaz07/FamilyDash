import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface DeveloperModeProps {
  onToggle: () => void;
  isEnabled: boolean;
}

export const DeveloperModeToggle: React.FC<DeveloperModeProps> = ({ onToggle, isEnabled }) => {
  const [tapCount, setTapCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTapCount(0);
      setShowHint(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [tapCount]);

  const handleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);

    // Animate tap
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (newCount >= 5) {
      setShowHint(true);
      Alert.alert(
        'Developer Mode',
        'Developer mode activated! You can now access testing tools.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Activate', onPress: onToggle }
        ]
      );
      setTapCount(0);
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.tapArea}
        onPress={handleTap}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isEnabled ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
          style={styles.gradient}
        >
          <Ionicons 
            name={isEnabled ? "shield-checkmark" : "shield-outline"} 
            size={24} 
            color="white" 
          />
          <Text style={styles.text}>
            {isEnabled ? 'Dev Mode ON' : 'Tap 5x for Dev'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      
      {showHint && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Tap 5 times to activate developer mode</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  tapArea: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  hintContainer: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: 150,
  },
  hintText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
});
