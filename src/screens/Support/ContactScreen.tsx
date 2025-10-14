import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Linking,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface ContactForm {
    name: string;
    email: string;
    subject: string;
    message: string;
    category: 'bug' | 'feature' | 'general' | 'feedback';
}

export default function ContactScreen() {
    const navigation = useNavigation();
    const [formData, setFormData] = useState<ContactForm>({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { key: 'bug', label: 'Bug Report', icon: 'bug-outline', color: ['#ef4444', '#dc2626'] },
        { key: 'feature', label: 'Feature Request', icon: 'bulb-outline', color: ['#f59e0b', '#d97706'] },
        { key: 'feedback', label: 'Feedback', icon: 'heart-outline', color: ['#ec4899', '#be185d'] },
        { key: 'general', label: 'General', icon: 'chatbubbles-outline', color: ['#6b7280', '#4b5563'] }
    ];

    const handleCategorySelect = (category: ContactForm['category']) => {
        setFormData(prev => ({ ...prev, category }));
    };

    const handleSend = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }
        if (!formData.email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        if (!formData.message.trim()) {
            Alert.alert('Error', 'Please write your message');
            return;
        }

        setIsSubmitting(true);

        try {
            const subject = `[${categories.find(c => c.key === formData.category)?.label}] ${formData.subject || 'FamilyDash Contact'}`;
            const body = `Name: ${formData.name}\nEmail: ${formData.email}\nCategory: ${categories.find(c => c.key === formData.category)?.label}\n\nMessage:\n${formData.message}`;

            const mailto = `mailto:support@family-dash-15944.web.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            await Linking.openURL(mailto);

            // Reset form after successful send
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
                category: 'general'
            });

            Alert.alert('Success', 'Your message has been prepared. Please send the email to complete your request.');
        } catch (error) {
            Alert.alert('Error', 'Could not open email client. Please email us directly at support@family-dash-15944.web.app');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleQuickContact = (type: 'bug' | 'feature' | 'feedback') => {
        const quickMessages = {
            bug: 'I found a bug in the app that I\'d like to report...',
            feature: 'I have an idea for a new feature that would improve the app...',
            feedback: 'I\'d like to share some feedback about my experience with FamilyDash...'
        };

        setFormData(prev => ({
            ...prev,
            category: type,
            message: quickMessages[type]
        }));
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Contact Support</Text>
                        <Text style={styles.headerSubtitle}>We're here to help and listen</Text>
                    </View>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                style={styles.content}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Quick Contact Options */}
                    <View style={styles.quickContactContainer}>
                        <Text style={styles.sectionTitle}>Quick Contact</Text>
                        <View style={styles.quickContactButtons}>
                            <TouchableOpacity
                                style={styles.quickContactButton}
                                onPress={() => handleQuickContact('bug')}
                            >
                                <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.quickContactGradient}>
                                    <Ionicons name="bug-outline" size={20} color="white" />
                                    <Text style={styles.quickContactText}>Report Bug</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickContactButton}
                                onPress={() => handleQuickContact('feature')}
                            >
                                <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.quickContactGradient}>
                                    <Ionicons name="bulb-outline" size={20} color="white" />
                                    <Text style={styles.quickContactText}>Request Feature</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.quickContactButton}
                                onPress={() => handleQuickContact('feedback')}
                            >
                                <LinearGradient colors={['#ec4899', '#be185d']} style={styles.quickContactGradient}>
                                    <Ionicons name="heart-outline" size={20} color="white" />
                                    <Text style={styles.quickContactText}>Share Feedback</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Contact Form */}
                    <View style={styles.formContainer}>
                        <Text style={styles.sectionTitle}>Contact Form</Text>

                        {/* Category Selection */}
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.categoryContainer}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.key}
                                    style={[
                                        styles.categoryButton,
                                        formData.category === category.key && styles.categoryButtonSelected
                                    ]}
                                    onPress={() => handleCategorySelect(category.key as ContactForm['category'])}
                                >
                                    <LinearGradient
                                        colors={formData.category === category.key ? category.color : ['#f1f5f9', '#e2e8f0']}
                                        style={styles.categoryGradient}
                                    >
                                        <Ionicons
                                            name={category.icon as any}
                                            size={16}
                                            color={formData.category === category.key ? 'white' : '#64748b'}
                                        />
                                        <Text style={[
                                            styles.categoryText,
                                            formData.category === category.key && styles.categoryTextSelected
                                        ]}>
                                            {category.label}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Name Input */}
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your full name"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        />

                        {/* Email Input */}
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {/* Subject Input */}
                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Brief description of your message"
                            value={formData.subject}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, subject: text }))}
                        />

                        {/* Message Input */}
                        <Text style={styles.label}>Message *</Text>
                        <TextInput
                            style={[styles.input, styles.messageInput]}
                            placeholder="Tell us how we can help you..."
                            value={formData.message}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />

                        {/* Send Button */}
                        <TouchableOpacity
                            style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={isSubmitting ? ['#94a3b8', '#64748b'] : ['#667eea', '#764ba2']}
                                style={styles.sendButtonGradient}
                            >
                                <Ionicons
                                    name={isSubmitting ? "hourglass-outline" : "send"}
                                    size={20}
                                    color="white"
                                />
                                <Text style={styles.sendButtonText}>
                                    {isSubmitting ? 'Preparing...' : 'Send Message'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Alternative Contact Methods */}
                    <View style={styles.alternativeContactContainer}>
                        <Text style={styles.sectionTitle}>Other Ways to Reach Us</Text>

                        <TouchableOpacity
                            style={styles.alternativeButton}
                            onPress={() => Linking.openURL('mailto:support@family-dash-15944.web.app')}
                        >
                            <View style={styles.alternativeButtonContent}>
                                <Ionicons name="mail" size={24} color="#667eea" />
                                <View style={styles.alternativeButtonText}>
                                    <Text style={styles.alternativeButtonTitle}>Email Support</Text>
                                    <Text style={styles.alternativeButtonSubtitle}>support@family-dash-15944.web.app</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.alternativeButton}
                            onPress={() => Linking.openURL('https://family-dash-15944.web.app/docs')}
                        >
                            <View style={styles.alternativeButtonContent}>
                                <Ionicons name="document-text" size={24} color="#667eea" />
                                <View style={styles.alternativeButtonText}>
                                    <Text style={styles.alternativeButtonTitle}>Documentation</Text>
                                    <Text style={styles.alternativeButtonSubtitle}>family-dash-15944.web.app/docs</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    quickContactContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 15,
    },
    quickContactButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickContactButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    quickContactGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    quickContactText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 12,
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        marginTop: 16,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    categoryButton: {
        flex: 1,
        minWidth: '45%',
    },
    categoryButtonSelected: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    categoryGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
        color: '#64748b',
    },
    categoryTextSelected: {
        color: 'white',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f8fafc',
        color: '#1e293b',
    },
    messageInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    sendButton: {
        marginTop: 20,
    },
    sendButtonDisabled: {
        opacity: 0.7,
    },
    sendButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    sendButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    alternativeContactContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    alternativeButton: {
        marginBottom: 12,
    },
    alternativeButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    alternativeButtonText: {
        marginLeft: 12,
        flex: 1,
    },
    alternativeButtonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    alternativeButtonSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
});
