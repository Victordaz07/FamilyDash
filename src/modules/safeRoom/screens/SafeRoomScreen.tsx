import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRoom } from '../hooks/useSafeRoom';

interface SafeRoomScreenProps {
    navigation: any;
}

const SafeRoomScreen: React.FC<SafeRoomScreenProps> = ({ navigation }) => {
    const {
        feelings,
        resources,
        solutionNotes,
        familyMembers,
        activeTab: safeRoomTab,
        selectedMood,
        newFeelingText,
        isRecording,
        setActiveTab: setSafeRoomTab,
        setSelectedMood,
        setNewFeelingText,
        getFeelingsByMood,
        getRecentFeelings,
        getResourcesByCategory,
        getActiveSolutionNotes,
        getCompletedSolutionNotes,
        getStatistics,
        addFeeling,
        addReaction,
        addSolutionNote,
        toggleSolutionNote,
        deleteSolutionNote,
        startRecording,
        stopRecording,
        moodEmojis,
        moodColors
    } = useSafeRoom();

    // Mock data for emergency features (to be implemented later)
    const messages: any[] = [];
    const emergencyContacts: any[] = [];
    const safetyTips: any[] = [];
    const locationShares: any[] = [];
    const isEmergencyMode = false;
    const unreadCount = 0;

    // Mock functions for emergency features (to be implemented later)
    const sendEmergencyAlert = () => {
        Alert.alert('Emergency Alert', 'Emergency alert functionality will be implemented soon');
    };

    const callEmergencyContact = (contact: any) => {
        Alert.alert('Call Emergency Contact', `Calling ${contact?.name || 'emergency contact'}...`);
    };

    const markMessageAsRead = (message: any) => {
        console.log('Mark message as read:', message);
    };

    const markAllMessagesAsRead = () => {
        console.log('Mark all messages as read');
    };

    const triggerEmergencyMode = () => {
        Alert.alert('Emergency Mode', 'Emergency mode will be implemented soon');
    };

    const exitEmergencyMode = () => {
        Alert.alert('Exit Emergency Mode', 'Exiting emergency mode');
    };

    const getSafeRoomStats = () => {
        return {
            totalMessages: 0,
            unreadCount: 0,
            activeContacts: 0,
            onlineMembers: getOnlineFamilyMembers().length,
            activeLocationShares: locationShares.length,
            unreadMessages: messages.filter((m: any) => !m.isRead).length,
            emergencyContacts: emergencyContacts.length
        };
    };

    const getUnreadMessages = () => {
        return [];
    };

    const getActiveLocationShares = () => {
        return [];
    };

    const getOnlineFamilyMembers = () => {
        return familyMembers.filter((member: any) => member.isOnline || true); // Mock: assume all online
    };

    const getUnreadSafetyTips = () => {
        return [];
    };

    const [activeTab, setActiveTab] = useState<'messages' | 'contacts' | 'tips' | 'locations'>('messages');

    const handleBack = () => {
        navigation.goBack();
    };

    const handleEmergencyCall = () => {
        Alert.alert(
            'Emergency Call',
            'This will call emergency services. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Call 911',
                    style: 'destructive',
                    onPress: () => {
                        Linking.openURL('tel:911');
                        sendEmergencyAlert();
                    }
                }
            ]
        );
    };

    const handleEmergencyMode = () => {
        if (isEmergencyMode) {
            Alert.alert(
                'Exit Emergency Mode',
                'Are you sure you want to exit emergency mode?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Exit', onPress: exitEmergencyMode }
                ]
            );
        } else {
            Alert.alert(
                'Trigger Emergency Mode',
                'This will alert all family members and emergency contacts. Continue?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Trigger', style: 'destructive', onPress: triggerEmergencyMode }
                ]
            );
        }
    };

    const handleCallContact = (contactId: string) => {
        const contact = emergencyContacts.find(c => c.id === contactId);
        if (contact) {
            Alert.alert(
                'Call Contact',
                `Call ${contact.name} at ${contact.phone}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Call',
                        onPress: () => {
                            Linking.openURL(`tel:${contact.phone}`);
                            callEmergencyContact(contactId);
                        }
                    }
                ]
            );
        }
    };

    const handleMessagePress = (messageId: string) => {
        markMessageAsRead(messageId);
    };

    const handleMarkAllRead = () => {
        markAllMessagesAsRead();
        Alert.alert('Success', 'All messages marked as read');
    };

    const stats = getSafeRoomStats();
    const unreadMessages = getUnreadMessages();
    const activeLocationShares = getActiveLocationShares();
    const onlineMembers = getOnlineFamilyMembers();
    const unreadSafetyTips = getUnreadSafetyTips();

    const getPriorityColor = (priority: string) => {
        const colors = {
            'low': '#10B981',
            'medium': '#F59E0B',
            'high': '#EF4444',
            'emergency': '#DC2626'
        };
        return colors[priority as keyof typeof colors] || '#6B7280';
    };

    const getPriorityIcon = (priority: string) => {
        const icons = {
            'low': 'checkmark-circle',
            'medium': 'warning',
            'high': 'alert-circle',
            'emergency': 'alert'
        };
        return icons[priority as keyof typeof icons] || 'information-circle';
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={isEmergencyMode ? ['#DC2626', '#B91C1C'] : ['#EC4899', '#DB2777']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>
                            {isEmergencyMode ? '🚨 EMERGENCY MODE' : 'Safe Room'}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {isEmergencyMode ? 'Emergency protocols active' : 'Family safety hub'}
                        </Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => {
                                Alert.alert('New Message', 'Create new safe message functionality coming soon');
                            }}
                        >
                            <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.headerButton, isEmergencyMode && styles.emergencyButton]}
                            onPress={handleEmergencyMode}
                        >
                            <Ionicons name={isEmergencyMode ? "stop" : "warning"} size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Emergency Banner */}
            {isEmergencyMode && (
                <View style={styles.emergencyBanner}>
                    <Ionicons name="warning" size={24} color="white" />
                    <Text style={styles.emergencyBannerText}>
                        EMERGENCY MODE ACTIVE - All family members have been alerted
                    </Text>
                </View>
            )}

            {/* Stats Overview */}
            <View style={styles.statsSection}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Safety Overview</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.onlineMembers}</Text>
                            <Text style={styles.statLabel}>Online</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.activeLocationShares}</Text>
                            <Text style={styles.statLabel}>Locations</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.unreadMessages}</Text>
                            <Text style={styles.statLabel}>Unread</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.emergencyContacts}</Text>
                            <Text style={styles.statLabel}>Contacts</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleEmergencyCall}>
                            <Ionicons name="call" size={24} color="white" />
                            <Text style={styles.quickActionText}>Call 911</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton} onPress={() => setActiveTab('contacts')}>
                            <Ionicons name="people" size={24} color="white" />
                            <Text style={styles.quickActionText}>Contacts</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton} onPress={() => setActiveTab('locations')}>
                            <Ionicons name="location" size={24} color="white" />
                            <Text style={styles.quickActionText}>Locations</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton} onPress={() => setActiveTab('tips')}>
                            <Ionicons name="shield-checkmark" size={24} color="white" />
                            <Text style={styles.quickActionText}>Safety Tips</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsSection}>
                <View style={styles.card}>
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
                            onPress={() => setActiveTab('messages')}
                        >
                            <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>
                                Messages {unreadCount > 0 && `(${unreadCount})`}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
                            onPress={() => setActiveTab('contacts')}
                        >
                            <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
                                Contacts
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'tips' && styles.activeTab]}
                            onPress={() => setActiveTab('tips')}
                        >
                            <Text style={[styles.tabText, activeTab === 'tips' && styles.activeTabText]}>
                                Tips {unreadSafetyTips.length > 0 && `(${unreadSafetyTips.length})`}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'locations' && styles.activeTab]}
                            onPress={() => setActiveTab('locations')}
                        >
                            <Text style={[styles.tabText, activeTab === 'locations' && styles.activeTabText]}>
                                Locations
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Content based on active tab */}
            {activeTab === 'messages' && (
                <View style={styles.messagesSection}>
                    <View style={styles.card}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Safe Messages</Text>
                            {unreadCount > 0 && (
                                <TouchableOpacity onPress={handleMarkAllRead}>
                                    <Text style={styles.markAllReadText}>Mark All Read</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {messages.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
                                <Text style={styles.emptyStateText}>No messages</Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Safe room messages will appear here
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.messagesList}>
                                {messages.map((message: any) => (
                                    <TouchableOpacity
                                        key={message.id}
                                        style={[
                                            styles.messageItem,
                                            !message.isRead && styles.unreadMessage,
                                            message.priority === 'emergency' && styles.emergencyMessage
                                        ]}
                                        onPress={() => handleMessagePress(message.id)}
                                    >
                                        <View style={styles.messageHeader}>
                                            <View style={styles.messageAuthor}>
                                                <View style={styles.authorAvatar}>
                                                    <Text style={styles.authorInitial}>
                                                        {message.author.charAt(0)}
                                                    </Text>
                                                </View>
                                                <View style={styles.messageInfo}>
                                                    <Text style={styles.authorName}>{message.author}</Text>
                                                    <Text style={styles.messageTime}>{message.timestamp}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.messagePriority}>
                                                <Ionicons
                                                    name={getPriorityIcon(message.priority) as any}
                                                    size={16}
                                                    color={getPriorityColor(message.priority)}
                                                />
                                            </View>
                                        </View>
                                        <Text style={styles.messageText}>{message.message}</Text>
                                        {message.isEncrypted && (
                                            <View style={styles.encryptedBadge}>
                                                <Ionicons name="lock-closed" size={12} color="#10B981" />
                                                <Text style={styles.encryptedText}>Encrypted</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            )}

            {activeTab === 'contacts' && (
                <View style={styles.contactsSection}>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                        <View style={styles.contactsList}>
                            {emergencyContacts.map((contact: any) => (
                                <TouchableOpacity
                                    key={contact.id}
                                    style={styles.contactItem}
                                    onPress={() => handleCallContact(contact.id)}
                                >
                                    <View style={styles.contactAvatar}>
                                        <Text style={styles.contactInitial}>
                                            {contact.name.charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={styles.contactInfo}>
                                        <Text style={styles.contactName}>{contact.name}</Text>
                                        <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                                        <Text style={styles.contactPhone}>{contact.phone}</Text>
                                    </View>
                                    <View style={styles.contactActions}>
                                        {contact.isPrimary && (
                                            <View style={styles.primaryBadge}>
                                                <Text style={styles.primaryText}>PRIMARY</Text>
                                            </View>
                                        )}
                                        <TouchableOpacity style={styles.callButton}>
                                            <Ionicons name="call" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {activeTab === 'tips' && (
                <View style={styles.tipsSection}>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Safety Tips</Text>
                        <View style={styles.tipsList}>
                            {safetyTips.map((tip: any) => (
                                <View key={tip.id} style={styles.tipItem}>
                                    <View style={[styles.tipIcon, { backgroundColor: tip.color }]}>
                                        <Ionicons name={tip.icon as any} size={20} color="white" />
                                    </View>
                                    <View style={styles.tipContent}>
                                        <Text style={styles.tipTitle}>{tip.title}</Text>
                                        <Text style={styles.tipDescription}>{tip.description}</Text>
                                    </View>
                                    {!tip.isRead && (
                                        <View style={styles.unreadDot} />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {activeTab === 'locations' && (
                <View style={styles.locationsSection}>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Family Locations</Text>
                        <View style={styles.locationsList}>
                            {locationShares.map((share: any) => (
                                <View key={share.id} style={styles.locationItem}>
                                    <View style={styles.locationAvatar}>
                                        <Text style={styles.locationInitial}>
                                            {share.memberName.charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={styles.locationInfo}>
                                        <Text style={styles.locationMember}>{share.memberName}</Text>
                                        <Text style={styles.locationPlace}>{share.location}</Text>
                                        <Text style={styles.locationTime}>{share.timestamp}</Text>
                                    </View>
                                    <View style={styles.locationStatus}>
                                        <View style={styles.onlineIndicator} />
                                        <Text style={styles.statusText}>Active</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emergencyButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    headerTitleContainer: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    emergencyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DC2626',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    emergencyBannerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
    },
    statsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#EC4899',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    quickActionsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#EC4899',
        marginHorizontal: 4,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
        marginTop: 4,
    },
    tabsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#374151',
        fontWeight: '600',
    },
    messagesSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    markAllReadText: {
        fontSize: 14,
        color: '#EC4899',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 4,
    },
    messagesList: {
        gap: 12,
    },
    messageItem: {
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderLeftWidth: 4,
        borderLeftColor: '#E5E7EB',
    },
    unreadMessage: {
        backgroundColor: '#FEF3C7',
        borderLeftColor: '#F59E0B',
    },
    emergencyMessage: {
        backgroundColor: '#FEF2F2',
        borderLeftColor: '#EF4444',
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    messageAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EC4899',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    authorInitial: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    messageInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    messageTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    messagePriority: {
        alignItems: 'center',
    },
    messageText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 8,
    },
    encryptedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    encryptedText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
    },
    contactsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    contactsList: {
        gap: 12,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    contactAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EC4899',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInitial: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    contactRelationship: {
        fontSize: 14,
        color: '#6B7280',
    },
    contactPhone: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    contactActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    primaryBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    primaryText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    tipsList: {
        gap: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        position: 'relative',
    },
    tipIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    tipDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    unreadDot: {
        position: 'absolute',
        top: 8,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EC4899',
    },
    locationsSection: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    locationsList: {
        gap: 12,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    locationAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    locationInitial: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    locationInfo: {
        flex: 1,
    },
    locationMember: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    locationPlace: {
        fontSize: 14,
        color: '#6B7280',
    },
    locationTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    locationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    onlineIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    statusText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
    },
    bottomSpacing: {
        height: 80,
    },
});

export default SafeRoomScreen;
