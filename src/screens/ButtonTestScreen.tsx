import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/simpleTheme';

interface TestButtonProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
}

const TestButton: React.FC<TestButtonProps> = ({ title, icon, onPress, color = theme.colors.primary }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, { borderColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.buttonText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const ButtonTestScreen: React.FC = () => {
  const handleTestAlert = () => {
    Alert.alert('Test', 'Button is working!');
  };

  const handleTestNavigation = () => {
    Alert.alert('Navigation', 'Navigation test - this would navigate to another screen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Button Test Screen</Text>
      <Text style={styles.subtitle}>Testing if buttons work correctly</Text>
      
      <View style={styles.buttonContainer}>
        <TestButton
          title="Test Alert"
          icon="checkmark-circle"
          onPress={handleTestAlert}
          color="#10B981"
        />
        
        <TestButton
          title="Test Navigation"
          icon="arrow-forward"
          onPress={handleTestNavigation}
          color="#3B82F6"
        />
        
        <TestButton
          title="Test Error"
          icon="warning"
          onPress={() => Alert.alert('Error Test', 'This is an error test')}
          color="#EF4444"
        />
        
        <TestButton
          title="Test Success"
          icon="trophy"
          onPress={() => Alert.alert('Success', 'This is a success test')}
          color="#F59E0B"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ButtonTestScreen;
