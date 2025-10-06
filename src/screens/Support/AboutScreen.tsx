import React from 'react';
import {
    View,
    Text,
    Linking,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

interface TeamMember {
    name: string;
    role: string;
    avatar: string;
    description: string;
}

interface Feature {
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string[];
}

const teamMembers: TeamMember[] = [
    {
        name: 'Victor Ruiz',
        role: 'Lead Developer',
        avatar: 'V',
        description: 'Full-stack developer passionate about family technology and user experience.'
    },
    {
        name: 'FamilyDash Team',
        role: 'Development Team',
        avatar: 'F',
        description: 'Dedicated developers working to make family life better through technology.'
    }
];

const features: Feature[] = [
    {
        title: 'Family Dashboard',
        description: 'Centralized view of family activities, goals, and progress',
        icon: 'home',
        color: ['#667eea', '#764ba2']
    },
    {
        title: 'Task Management',
        description: 'Organize and track family tasks with assignments and deadlines',
        icon: 'checkmark-circle',
        color: ['#4ade80', '#22c55e']
    },
    {
        title: 'Goal Tracking',
        description: 'Set and monitor family goals with visual progress indicators',
        icon: 'trophy',
        color: ['#f59e0b', '#d97706']
    },
    {
        title: 'Safe Room',
        description: 'Private space for family members to share emotions and thoughts',
        icon: 'heart',
        color: ['#ec4899', '#be185d']
    },
    {
        title: 'Calendar & Events',
        description: 'Coordinate family schedules and plan activities together',
        icon: 'calendar',
        color: ['#3b82f6', '#1d4ed8']
    },
    {
        title: 'Cloud Sync',
        description: 'Automatic backup and sync across all family devices',
        icon: 'cloud',
        color: ['#8b5cf6', '#7c3aed']
    }
];

export default function AboutScreen() {
    const navigation = useNavigation();

    const handleOpenWebsite = () => {
        const url = 'https://familydash.app';
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open website. Please visit https://familydash.app');
        });
    };

    const handleOpenPrivacy = () => {
        const url = 'https://familydash.app/privacy';
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open privacy policy. Please visit https://familydash.app/privacy');
        });
    };

    const handleOpenTerms = () => {
        const url = 'https://familydash.app/terms';
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open terms of service. Please visit https://familydash.app/terms');
        });
    };

    const handleOpenGitHub = () => {
        const url = 'https://github.com/familydash/familydash';
        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Could not open GitHub repository.');
        });
    };

    const handleRateApp = () => {
        // This would typically open the app store rating
        Alert.alert(
            'Rate FamilyDash',
            'We would love your feedback! Please rate us on the app store.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Rate Now', onPress: () => {
                        // Open app store rating
                        Alert.alert('Thank you!', 'Your rating helps us improve the app.');
                    }
                }
            ]
        );
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
                        <Text style={styles.headerTitle}>About FamilyDash</Text>
                        <Text style={styles.headerSubtitle}>Connecting families through technology</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* App Info */}
                <View style={styles.appInfoContainer}>
                    <View style={styles.appIconContainer}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.appIcon}
                        >
                            <Text style={styles.appIconText}>F</Text>
                        </LinearGradient>
                    </View>

                    <Text style={styles.appName}>FamilyDash</Text>
                    <Text style={styles.appVersion}>Version {Constants.expoConfig?.version || '1.0.0'}</Text>
                    <Text style={styles.appDescription}>
                        A comprehensive family management app designed to strengthen bonds,
                        organize activities, and create meaningful connections within your family.
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <Text style={styles.sectionTitle}>Key Features</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <View key={index} style={styles.featureCard}>
                                <LinearGradient
                                    colors={feature.color}
                                    style={styles.featureIconContainer}
                                >
                                    <Ionicons name={feature.icon} size={24} color="white" />
                                </LinearGradient>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Team */}
                <View style={styles.teamContainer}>
                    <Text style={styles.sectionTitle}>Our Team</Text>
                    {teamMembers.map((member, index) => (
                        <View key={index} style={styles.teamMemberCard}>
                            <View style={styles.memberAvatarContainer}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={styles.memberAvatar}
                                >
                                    <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                                </LinearGradient>
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <Text style={styles.memberRole}>{member.role}</Text>
                                <Text style={styles.memberDescription}>{member.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleOpenWebsite}>
                        <LinearGradient
                            colors={['#4ade80', '#22c55e']}
                            style={styles.actionButtonGradient}
                        >
                            <Ionicons name="globe" size={20} color="white" />
                            <Text style={styles.actionButtonText}>Visit Website</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleOpenGitHub}>
                        <LinearGradient
                            colors={['#6b7280', '#4b5563']}
                            style={styles.actionButtonGradient}
                        >
                            <Ionicons name="logo-github" size={20} color="white" />
                            <Text style={styles.actionButtonText}>View Source</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleRateApp}>
                        <LinearGradient
                            colors={['#f59e0b', '#d97706']}
                            style={styles.actionButtonGradient}
                        >
                            <Ionicons name="star" size={20} color="white" />
                            <Text style={styles.actionButtonText}>Rate App</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Legal Links */}
                <View style={styles.legalContainer}>
                    <Text style={styles.sectionTitle}>Legal</Text>
                    <View style={styles.legalButtons}>
                        <TouchableOpacity style={styles.legalButton} onPress={handleOpenPrivacy}>
                            <Text style={styles.legalButtonText}>Privacy Policy</Text>
                            <Ionicons name="chevron-forward" size={16} color="#667eea" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.legalButton} onPress={handleOpenTerms}>
                            <Text style={styles.legalButtonText}>Terms of Service</Text>
                            <Ionicons name="chevron-forward" size={16} color="#667eea" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>
                        Made with ❤️ by the FamilyDash Team
                    </Text>
                    <Text style={styles.footerSubtext}>
                        © 2024 FamilyDash. All rights reserved.
                    </Text>
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
    appInfoContainer: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 30,
        marginTop: 20,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    appIconContainer: {
        marginBottom: 20,
    },
    appIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appIconText: {
        fontSize: 36,
        fontWeight: '700',
        color: 'white',
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    appVersion: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 16,
    },
    appDescription: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    featuresContainer: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 20,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    featureCard: {
        width: (width - 60) / 2,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    featureDescription: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 16,
    },
    teamContainer: {
        marginBottom: 30,
    },
    teamMemberCard: {
        flexDirection: 'row',
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
    memberAvatarContainer: {
        marginRight: 16,
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberAvatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: 'white',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    memberRole: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '500',
        marginBottom: 8,
    },
    memberDescription: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 16,
    },
    actionsContainer: {
        marginBottom: 30,
    },
    actionButton: {
        marginBottom: 12,
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    legalContainer: {
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
    legalButtons: {
        gap: 12,
    },
    legalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    legalButtonText: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '500',
    },
    footerContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
