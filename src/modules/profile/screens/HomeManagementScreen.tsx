import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '@/store/profileStore';
import { MemberCard } from '@/components/MemberCard';
import { FamilyMember } from '../types';

interface HomeManagementScreenProps {
    navigation: any;
}

export const HomeManagementScreen: React.FC<HomeManagementScreenProps> = ({ navigation }) => {
    const {
        familyHouse,
        currentUser,
        removeMember,
        transferAdmin,
        createInvitationCode,
        isAdmin,
        isSubAdmin,
    } = useProfileStore();

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [transferTarget, setTransferTarget] = useState<FamilyMember | null>(null);

    const isAdminOrSubAdmin = isAdmin() || isSubAdmin();

    const handleInviteMember = async () => {
        try {
            const invitation = await createInvitationCode();
            setGeneratedCode(invitation.code);
            setShowInviteModal(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to create invitation code');
        }
    };

    const handleRemoveMember = (member: FamilyMember) => {
        Alert.alert(
            'Remove Member',
            `Are you sure you want to remove ${member.name} from the house?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        removeMember(member.id).catch(error =>
                            Alert.alert('Error', error.message)
                        );
                    }
                }
            ]
        );
    };

    const handleTransferAdmin = (member: FamilyMember) => {
        Alert.alert(
            'Transfer Administration',
            `Are you sure you want to transfer admin rights to ${member.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Transfer',
                    style: 'destructive',
                    onPress: () => {
                        transferAdmin(member.id).catch(error =>
                            Alert.alert('Error', error.message)
                        );
                    }
                }
            ]
        );
    };

    const copyInvitationCode = () => {
        setGeneratedCode(null);
        setShowInviteModal(false);
        Alert.alert('Code Copied', 'Invitation code copied to clipboard! Share it with new members to join the house.');
    };

    const activeMembers = familyHouse?.members.filter(member => member.isActive) || [];
    const inactiveMembers = familyHouse?.members.filter(member => !member.isActive) || [];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED'] as unknown as readonly [string, string, ...string[]]}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{familyHouse?.houseName || 'Family House'}</Text>
                    <Text style={styles.headerSubtitle}>
                        {activeMembers.length} active member{activeMembers.length !== 1 ? 's' : ''}
                    </Text>
                </View>
            </LinearGradient>

            {/* Admin Controls */}
            {isAdminOrSubAdmin && (
                <View style={styles.adminControls}>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={handleInviteMember}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669'] as unknown as readonly [string, string, ...string[]]}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="person-add" size={20} color="#ffffff" />
                            <Text style={styles.buttonText}>Invite Member</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}

            {/* Active Members */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Members</Text>
                {activeMembers.map((member) => (
                    <MemberCard
                        key={member.id}
                        member={member}
                        currentUserId={currentUser?.id}
                        onRemove={isAdminOrSubAdmin ? () => handleRemoveMember(member) : undefined}
                        showRemoveButton={isAdminOrSubAdmin && member.role !== 'admin'}
                    />
                ))}
            </View>

            {/* Inactive Members */}
            {inactiveMembers.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Former Members</Text>
                    {inactiveMembers.map((member) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            currentUserId={currentUser?.id}
                        />
                    ))}
                </View>
            )}

            {/* Transfer Admin Button (Admin only) */}
            {isAdmin() && activeMembers.filter(m => m.role === 'sub-admin').length > 0 && (
                <View style={styles.transferSection}>
                    <Text style={styles.sectionTitle}>Administration</Text>
                    <TouchableOpacity
                        style={styles.transferButton}
                        onPress={() => {
                            const subAdmins = activeMembers.filter(m => m.role === 'sub-admin');
                            if (subAdmins.length === 1) {
                                handleTransferAdmin(subAdmins[0]);
                            } else {
                                // TODO: Show modal with sub-admin selection
                                Alert.alert('Select Sub-Admin', 'Multiple sub-admins available. Implementation needed.');
                            }
                        }}
                    >
                        <LinearGradient
                            colors={['#F59E0B', '#D97706'] as unknown as readonly [string, string, ...string[]]}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Ionicons name="swap-horizontal" size={20} color="#ffffff" />
                            <Text style={styles.buttonText}>Transfer Admin Rights</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}

            {/* Invitation Modal */}
            <Modal
                visible={showInviteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowInviteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Invitation Code</Text>
                        <View style={styles.codeContainer}>
                            <Text style={styles.generatedCode}>{generatedCode}</Text>
                        </View>
                        <Text style={styles.modalText}>
                            Share this code with new family members. They can use it to join your house.
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.copyButton]}
                                onPress={copyInvitationCode}
                            >
                                <Text style={styles.copyButtonText}>Copy Code</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowInviteModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        marginBottom: 16,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E5E7EB',
    },
    adminControls: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    controlButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    section: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    transferSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    transferButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 16,
    },
    codeContainer: {
        backgroundColor: '#1F2937',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    generatedCode: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#10B981',
        fontFamily: 'monospace',
    },
    modalText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    copyButton: {
        backgroundColor: '#10B981',
    },
    copyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '600',
    },
});




