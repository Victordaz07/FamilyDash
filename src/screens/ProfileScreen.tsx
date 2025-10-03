import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Avatar } from '../components/ui/WorkingComponents';
import { theme } from '../styles/simpleTheme';
// import { useTranslation } from '../locales/i18n'; // TEMPORARILY COMMENTED FOR DEBUGGING

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  // const { t } = useTranslation(); // TEMPORARILY COMMENTED FOR DEBUGGING

  const [user] = useState({
    name: 'Usuario Principal',
    email: 'usuario@familydash.com',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    points: 1250,
    streak: 7,
    level: 'Experto',
    joinDate: 'Enero 2024'
  });

  const handleEditProfile = () => {
    Alert.alert('Editar Perfil', 'Funcionalidad de edición de perfil');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleFamilyMembers = () => {
    Alert.alert('Miembros de Familia', 'Funcionalidad próximamente - Pantalla de Miembros de Familia');
  };

  const handleAchievements = () => {
    Alert.alert('Logros', 'Funcionalidad próximamente - Pantalla de Logros');
  };

  const handleRecentActivity = () => {
    Alert.alert('Actividad Reciente', 'Funcionalidad próximamente - Pantalla de Actividad Reciente');
  };

  const handleStatistics = () => {
    Alert.alert('Estadísticas', 'Funcionalidad próximamente - Pantalla de Estadísticas');
  };

  const ProfileItem = ({
    icon,
    title,
    subtitle,
    onPress,
    badge
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    badge?: string | number;
  }) => (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.profileLeft}>
        <View style={styles.profileIcon}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.profileContent}>
          <Text style={styles.profileTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.profileRight}>
        {badge && (
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
        >
          <Ionicons name="settings" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* User Info Card */}
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
          <Avatar
            source={{ uri: user.avatar }}
            size={80}
            name={user.name}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.points}</Text>
                <Text style={styles.statLabel}>Puntos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.streak}</Text>
                <Text style={styles.statLabel}>Racha</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.level}</Text>
                <Text style={styles.statLabel}>Nivel</Text>
              </View>
            </View>
          </View>
        </View>
        <Button
          title="Editar Perfil"
          onPress={handleEditProfile}
          variant="outline"
          style={styles.editButton}
        />
      </Card>

      {/* Quick Actions */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <ProfileItem
          icon="people"
          title="Miembros de Familia"
          subtitle="Gestionar familiares"
          onPress={handleFamilyMembers}
          badge="4"
        />
        <ProfileItem
          icon="trophy"
          title="Logros"
          subtitle="Ver medallas y logros"
          onPress={handleAchievements}
          badge="12"
        />
        <ProfileItem
          icon="calendar"
          title="Actividad Reciente"
          subtitle="Ver historial de actividades"
          onPress={handleRecentActivity}
        />
        <ProfileItem
          icon="stats-chart"
          title="Estadísticas"
          subtitle="Ver progreso y métricas"
          onPress={handleStatistics}
        />
      </Card>

      {/* Family Info */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Información Familiar</Text>
        <ProfileItem
          icon="home"
          title="Hogar Principal"
          subtitle="Casa de la familia"
          onPress={() => Alert.alert('Hogar', 'Información del hogar')}
        />
        <ProfileItem
          icon="location"
          title="Ubicaciones Guardadas"
          subtitle="Lugares frecuentes"
          onPress={() => Alert.alert('Ubicaciones', 'Lugares guardados')}
        />
        <ProfileItem
          icon="time"
          title="Horarios Familiares"
          subtitle="Rutinas y horarios"
          onPress={() => Alert.alert('Horarios', 'Rutinas familiares')}
        />
      </Card>

      {/* App Info */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la App</Text>
        <ProfileItem
          icon="information-circle"
          title="Versión"
          subtitle="FamilyDash v1.0"
          onPress={() => Alert.alert('Versión', 'FamilyDash v1.0')}
        />
        <ProfileItem
          icon="help-circle"
          title="Ayuda y Soporte"
          subtitle="Centro de ayuda"
          onPress={() => Alert.alert('Ayuda', 'Centro de ayuda')}
        />
        <ProfileItem
          icon="document-text"
          title="Términos y Privacidad"
          subtitle="Políticas de la app"
          onPress={() => Alert.alert('Términos', 'Políticas de privacidad')}
        />
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Miembro desde {user.joinDate}</Text>
        <Text style={styles.footerSubtext}>FamilyDash - Conectando familias</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  settingsButton: {
    padding: 8,
  },
  userCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  editButton: {
    marginTop: 8,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileContent: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  profileSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  profileRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  profileBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

export default ProfileScreen;
