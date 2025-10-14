import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ScrollView,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface FamilyMember {
    id: string;
    name: string;
    role: 'parent' | 'child' | 'guardian' | 'other';
    email?: string;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    joinDate: string;
}

const roleOptions = [
    { key: 'parent', label: 'Parent', icon: 'people', color: ['#667eea', '#764ba2'] },
    { key: 'child', label: 'Child', icon: 'happy', color: ['#4ade80', '#22c55e'] },
    { key: 'guardian', label: 'Guardian', icon: 'shield-checkmark', color: ['#f59e0b', '#d97706'] },
    { key: 'other', label: 'Other', icon: 'person', color: ['#6b7280', '#4b5563'] }
];

export default function FamilyScreen() {
    const navigation = useNavigation();
    const [members, setMembers] = useState<FamilyMember[]>([]);

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [newMember, setNewMember] = useState({
        name: '',
        role: 'other' as FamilyMember['role'],
        email: '',
        phone: ''
    });

    const getRoleConfig = (role: FamilyMember['role']) => {
        return roleOptions.find(r => r.key === role) || roleOptions[3];
    };

    const addMember = () => {
        if (!newMember.name.trim()) {
            Alert.alert('Error', 'Please enter a name for the family member');
            return;
        }

        const member: FamilyMember = {
            id: Date.now().toString(),
            name: newMember.name.trim(),
            role: newMember.role,
            email: newMember.email.trim() || undefined,
            phone: newMember.phone.trim() || undefined,
            isActive: true,
            joinDate: new Date().toISOString().split('T')[0]
        };

        setMembers([...members, member]);
        setNewMember({ name: '', role: 'other', email: '', phone: '' });
        setIsAddModalVisible(false);

        Alert.alert('Success', `${member.name} has been added to the family!`);
    };

    const removeMember = (id: string) => {
        const member = members.find(m => m.id === id);
        Alert.alert(
            'Remove Family Member',
            `Are you sure you want to remove ${member?.name} from the family?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setMembers(members.filter(m => m.id !== id));
                        Alert.alert('Removed', `${member?.name} has been removed from the family`);
                    }
                }
            ]
        );
    };

    const toggleMemberStatus = (id: string) => {
        setMembers(members.map(member =>
            member.id === id
                ? { ...member, isActive: !member.isActive }
                : member
        ));
    };

    const renderMember = ({ item }: { item: FamilyMember }) => {
        const roleConfig = getRoleConfig(item.role);

        return (
            <View style={styles.memberCard}>
                <View style={styles.memberHeader}>
                    <View style={styles.memberInfo}>
                        <View style={styles.avatarContainer}>
                            <LinearGradient
                                colors={roleConfig.color}
                                style={styles.memberAvatar}
                            >
                                <Ionicons name={roleConfig.icon as any} size={24} color="white" />
                            </LinearGradient>
                            <View style={[styles.statusIndicator, {
                                backgroundColor: item.isActive ? '#22c55e' : '#ef4444'
                            }]} />
                        </View>
                        <View style={styles.memberDetails}>
                            <Text style={styles.memberName}>{item.name}</Text>
                            <Text style={styles.memberRole}>{roleConfig.label}</Text>
                            {item.email && (
                                <Text style={styles.memberEmail}>{item.email}</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.memberActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => toggleMemberStatus(item.id)}
                        >
                            <Ionicons
                                name={item.isActive ? "pause" : "play"}
                                size={20}
                                color={item.isActive ? "#f59e0b" : "#22c55e"}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => removeMember(item.id)}
                        >
                            <Ionicons name="trash" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.memberFooter}>
                    <Text style={styles.joinDate}>
                        Joined: {new Date(item.joinDate).toLocaleDateString()}
                    </Text>
                </View>
            </View>
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
                        <Text style={styles.headerTitle}>Family Management</Text>
                        <Text style={styles.headerSubtitle}>Manage your family members</Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {/* Family Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{members.length}</Text>
                        <Text style={styles.statLabel}>Total Members</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {members.filter(m => m.isActive).length}
                        </Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {members.filter(m => m.role === 'parent').length}
                        </Text>
                        <Text style={styles.statLabel}>Parents</Text>
                    </View>
                </View>

                {/* Add Member Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsAddModalVisible(true)}
                >
                    <LinearGradient
                        colors={['#4ade80', '#22c55e']}
                        style={styles.addButtonGradient}
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={styles.addButtonText}>Add Family Member</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Members List */}
                {members.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="people-outline" size={64} color="#d1d5db" />
                        </View>
                        <Text style={styles.emptyTitle}>No hay miembros registrados</Text>
                        <Text style={styles.emptySubtitle}>
                            Invita miembros a tu familia para comenzar a usar las funciones colaborativas
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyActionButton}
                            onPress={() => setIsAddModalVisible(true)}
                        >
                            <LinearGradient
                                colors={['#8b5cf6', '#7c3aed']}
                                style={styles.emptyActionButtonGradient}
                            >
                                <Ionicons name="person-add" size={20} color="white" />
                                <Text style={styles.emptyActionButtonText}>Invitar Primer Miembro</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={members}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMember}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
            </View>

            {/* Add Member Modal */}
            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setIsAddModalVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            <Ionicons name="close" size={24} color="#1e293b" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add Family Member</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={newMember.name}
                                onChangeText={(text) => setNewMember({ ...newMember, name: text })}
                                placeholder="Enter full name"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Role</Text>
                            <View style={styles.roleOptions}>
                                {roleOptions.map((role) => (
                                    <TouchableOpacity
                                        key={role.key}
                                        style={[
                                            styles.roleOption,
                                            newMember.role === role.key && styles.roleOptionSelected
                                        ]}
                                        onPress={() => setNewMember({ ...newMember, role: role.key as FamilyMember['role'] })}
                                    >
                                        <LinearGradient
                                            colors={newMember.role === role.key ? role.color : ['#f1f5f9', '#e2e8f0']}
                                            style={styles.roleOptionGradient}
                                        >
                                            <Ionicons
                                                name={role.icon as any}
                                                size={20}
                                                color={newMember.role === role.key ? 'white' : '#64748b'}
                                            />
                                            <Text style={[
                                                styles.roleOptionText,
                                                newMember.role === role.key && styles.roleOptionTextSelected
                                            ]}>
                                                {role.label}
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={newMember.email}
                                onChangeText={(text) => setNewMember({ ...newMember, email: text })}
                                placeholder="Enter email address"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone (Optional)</Text>
                            <TextInput
                                style={styles.input}
                                value={newMember.phone}
                                onChangeText={(text) => setNewMember({ ...newMember, phone: text })}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setIsAddModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={addMember}>
                            <LinearGradient
                                colors={['#4ade80', '#22c55e']}
                                style={styles.saveButtonGradient}
                            >
                                <Ionicons name="checkmark" size={20} color="white" />
                                <Text style={styles.saveButtonText}>Add Member</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#667eea',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    addButton: {
        marginBottom: 20,
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    listContainer: {
        paddingBottom: 20,
    },
    memberCard: {
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
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    memberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: 'white',
    },
    memberDetails: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    memberRole: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '500',
        marginBottom: 2,
    },
    memberEmail: {
        fontSize: 12,
        color: '#64748b',
    },
    memberActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
    },
    memberFooter: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    joinDate: {
        fontSize: 12,
        color: '#94a3b8',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalCloseButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    placeholder: {
        width: 40,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: 'white',
        color: '#1e293b',
    },
    roleOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    roleOption: {
        flex: 1,
        minWidth: '45%',
    },
    roleOptionSelected: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    roleOptionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    roleOptionText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
        color: '#64748b',
    },
    roleOptionTextSelected: {
        color: 'white',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    saveButton: {
        flex: 1,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        marginBottom: 24,
        opacity: 0.6,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    emptyActionButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    emptyActionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        gap: 8,
    },
    emptyActionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});
