import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/styles/simpleTheme';

interface InstructionsListProps {
  steps: string[];
  completedSteps?: number[];
}

const InstructionsList: React.FC<InstructionsListProps> = ({
  steps,
  completedSteps = [],
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="list" size={20} color={theme.colors.primary} />
        <Text style={styles.title}>Instructions</Text>
      </View>
      
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          return (
            <View key={index} style={styles.step}>
              <View style={[
                styles.stepNumber,
                isCompleted && styles.stepNumberCompleted
              ]}>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.stepText,
                isCompleted && styles.stepTextCompleted
              ]}>
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  stepsContainer: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberCompleted: {
    backgroundColor: theme.colors.success,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.gray,
  },
});

export default InstructionsList;
