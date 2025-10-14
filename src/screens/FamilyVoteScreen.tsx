import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function FamilyVoteScreen() {
    const navigation = useNavigation();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [duration, setDuration] = useState('24'); // hours

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, '']);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const startVote = () => {
        if (!question.trim()) {
            Alert.alert('Missing Question', 'Please enter a question for the vote');
            return;
        }

        const validOptions = options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            Alert.alert('Not Enough Options', 'Please provide at least 2 options');
            return;
        }

        Alert.alert(
            'Vote Created!',
            `"${question}" vote has been started for ${duration} hours`,
            [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient colors={['#3498db', '#2980b9']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Start Family Vote</Text>
                        <Text style={styles.headerSubtitle}>Make decisions together</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Form */}
            <View style={styles.form}>
                {/* Question Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>What's the question?</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="e.g., What movie should we watch tonight?"
                        placeholderTextColor="#999"
                        value={question}
                        onChangeText={setQuestion}
                        multiline
                    />
                </View>

                {/* Options */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Voting Options</Text>
                    {options.map((option, index) => (
                        <View key={index} style={styles.optionRow}>
                            <TextInput
                                style={styles.optionInput}
                                placeholder={`Option ${index + 1}`}
                                placeholderTextColor="#999"
                                value={option}
                                onChangeText={(value) => updateOption(index, value)}
                            />
                            {options.length > 2 && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => removeOption(index)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#e74c3c" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    {options.length < 6 && (
                        <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
                            <Ionicons name="add-circle-outline" size={20} color="#3498db" />
                            <Text style={styles.addOptionText}>Add Option</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Duration */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Vote Duration</Text>
                    <View style={styles.durationRow}>
                        <TextInput
                            style={styles.durationInput}
                            value={duration}
                            onChangeText={setDuration}
                            keyboardType="numeric"
                        />
                        <Text style={styles.durationLabel}>hours</Text>
                    </View>
                </View>

                {/* Start Vote Button */}
                <TouchableOpacity style={styles.startButton} onPress={startVote}>
                    <LinearGradient
                        colors={['#3498db', '#2980b9']}
                        style={styles.startButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="people" size={20} color="white" />
                        <Text style={styles.startButtonText}>Start Vote</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    header: {
        paddingVertical: 60,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: { fontSize: 24, color: '#fff', fontWeight: '800' },
    headerSubtitle: { fontSize: 14, color: '#EEE', marginTop: 4 },

    form: { padding: 20 },

    inputGroup: { marginBottom: 24 },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8
    },
    textInput: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#333',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        minHeight: 60,
        textAlignVertical: 'top',
    },

    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionInput: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#333',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    removeButton: {
        marginLeft: 8,
    },
    addOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    addOptionText: {
        color: '#3498db',
        fontWeight: '600',
        marginLeft: 8,
    },

    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    durationInput: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#333',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: 80,
        textAlign: 'center',
    },
    durationLabel: {
        fontSize: 16,
        color: '#666',
        marginLeft: 12,
    },

    startButton: {
        marginTop: 20,
        borderRadius: 25,
        overflow: 'hidden',
        elevation: 4,
    },
    startButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
});




