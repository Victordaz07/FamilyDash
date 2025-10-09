/**
 * 👥 Family Role Management Screen - FamilyDash
 * Pantalla visual para gestionar roles y permisos de familia
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRole } from '../contexts/RoleContext';
import { useFamily } from '../contexts/FamilyContext';
import {
  Role,
  roleConfigs,
  RoleConfig,
  FamilyMemberWithRole,
  canManageRole,
} from '../types/roles';
import RealDatabaseService from '../services/database/RealDatabaseService';
import Logger from '../services/Logger';
import { theme } from '../styles/simpleTheme';

interface FamilyRoleManagementScreenProps {
  navigation: any;
}

export default function FamilyRoleManagementScreen({
  navigation,
}: FamilyRoleManagementScreenProps) {
  const { user: currentUser, can, canManage } = useRole();
  const { family } = useFamily();

  const [familyMembers, setFamilyMembers] = useState<FamilyMemberWithRole[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMemberWithRole | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, [family]);

  const loadFamilyMembers = async () => {
    if (!family?.id) return;

    try {
      setIsLoading(true);
      Logger.debug('Loading family members with roles');

      // Cargar miembros de la familia desde Firebase
      const members = await RealDatabaseService.getDocuments(`families/${family.id}/members`);

      if (members && Array.isArray(members)) {
        setFamilyMembers(members as FamilyMemberWithRole[]);
      }
    } catch (error) {
      Logger.error('Failed to load family members', error);
      Alert.alert('Error', 'No se pudieron cargar los miembros de la familia');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (member: FamilyMemberWithRole, newRole: Role) => {
    if (!currentUser) return;

    // Verificar permisos
    if (!canManage(member.role)) {
      Alert.alert('Sin Permisos', 'No tienes permisos para cambiar este rol');
      return;
    }

    Alert.alert(
      'Cambiar Rol',
      `¿Cambiar el rol de ${member.displayName} de "${roleConfigs[member.role].displayName}" a "${roleConfigs[newRole].displayName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cambiar',
          onPress: async () => {
            try {
              setIsLoading(true);
              Logger.info('Changing member role', {
                memberId: member.userId,
                oldRole: member.role,
                newRole,
              });

              // Actualizar en Firebase
              await RealDatabaseService.updateDocument('users', member.userId, {
                role: newRole,
                updatedAt: new Date().toISOString(),
                updatedBy: currentUser.id,
              });

              // También actualizar en la lista de miembros de la familia
              await RealDatabaseService.updateDocument(
                `families/${family?.id}/members`,
                member.id,
                {
                  role: newRole,
                  updatedAt: new Date().toISOString(),
                }
              );

              Alert.alert('Éxito', `Rol de ${member.displayName} actualizado`);
              setShowRoleModal(false);
              loadFamilyMembers(); // Recargar lista
            } catch (error) {
              Logger.error('Failed to change member role', error);
              Alert.alert('Error', 'No se pudo cambiar el rol');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (member: FamilyMemberWithRole) => {
    if (!can('manage_family')) {
      Alert.alert('Sin Permisos', 'Solo los administradores pueden eliminar miembros');
      return;
    }

    if (member.role === 'admin') {
      Alert.alert('Error', 'No puedes eliminar al administrador principal');
      return;
    }

    Alert.alert(
      'Eliminar Miembro',
      `¿Estás seguro de eliminar a ${member.displayName} de la familia?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await RealDatabaseService.deleteDocument(
                `families/${family?.id}/members`,
                member.id
              );
              Alert.alert('Éxito', 'Miembro eliminado de la familia');
              loadFamilyMembers();
            } catch (error) {
              Logger.error('Failed to remove member', error);
              Alert.alert('Error', 'No se pudo eliminar el miembro');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderRoleModal = () => {
    if (!selectedMember) return null;

    const availableRoles: Role[] = ['admin', 'co_admin', 'member', 'viewer'];
    const filteredRoles = availableRoles.filter((role) =>
      canManage(role)
    );

    return (
      <Modal visible={showRoleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar Rol</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.memberPreview}>
              <Image
                source={{ uri: selectedMember.avatar || 'https://via.placeholder.com/50' }}
                style={styles.memberPreviewAvatar}
              />
              <View>
                <Text style={styles.memberPreviewName}>{selectedMember.displayName}</Text>
                <Text style={styles.memberPreviewRole}>
                  Rol actual: {roleConfigs[selectedMember.role].displayName}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.roleList}>
              {filteredRoles.map((role) => {
                const config = roleConfigs[role];
                const isCurrentRole = selectedMember.role === role;

                return (
                  <TouchableOpacity
                    key={role}
                    style={[styles.roleOption, isCurrentRole && styles.roleOptionCurrent]}
                    onPress={() => {
                      if (!isCurrentRole) {
                        handleChangeRole(selectedMember, role);
                      }
                    }}
                    disabled={isCurrentRole}
                  >
                    <View
                      style={[styles.roleIcon, { backgroundColor: `${config.color}20` }]}
                    >
                      <Ionicons name={config.icon as any} size={24} color={config.color} />
                    </View>
                    <View style={styles.roleInfo}>
                      <Text style={styles.roleName}>{config.displayName}</Text>
                      <Text style={styles.roleDescription}>{config.description}</Text>
                    </View>
                    {isCurrentRole && (
                      <Ionicons name="checkmark-circle" size={24} color={config.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderMemberCard = (member: FamilyMemberWithRole) => {
    const config = roleConfigs[member.role];
    const isCurrentUser = member.userId === currentUser?.id;

    return (
      <View key={member.id} style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <View style={styles.memberLeft}>
            <Image
              source={{ uri: member.avatar || 'https://via.placeholder.com/50' }}
              style={styles.memberAvatar}
            />
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{member.displayName}</Text>
                {isCurrentUser && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>Tú</Text>
                  </View>
                )}
              </View>
              <Text style={styles.memberEmail}>{member.email || 'Sin email'}</Text>
            </View>
          </View>

          <View style={[styles.roleBadge, { backgroundColor: `${config.color}20` }]}>
            <Ionicons name={config.icon as any} size={16} color={config.color} />
            <Text style={[styles.roleBadgeText, { color: config.color }]}>
              {config.displayName}
            </Text>
          </View>
        </View>

        {/* Permisos */}
        <View style={styles.permissionsContainer}>
          <Text style={styles.permissionsTitle}>Permisos:</Text>
          <View style={styles.permissionsList}>
            {roleConfigs[member.role].level >= 3 && (
              <View style={styles.permissionChip}>
                <Ionicons name="create" size={12} color="#10B981" />
                <Text style={styles.permissionText}>Crear</Text>
              </View>
            )}
            {roleConfigs[member.role].level >= 3 && (
              <View style={styles.permissionChip}>
                <Ionicons name="checkmark-done" size={12} color="#10B981" />
                <Text style={styles.permissionText}>Aprobar</Text>
              </View>
            )}
            {roleConfigs[member.role].level >= 2 && (
              <View style={styles.permissionChip}>
                <Ionicons name="checkmark" size={12} color="#3B82F6" />
                <Text style={styles.permissionText}>Completar</Text>
              </View>
            )}
            <View style={styles.permissionChip}>
              <Ionicons name="eye" size={12} color="#6B7280" />
              <Text style={styles.permissionText}>Ver</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        {!isCurrentUser && can('manage_family') && (
          <View style={styles.memberActions}>
            {canManage(member.role) && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setSelectedMember(member);
                  setShowRoleModal(true);
                }}
              >
                <Ionicons name="swap-horizontal" size={16} color="#8B5CF6" />
                <Text style={styles.actionButtonText}>Cambiar Rol</Text>
              </TouchableOpacity>
            )}
            {member.role !== 'admin' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonDanger]}
                onPress={() => handleRemoveMember(member)}
              >
                <Ionicons name="person-remove" size={16} color="#EF4444" />
                <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Gestión de Roles</Text>
            <Text style={styles.headerSubtitle}>
              {familyMembers.length} miembros • Tu rol: {roleConfigs[currentUser?.role || 'viewer'].displayName}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Sobre los Roles</Text>
            <Text style={styles.infoDescription}>
              Los roles determinan qué puede hacer cada miembro de la familia. Los padres
              pueden gestionar todo, mientras que los hijos tienen permisos limitados.
            </Text>
          </View>
        </View>

        {/* Role Legend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Roles</Text>
          {Object.values(roleConfigs).map((config) => (
            <View key={config.role} style={styles.legendItem}>
              <View style={[styles.legendIcon, { backgroundColor: `${config.color}20` }]}>
                <Ionicons name={config.icon as any} size={20} color={config.color} />
              </View>
              <View style={styles.legendText}>
                <Text style={styles.legendName}>{config.displayName}</Text>
                <Text style={styles.legendDescription}>{config.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Members List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Miembros de la Familia</Text>
            <Text style={styles.sectionCount}>{familyMembers.length}</Text>
          </View>

          {familyMembers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No hay miembros</Text>
              <Text style={styles.emptySubtitle}>
                Invita miembros a tu familia para comenzar
              </Text>
            </View>
          ) : (
            familyMembers.map((member) => renderMemberCard(member))
          )}
        </View>

        {/* Add Member Button */}
        {can('manage_family') && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              // TODO: Navigate to invite member screen
              Alert.alert('Próximamente', 'Función de invitar miembros próximamente');
            }}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="person-add" size={20} color="white" />
              <Text style={styles.addButtonText}>Invitar Miembro</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Permissions Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tus Permisos</Text>
          <View style={styles.permissionsGrid}>
            {currentUser && (
              <>
                {can('create') && (
                  <View style={styles.permissionCard}>
                    <Ionicons name="add-circle" size={24} color="#10B981" />
                    <Text style={styles.permissionCardText}>Crear</Text>
                  </View>
                )}
                {can('edit') && (
                  <View style={styles.permissionCard}>
                    <Ionicons name="create" size={24} color="#3B82F6" />
                    <Text style={styles.permissionCardText}>Editar</Text>
                  </View>
                )}
                {can('delete') && (
                  <View style={styles.permissionCard}>
                    <Ionicons name="trash" size={24} color="#EF4444" />
                    <Text style={styles.permissionCardText}>Eliminar</Text>
                  </View>
                )}
                {can('approve') && (
                  <View style={styles.permissionCard}>
                    <Ionicons name="checkmark-done" size={24} color="#8B5CF6" />
                    <Text style={styles.permissionCardText}>Aprobar</Text>
                  </View>
                )}
                {can('view_reports') && (
                  <View style={styles.permissionCard}>
                    <Ionicons name="stats-chart" size={24} color="#F59E0B" />
                    <Text style={styles.permissionCardText}>Reportes</Text>
                  </View>
                )}
                {can('manage_penalties') && (
                  <View style={styles.permissionCard}>
                    <Ionicons name="warning" size={24} color="#EF4444" />
                    <Text style={styles.permissionCardText}>Penalizaciones</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Role Change Modal */}
      {renderRoleModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  legendIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  legendText: {
    flex: 1,
  },
  legendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  legendDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  youBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  memberEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  permissionsContainer: {
    marginBottom: 12,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  permissionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  permissionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  actionButtonDanger: {
    borderColor: '#FEE2E2',
  },
  actionButtonTextDanger: {
    color: '#EF4444',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  permissionCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  memberPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  memberPreviewAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberPreviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  memberPreviewRole: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  roleList: {
    padding: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  roleOptionCurrent: {
    backgroundColor: '#F3E8FF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});

