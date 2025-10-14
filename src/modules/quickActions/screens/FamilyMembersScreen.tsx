import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFamilyStore } from '../store/familyStore';
import { MemberCard } from '../components/MemberCard';
import { theme } from '@/styles/simpleTheme';
import { useTranslation } from '../../../locales/i18n';

interface FamilyMembersScreenProps {
    navigation: any;
}

export const FamilyMembersScreen: React.FC<FamilyMembersScreenProps> = ({ navigation }) => {
    const { t } = useTranslation();
    const { familyMembers, updatePermissions, toggleOnlineStatus } = useFamilyStore();
    const [showPermissions, setShowPermissions] = useState(false);

    const handleMemberPress = (memberId: string) => {
        Alert.alert(
            'Miembro de Familia',
            `¿Qué deseas hacer con este miembro?`,
            [
                { text: 'Ver Detalles', onPress: () => console.log('Ver detalles') },
                { text: 'Editar Permisos', onPress: () => setShowPermissions(!showPermissions) },
                { text: 'Cambiar Estado', onPress: () => toggleOnlineStatus(memberId) },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleTogglePermission = (memberId: string, permission: keyof typeof familyMembers[0]['permissions']) => {
        updatePermissions(memberId, { [permission]: !familyMembers.find(m => m.id === memberId)?.permissions[permission] });
    };

    const getRoleStats = () => {
        const stats = {
            admin: 0,
            moderator: 0,
            child: 0,
            guest: 0,
            online: 0,
        };

        familyMembers.forEach(member => {
            stats[member.role]++;
            if (member.isOnline) stats.online++;
        });

        return stats;
    };

    const stats = getRoleStats();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#8B5CF6', '#A855F7']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Miembros de Familia</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => setShowPermissions(!showPermissions)}
                >
                    <Ionicons name="settings" size={24} color="white" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{familyMembers.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.online}</Text>
                        <Text style={styles.statLabel}>En Línea</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.admin}</Text>
                        <Text style={styles.statLabel}>Admins</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.child}</Text>
                        <Text style={styles.statLabel}>Niños</Text>
                    </View>
                </View>

                {/* Family Members List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Miembros de la Familia</Text>
                    {familyMembers.map((member) => (
                        <MemberCard
                            key={member.id}
                            member={member}
                            onPress={() => handleMemberPress(member.id)}
                            onTogglePermission={(permission) => handleTogglePermission(member.id, permission)}
                            showPermissions={showPermissions}
                        />
                    ))}
                </View>

                {/* Add Member Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => Alert.alert('Agregar Miembro', 'Funcionalidad próximamente')}
                >
                    <LinearGradient
                        colors={['#10B981', '#34D399']}
                        style={styles.addButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={styles.addButtonText}>Agregar Miembro</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
    },
    settingsButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginHorizontal: 16,
        marginBottom: 8,
    },
    addButton: {
        marginHorizontal: 16,
        marginVertical: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginLeft: 8,
    },
});
