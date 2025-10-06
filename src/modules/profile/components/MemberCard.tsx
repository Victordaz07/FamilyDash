import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FamilyMember } from '../types';

interface MemberCardProps {
    member: FamilyMember;
    currentUserId?: string;
    onPress?: () => void;
    onRemove?: () => void;
    showRemoveButton?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
    member,
    currentUserId,
    onPress,
    onRemove,
    showRemoveButton = false,
}) => {
    const getRoleColor = (role: FamilyMember['role']) => {
        switch (role) {
            case 'admin':
                return ['#8B5CF6', '#7C3AED']; // Purple
            case 'sub-admin':
                return ['#3B82F6', '#2563EB']; // Blue
            case 'child':
                return ['#10B981', '#059669']; // Green
            default:
                return ['#6B7280', '#4B5563']; // Gray
        }
    };

    const getRoleIcon = (role: FamilyMember['role']) => {
        switch (role) {
            case 'admin':
                return 'star';
            case 'sub-admin':
                return 'person-circle';
            case 'child':
                return 'happy';
            default:
                return 'person';
        }
    };

    const getRoleLabel = (role: FamilyMember['role']) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'sub-admin':
                return 'Sub-Admin';
            case 'child':
                return 'Child';
            default:
                return 'Member';
        }
    };

    const isCurrentUser = member.id === currentUserId;
    const canRemove = showRemoveButton && !isCurrentUser && member.role !== 'admin';

    return (
        <TouchableOpacity
            style={[styles.card, isCurrentUser && styles.currentUserCard]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={getRoleColor(member.role) as unknown as readonly [string, string, ...string[]]}
                style={styles.statusGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={styles.statusBadge}>{getRoleLabel(member.role)}</Text>
            </LinearGradient>

            <View style={styles.memberInfo}>
                <View style={styles.avatarSection}>
                    <Text style={styles.avatar}>{member.avatar}</Text>
                    <View style={[
                        styles.onlineIndicator,
                        { backgroundColor: member.isOnline ? '#10B981' : '#6B7280' }
                    ]}>
                        <Text style={styles.statusDot} />
                    </View>
                </View>

                <View style={styles.detailsSection}>
                    <Text style={styles.memberName}>
                        {member.preferences?.showNickname && member.nickname ? member.nickname : member.name}
                    </Text>
                    {member.nickname && member.preferences?.showNickname && (
                        <Text style={styles.memberRealName}>{member.name}</Text>
                    )}
                    <Text style={styles.memberCode}>Code: {member.code}</Text>
                    {member.age && member.preferences?.showAge && (
                        <Text style={styles.memberAge}>{member.age} years old</Text>
                    )}
                    {member.email && member.preferences?.showEmail && (
                        <Text style={styles.memberEmail}>{member.email}</Text>
                    )}
                    {member.phone && member.preferences?.showPhone && (
                        <Text style={styles.memberPhone}>{member.phone}</Text>
                    )}
                    {member.bio && (
                        <Text style={styles.memberBio} numberOfLines={2}>{member.bio}</Text>
                    )}

                    <View style={styles.permissionsSection}>
                        <Text style={styles.permissionsLabel}>Permissions:</Text>
                        <View style={styles.permissionsList}>
                            {member.permissions.slice(0, 3).map((permission, index) => (
                                <Text key={index} style={styles.permissionTag}>
                                    {permission.split(':')[0]}
                                </Text>
                            ))}
                            {member.permissions.length > 3 && (
                                <Text style={styles.permissionTag}>
                                    +{member.permissions.length - 3}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.actionsSection}>
                    <Ionicons
                        name={getRoleIcon(member.role) as any}
                        size={24}
                        color={member.isOnline ? '#10B981' : '#6B7280'}
                    />

                    {canRemove && (
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={onRemove}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="remove-circle" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isCurrentUser && (
                <View style={styles.currentUserBadge}>
                    <Text style={styles.currentUserText}>You</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginVertical: 6,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    currentUserCard: {
        borderColor: '#8B5CF6',
        borderWidth: 2,
    },
    statusGradient: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    statusBadge: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarSection: {
        alignItems: 'center',
        marginRight: 16,
    },
    avatar: {
        fontSize: 32,
        marginBottom: 4,
    },
    onlineIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ffffff',
    },
    detailsSection: {
        flex: 1,
    },
    memberName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    memberCode: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    memberAge: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    memberRealName: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
        marginBottom: 2,
    },
    memberEmail: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    memberPhone: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 2,
    },
    memberBio: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    permissionsSection: {
        marginTop: 8,
    },
    permissionsLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    permissionsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    permissionTag: {
        backgroundColor: '#F3F4F6',
        color: '#374151',
        fontSize: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 4,
        marginBottom: 4,
    },
    actionsSection: {
        alignItems: 'center',
    },
    removeButton: {
        marginTop: 8,
    },
    currentUserBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    currentUserText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
});
