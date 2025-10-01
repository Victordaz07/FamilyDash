import { useState, useEffect } from 'react';
import {
    mockSafeRoomMessages,
    mockEmergencyContacts,
    mockSafetyTips,
    mockLocationShares,
    mockFamilyMembers,
    SafeRoomMessage,
    EmergencyContact,
    SafetyTip,
    LocationShare
} from '../mock/safeRoom';

export const useSafeRoom = () => {
    const [messages, setMessages] = useState<SafeRoomMessage[]>(mockSafeRoomMessages);
    const [emergencyContacts] = useState<EmergencyContact[]>(mockEmergencyContacts);
    const [safetyTips] = useState<SafetyTip[]>(mockSafetyTips);
    const [locationShares] = useState<LocationShare[]>(mockLocationShares);
    const [familyMembers] = useState(mockFamilyMembers);
    const [isEmergencyMode, setIsEmergencyMode] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const unread = messages.filter(message => !message.isRead).length;
        setUnreadCount(unread);
    }, [messages]);

    // Message functions
    const sendMessage = (message: Omit<SafeRoomMessage, 'id' | 'timestamp'>) => {
        const newMessage: SafeRoomMessage = {
            ...message,
            id: `message_${Date.now()}`,
            timestamp: 'now'
        };
        setMessages(prev => [newMessage, ...prev]);
    };

    const markMessageAsRead = (messageId: string) => {
        setMessages(prev =>
            prev.map(message =>
                message.id === messageId ? { ...message, isRead: true } : message
            )
        );
    };

    const markAllMessagesAsRead = () => {
        setMessages(prev =>
            prev.map(message => ({ ...message, isRead: true }))
        );
    };

    const deleteMessage = (messageId: string) => {
        setMessages(prev => prev.filter(message => message.id !== messageId));
    };

    // Emergency functions
    const triggerEmergencyMode = () => {
        setIsEmergencyMode(true);
        // In a real app, this would:
        // 1. Send emergency alerts to all family members
        // 2. Contact emergency services
        // 3. Share location with emergency contacts
        // 4. Record emergency details
    };

    const exitEmergencyMode = () => {
        setIsEmergencyMode(false);
    };

    const sendEmergencyAlert = (message: string, priority: 'high' | 'emergency' = 'emergency') => {
        const emergencyMessage: SafeRoomMessage = {
            id: `emergency_${Date.now()}`,
            author: 'Emergency System',
            authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/emergency.jpg',
            message: `🚨 EMERGENCY: ${message}`,
            timestamp: 'now',
            isEncrypted: false,
            type: 'emergency',
            isRead: false,
            priority
        };
        setMessages(prev => [emergencyMessage, ...prev]);
    };

    // Contact functions
    const addEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
        const newContact: EmergencyContact = {
            ...contact,
            id: `contact_${Date.now()}`
        };
        // In a real app, this would update the contacts list
        console.log('New emergency contact added:', newContact);
    };

    const callEmergencyContact = (contactId: string) => {
        const contact = emergencyContacts.find(c => c.id === contactId);
        if (contact) {
            // In a real app, this would initiate a phone call
            console.log(`Calling ${contact.name} at ${contact.phone}`);
        }
    };

    // Location functions
    const shareLocation = (memberId: string, location: string, coordinates?: { latitude: number; longitude: number }) => {
        const member = familyMembers.find(m => m.id === memberId);
        if (member) {
            const newLocationShare: LocationShare = {
                id: `location_${Date.now()}`,
                memberName: member.name,
                memberAvatar: member.avatar,
                location,
                timestamp: 'now',
                isActive: true,
                coordinates
            };
            // In a real app, this would update the location shares
            console.log('Location shared:', newLocationShare);
        }
    };

    const stopLocationShare = (locationId: string) => {
        // In a real app, this would stop sharing location
        console.log('Stopped sharing location:', locationId);
    };

    // Safety tip functions
    const markSafetyTipAsRead = (tipId: string) => {
        // In a real app, this would update the safety tip status
        console.log('Safety tip marked as read:', tipId);
    };

    const getUnreadSafetyTips = () => {
        return safetyTips.filter(tip => !tip.isRead);
    };

    // Family member functions
    const updateFamilyMemberStatus = (memberId: string, isOnline: boolean) => {
        // In a real app, this would update the family member's online status
        console.log(`Family member ${memberId} is now ${isOnline ? 'online' : 'offline'}`);
    };

    // Get filtered messages
    const getMessagesByPriority = (priority: 'low' | 'medium' | 'high' | 'emergency') => {
        return messages.filter(message => message.priority === priority);
    };

    const getEmergencyMessages = () => {
        return messages.filter(message => message.type === 'emergency' || message.priority === 'emergency');
    };

    const getUnreadMessages = () => {
        return messages.filter(message => !message.isRead);
    };

    // Get active location shares
    const getActiveLocationShares = () => {
        return locationShares.filter(share => share.isActive);
    };

    // Get online family members
    const getOnlineFamilyMembers = () => {
        return familyMembers.filter(member => member.isOnline);
    };

    // Statistics
    const getSafeRoomStats = () => {
        return {
            totalMessages: messages.length,
            unreadMessages: unreadCount,
            emergencyMessages: getEmergencyMessages().length,
            activeLocationShares: getActiveLocationShares().length,
            onlineMembers: getOnlineFamilyMembers().length,
            totalMembers: familyMembers.length,
            emergencyContacts: emergencyContacts.length,
            unreadSafetyTips: getUnreadSafetyTips().length
        };
    };

    return {
        messages,
        emergencyContacts,
        safetyTips,
        locationShares,
        familyMembers,
        isEmergencyMode,
        unreadCount,
        sendMessage,
        markMessageAsRead,
        markAllMessagesAsRead,
        deleteMessage,
        triggerEmergencyMode,
        exitEmergencyMode,
        sendEmergencyAlert,
        addEmergencyContact,
        callEmergencyContact,
        shareLocation,
        stopLocationShare,
        markSafetyTipAsRead,
        getUnreadSafetyTips,
        updateFamilyMemberStatus,
        getMessagesByPriority,
        getEmergencyMessages,
        getUnreadMessages,
        getActiveLocationShares,
        getOnlineFamilyMembers,
        getSafeRoomStats
    };
};
