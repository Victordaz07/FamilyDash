import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FamilyMember } from '@/types/quickActionsTypes';
import { theme } from '@/styles/simpleTheme';

interface MemberCardProps {
    member: FamilyMember;
    onPress: () => void;
    onTogglePermission: (permission: keyof FamilyMember['permissions']) => void;
    showPermissions?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
    member,
    onPress,
    onTogglePermission,
    showPermissions = false,
}) => {
    const getRoleColor = (role: FamilyMember['role']) => {
        switch (role) {
            case 'admin':
                return ['#8B5CF6', '#A855F7'];
            case 'moderator':
                return ['#3B82F6', '#60A5FA'];
            case 'child':
                return ['#10B981', '#34D399'];
            case 'guest':
                return ['#F59E0B', '#FBBF24'];
            default:
                return ['#6B7280', '#9CA3AF'];
        }
    };

    const getRoleLabel = (role: FamilyMember['role']) => {
        switch (role) {
            case 'admin':
                return 'Administrador';
            case 'moderator':
                return 'Moderador';
            case 'child':
                return 'Niño';
            case 'guest':
                return 'Invitado';
            default:
                return 'Desconocido';
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <LinearGradient
                colors={getRoleColor(member.role)}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatar}>{member.avatar}</Text>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: member.isOnline ? '#10B981' : '#6B7280' }
                        ]} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{member.name}</Text>
                        <Text style={styles.role}>{getRoleLabel(member.role)}</Text>
                        {member.age && <Text style={styles.age}>{member.age} años</Text>}
                    </View>
                    <View style={styles.status}>
                        <Text style={styles.statusText}>
                            {member.isOnline ? 'En línea' : 'Desconectado'}
                        </Text>
                        {member.deviceId && (
                            <Ionicons name="phone-portrait" size={16} color="white" />
                        )}
                    </View>
                </View>

                {showPermissions && (
                    <View style={styles.permissions}>
                        <Text style={styles.permissionsTitle}>Permisos:</Text>
                        <View style={styles.permissionRow}>
                            <Text style={styles.permissionLabel}>Tareas</Text>
                            <Switch
                                value={member.permissions.tasks}
                                onValueChange={() => onTogglePermission('tasks')}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={member.permissions.tasks ? '#f5dd4b' : '#f4f3f4'}
                            />
                        </View>
                        <View style={styles.permissionRow}>
                            <Text style={styles.permissionLabel}>Metas</Text>
                            <Switch
                                value={member.permissions.goals}
                                onValueChange={() => onTogglePermission('goals')}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={member.permissions.goals ? '#f5dd4b' : '#f4f3f4'}
                            />
                        </View>
                        <View style={styles.permissionRow}>
                            <Text style={styles.permissionLabel}>Penas</Text>
                            <Switch
                                value={member.permissions.penalties}
                                onValueChange={() => onTogglePermission('penalties')}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={member.permissions.penalties ? '#f5dd4b' : '#f4f3f4'}
                            />
                        </View>
                        <View style={styles.permissionRow}>
                            <Text style={styles.permissionLabel}>Cuarto Seguro</Text>
                            <Switch
                                value={member.permissions.safeRoom}
                                onValueChange={() => onTogglePermission('safeRoom')}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={member.permissions.safeRoom ? '#f5dd4b' : '#f4f3f4'}
                            />
                        </View>
                        <View style={styles.permissionRow}>
                            <Text style={styles.permissionLabel}>Configuraciones</Text>
                            <Switch
                                value={member.permissions.settings}
                                onValueChange={() => onTogglePermission('settings')}
                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                thumbColor={member.permissions.settings ? '#f5dd4b' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    gradient: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        fontSize: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        width: 40,
        height: 40,
        textAlign: 'center',
        lineHeight: 40,
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'white',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    role: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 2,
    },
    age: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    status: {
        alignItems: 'flex-end',
    },
    statusText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    permissions: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    permissionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 12,
    },
    permissionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    permissionLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
});




