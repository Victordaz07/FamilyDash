import React from 'react';
import { View, Text, Linking, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/styles/simpleTheme';

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: "How do I add family members?",
        answer: "Go to the Dashboard → tap 'Add Member' and send an invite link to your family members."
    },
    {
        question: "How can I backup my data?",
        answer: "Enable cloud sync in Settings → Cloud Backup → Connect Firebase or Supabase for automatic backups."
    },
    {
        question: "How do I create family goals?",
        answer: "Navigate to Tasks → tap 'Create New Task' → set your target and assign family members."
    },
    {
        question: "What is the Safe Room?",
        answer: "The Safe Room is a private space where family members can share emotions, thoughts, and support each other."
    },
    {
        question: "How do I manage tasks?",
        answer: "Go to Tasks → create new tasks → assign to family members → track progress together."
    },
    {
        question: "Can I use the app offline?",
        answer: "Yes! FamilyDash works offline and syncs your data when you're back online."
    }
];

export default function HelpScreen() {
    const navigation = useNavigation();

    const handleContactSupport = () => {
        const mailto = 'mailto:support@family-dash-15944.web.app?subject=FamilyDash Support Request';
        Linking.openURL(mailto).catch(() => {
            Alert.alert('Error', 'Could not open email client. Please email us at support@family-dash-15944.web.app');
        });
    };

    const handleOpenDocumentation = () => {
        const url = 'https://family-dash-15944.web.app/docs';
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open documentation. Please visit https://family-dash-15944.web.app/docs');
        });
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
                        <Text style={styles.headerTitle}>Help & FAQ</Text>
                        <Text style={styles.headerSubtitle}>Find answers to common questions</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <TouchableOpacity style={styles.quickActionButton} onPress={handleContactSupport}>
                        <LinearGradient
                            colors={['#4ade80', '#22c55e']}
                            style={styles.quickActionGradient}
                        >
                            <Ionicons name="mail" size={24} color="white" />
                            <Text style={styles.quickActionText}>Contact Support</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionButton} onPress={handleOpenDocumentation}>
                        <LinearGradient
                            colors={['#3b82f6', '#1d4ed8']}
                            style={styles.quickActionGradient}
                        >
                            <Ionicons name="document-text" size={24} color="white" />
                            <Text style={styles.quickActionText}>Documentation</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* FAQ Section */}
                <View style={styles.faqContainer}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                    {faqData.map((item, index) => (
                        <View key={index} style={styles.faqItem}>
                            <View style={styles.questionContainer}>
                                <Ionicons name="help-circle-outline" size={20} color="#667eea" />
                                <Text style={styles.questionText}>{item.question}</Text>
                            </View>
                            <Text style={styles.answerText}>{item.answer}</Text>
                        </View>
                    ))}
                </View>

                {/* Additional Help */}
                <View style={styles.additionalHelpContainer}>
                    <Text style={styles.sectionTitle}>Need More Help?</Text>
                    <Text style={styles.additionalHelpText}>
                        If you can't find what you're looking for, don't hesitate to contact our support team.
                        We're here to help make your family experience better!
                    </Text>

                    <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.contactButtonGradient}
                        >
                            <Ionicons name="chatbubbles" size={20} color="white" />
                            <Text style={styles.contactButtonText}>Get in Touch</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 30,
    },
    quickActionButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    quickActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    quickActionText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 14,
    },
    faqContainer: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 20,
    },
    faqItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    questionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginLeft: 8,
        flex: 1,
    },
    answerText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    additionalHelpContainer: {
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
    additionalHelpText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 20,
    },
    contactButton: {
        alignSelf: 'center',
    },
    contactButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
    },
    contactButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
});
