import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Simple test component to identify the issue
export const TestQuickActionsScreen: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quick Actions Test</Text>
            <Text style={styles.subtitle}>This is a test screen to identify the loading issue</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
});




