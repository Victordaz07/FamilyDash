import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FamilyMember {
    id: string;
    name: string;
    initials: string;
    isOnline: boolean;
    avatar?: string;
    role?: string;
}

interface FamilyAvatarGroupProps {
    members: FamilyMember[];
    maxVisible?: number;
    showCount?: boolean;
    onMemberPress?: (member: FamilyMember) => void;
    onAddMember?: () => void;
    size?: 'small' | 'medium' | 'large';
}

export const FamilyAvatarGroup: React.FC<FamilyAvatarGroupProps> = ({
    members,
    maxVisible = 4,
    showCount = true,
    onMemberPress,
    onAddMember,
    size = 'medium'
}) => {
    const visibleMembers = members.slice(0, maxVisible);
    const remainingCount = members.length - maxVisible;

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { avatarSize: 32, fontSize: 12, spacing: -8 };
            case 'large':
                return { avatarSize: 48, fontSize: 16, spacing: -12 };
            default:
                return { avatarSize: 40, fontSize: 14, spacing: -10 };
        }
    };

    const { avatarSize, fontSize, spacing } = getSizeStyles();

    const renderAvatar = (member: FamilyMember, index: number) => (
        <TouchableOpacity
            key={member.id}
            style={[
                styles.avatarContainer,
                {
                    width: avatarSize,
                    height: avatarSize,
                    marginLeft: index > 0 ? spacing : 0,
                }
            ]}
            onPress={() => onMemberPress?.(member)}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={member.isOnline ? ['#4ade80', '#22c55e'] : ['#e2e8f0', '#cbd5e1']}
                style={[
                    styles.avatar,
                    {
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                    }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={[styles.initials, { fontSize }]}>
                    {member.initials}
                </Text>
            </LinearGradient>

            {/* Online indicator */}
            {member.isOnline && (
                <View style={styles.onlineIndicator} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Family members */}
            <View style={styles.avatarsContainer}>
                {visibleMembers.map((member, index) => renderAvatar(member, index))}

                {/* Add member button */}
                {onAddMember && (
                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            {
                                width: avatarSize,
                                height: avatarSize,
                                marginLeft: visibleMembers.length > 0 ? spacing : 0,
                            }
                        ]}
                        onPress={onAddMember}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.addButtonBackground, { borderRadius: avatarSize / 2 }]}>
                            <Ionicons name="add" size={fontSize + 4} color="#667eea" />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Remaining count */}
                {remainingCount > 0 && showCount && (
                    <View
                        style={[
                            styles.countContainer,
                            {
                                width: avatarSize,
                                height: avatarSize,
                                marginLeft: spacing,
                            }
                        ]}
                    >
                        <LinearGradient
                            colors={['#f59e0b', '#d97706']}
                            style={[
                                styles.countBackground,
                                { borderRadius: avatarSize / 2 }
                            ]}
                        >
                            <Text style={[styles.countText, { fontSize }]}>
                                +{remainingCount}
                            </Text>
                        </LinearGradient>
                    </View>
                )}
            </View>

            {/* Family status */}
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                    {members.filter(m => m.isOnline).length > 0 && (
                        <Text style={styles.onlineText}>
                            {' • '}{members.filter(m => m.isOnline).length} online
                        </Text>
                    )}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    avatarsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    initials: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: 'white',
    },
    addButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonBackground: {
        backgroundColor: '#f8f9ff',
        borderWidth: 2,
        borderColor: '#667eea',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    countContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    countBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        color: 'white',
        fontWeight: '600',
    },
    statusContainer: {
        marginTop: 4,
    },
    statusText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    onlineText: {
        color: '#22c55e',
        fontWeight: '500',
    },
});

export default FamilyAvatarGroup;




