import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RealAuthService } from '../services';

export const FirebaseTest = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const createAccount = async () => {
        setLoading(true);
        try {
            const result = await RealAuthService.registerWithEmail({
                email,
                password,
                displayName: email.split('@')[0]
            });

            if (result.success) {
                Alert.alert('Success', `Account created! User ID: ${result.user?.uid}`);
            } else {
                Alert.alert('Error', result.error || 'Registration failed');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    };

    const loginAccount = async () => {
        setLoading(true);
        try {
            const result = await RealAuthService.signInWithEmail({
                email,
                password
            });

            if (result.success) {
                Alert.alert('Success', `Logged in! User ID: ${result.user?.uid}`);
            } else {
                Alert.alert('Error', result.error || 'Login failed');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🔥 Firebase Test</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={createAccount}
                disabled={loading || !email || !password}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Loading...' : 'Create Account'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.loginButton]}
                onPress={loginAccount}
                disabled={loading || !email || !password}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        elevation: 2,
    },
    button: {
        backgroundColor: '#ff6b6b',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    loginButton: {
        backgroundColor: '#4ecdc4',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
