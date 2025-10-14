import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TaskManagementMock = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>📋 Task Management</Text>
            <Text style={styles.subtitle}>Firebase integration in progress...</Text>
            <Text style={styles.description}>
                This screen will be reactivated once Firebase authentication is verified.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        color: '#666',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        color: '#888',
        lineHeight: 20,
    },
});




