import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useProfileStore } from '@/store/profileStore';
import { FamilyMember } from '../types';

interface JoinHouseScreenProps {
    navigation: any;
}

export const JoinHouseScreen: React.FC<JoinHouseScreenProps> = ({ navigation }) => {
    const { useInvitationCode, familyHouse } = useProfileStore();

    const [invitationCode, setInvitationCode] = useState('');
    const [newMemberData, setNewMemberData] = useState({
        name: '',
        email: '',
        age: '',
        role: 'child' as 'child' | 'sub-admin',
        avatar: '👤',
    });
    const [isLoading, setIsLoading] = useState(false);

    const avatarOptions = ['👤', '👩', '👨', '👧', '👦', '🧑', '👵', '👴', '🦸', '🦹'];

    const handleJoinHouse = async () => {
        if (!invitationCode.trim()) {
            Alert.alert('Error', 'Please enter an invitation code');
            return;
        }

        if (!newMemberData.name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        setIsLoading(true);

        try {
            const age = newMemberData.age ? parseInt(newMemberData.age) : undefined;
            const newMember = await useInvitationCode(invitationCode.trim().toUpperCase(), {
                ...newMemberData,
                age,
                role: newMemberData.role,
                email: newMemberData.email || undefined,
                permissions: [],
                isActive: true,
                preferences: {
                    showName: true,
                    showNickname: true,
                    showAge: true,
                    showEmail: false,
                    showPhone: false
                }
            });

            if (newMember) {
                Alert.alert(
                    'Success!',
                    `Welcome to ${familyHouse?.houseName || 'the family'}, ${newMember.name}!`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('HomeManagement'),
                        }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to join house');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateHouse = async () => {
        if (!newMemberData.name.trim()) {
            Alert.alert('Error', 'Please enter your name to create the house');
            return;
        }

        Alert.alert(
            'Create New House',
            'Are you sure you want to create a new house and become the administrator?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Create',
                    onPress: async () => {
                        try {
                            const age = newMemberData.age ? parseInt(newMemberData.age) : undefined;
                            const newAdmin: FamilyMember = {
                                id: useProfileStore.getState().generateUniqueId(),
                                code: `${String(Math.floor(Math.random() * 9000) + 1000)}NEW`,
                                name: newMemberData.name.trim(),
                                role: 'admin',
                                email: newMemberData.email.trim() || undefined,
                                age,
                                avatar: newMemberData.avatar,
                                permissions: ['tasks:manage', 'penalties:manage', 'calendar:manage', 'family:manage', 'members:manage', 'settings:manage'],
                                isActive: true,
                                joinedAt: new Date(),
                                isOnline: true,
                                preferences: {
                                    showName: true,
                                    showNickname: true,
                                    showAge: true,
                                    showEmail: false,
                                    showPhone: false
                                }
                            };

                            const houseName = `${newAdmin.name}'s Family House`;
                            await useProfileStore.getState().createHouse(houseName, newAdmin);

                            Alert.alert(
                                'Success',
                                `Welcome ${newAdmin.name}! Your house "${houseName}" has been created. You are now the administrator.`,
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.navigate('HomeManagement')
                                    }
                                ]
                            );
                        } catch (error) {
                            Alert.alert('Error', 'Failed to create house. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <LinearGradient
                    colors={['#10B981', '#059669'] as unknown as readonly [string, string, ...string[]]}
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
                        <Ionicons name="home" size={32} color="#ffffff" />
                        <Text style={styles.headerTitle}>Join Family House</Text>
                        <Text style={styles.headerSubtitle}>
                            Enter invitation code to join an existing family
                        </Text>
                    </View>
                </LinearGradient>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Invitation Code Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Invitation Code</Text>
                        <Text style={styles.sectionDescription}>
                            Ask a family member for the invitation code to join their house
                        </Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="key" size={20} color="#6B7280" />
                            <TextInput
                                style={styles.codeInput}
                                placeholder="Enter invitation code"
                                value={invitationCode}
                                onChangeText={setInvitationCode}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                autoComplete="off"
                            />
                        </View>
                    </View>

                    {/* Personal Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Information</Text>
                        <Text style={styles.sectionDescription}>
                            Tell us about yourself for your family profile
                        </Text>

                        {/* Name Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="person" size={20} color="#6B7280" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Your name"
                                value={newMemberData.name}
                                onChangeText={(text) => setNewMemberData({ ...newMemberData, name: text })}
                            />
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail" size={20} color="#6B7280" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Email (optional)"
                                value={newMemberData.email}
                                onChangeText={(text) => setNewMemberData({ ...newMemberData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        </View>

                        {/* Age Input */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar" size={20} color="#6B7280" />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Age (optional)"
                                value={newMemberData.age}
                                onChangeText={(text) => setNewMemberData({ ...newMemberData, age: text })}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Avatar Selection */}
                        <View style={styles.avatarSection}>
                            <Text style={styles.avatarLabel}>Choose your avatar</Text>
                            <View style={styles.avatarGrid}>
                                {avatarOptions.map((avatar, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.avatarOption,
                                            newMemberData.avatar === avatar && styles.selectedAvatar
                                        ]}
                                        onPress={() => setNewMemberData({ ...newMemberData, avatar })}
                                    >
                                        <Text style={styles.avatarText}>{avatar}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Role Selection */}
                        <View style={styles.roleSection}>
                            <Text style={styles.roleLabel}>Your role in the family</Text>
                            <View style={styles.roleOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.roleOption,
                                        newMemberData.role === 'child' && styles.selectedRole
                                    ]}
                                    onPress={() => setNewMemberData({ ...newMemberData, role: 'child' })}
                                >
                                    <Ionicons
                                        name="happy"
                                        size={24}
                                        color={newMemberData.role === 'child' ? '#10B981' : '#6B7280'}
                                    />
                                    <Text style={[
                                        styles.roleText,
                                        newMemberData.role === 'child' && styles.selectedRoleText
                                    ]}>
                                        Child
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.roleOption,
                                        newMemberData.role === 'sub-admin' && styles.selectedRole
                                    ]}
                                    onPress={() => setNewMemberData({ ...newMemberData, role: 'sub-admin' })}
                                >
                                    <Ionicons
                                        name="person-circle"
                                        size={24}
                                        color={newMemberData.role === 'sub-admin' ? '#3B82F6' : '#6B7280'}
                                    />
                                    <Text style={[
                                        styles.roleText,
                                        newMemberData.role === 'sub-admin' && styles.selectedRoleText
                                    ]}>
                                        Parent/Guardian
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={styles.joinButton}
                            onPress={handleJoinHouse}
                            disabled={isLoading || !invitationCode.trim() || !newMemberData.name.trim()}
                        >
                            <LinearGradient
                                colors={
                                    !invitationCode.trim() || !newMemberData.name.trim() || isLoading
                                        ? ['#9CA3AF', '#6B7280']
                                        : ['#10B981', '#059669']
                                }
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="enter" size={20} color="#ffffff" />
                                <Text style={styles.buttonText}>
                                    {isLoading ? 'Joining...' : 'Join House'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={handleCreateHouse}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#7C3AED'] as unknown as readonly [string, string, ...string[]]}
                                style={styles.buttonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons name="add-circle" size={20} color="#ffffff" />
                                <Text style={styles.buttonText}>Create New House</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle" size={24} color="#3B82F6" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>About Family Houses</Text>
                                <Text style={styles.infoText}>
                                    • Family houses help you organize tasks, goals, and activities{'\n'}
                                    • Each member has different permissions based on their role{'\n'}
                                    • Parents can manage the house and invite new members{'\n'}
                                    • Children can complete tasks and track their progress{'\n'}
                                    • Admin: Full control, invitation codes, member management{'\n'}
                                    • Sub-Admin: Invite members, assign tasks, limited access{'\n'}
                                    • Child: Complete tasks, view family activities
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
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
        textAlign: 'center',
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    codeInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        marginLeft: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        marginLeft: 12,
    },
    avatarSection: {
        marginTop: 16,
    },
    avatarLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 12,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    avatarOption: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedAvatar: {
        borderColor: '#10B981',
        backgroundColor: '#D1FAE5',
    },
    avatarText: {
        fontSize: 20,
    },
    roleSection: {
        marginTop: 16,
    },
    roleLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 12,
    },
    roleOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    roleOption: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedRole: {
        borderColor: '#10B981',
        backgroundColor: '#D1FAE5',
    },
    roleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 8,
    },
    selectedRoleText: {
        color: '#10B981',
    },
    actionSection: {
        marginVertical: 32,
    },
    joinButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    createButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoSection: {
        marginTop: 24,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#EBF8FF',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    infoContent: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#1E40AF',
        lineHeight: 18,
    },
});
