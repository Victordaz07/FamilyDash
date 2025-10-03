import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../components/ui/WorkingComponents';
import { theme } from '../styles/simpleTheme';
import { useTranslation, Language } from '../locales/i18n';
import i18n from '../locales/i18n';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t, language, changeLanguage } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [deviceRingEnabled, setDeviceRingEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleNotificationToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      'Notificaciones',
      `Notificaciones ${notificationsEnabled ? 'desactivadas' : 'activadas'}`
    );
  };

  const handleDeviceRingToggle = () => {
    setDeviceRingEnabled(!deviceRingEnabled);
    Alert.alert(
      'Ring de Dispositivos',
      `Ring de dispositivos ${deviceRingEnabled ? 'desactivado' : 'activado'}`
    );
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    await changeLanguage(newLanguage);
    Alert.alert(
      t('settings.language'),
      `${t('settings.languageDescription')} - ${newLanguage === 'en' ? t('settings.english') : t('settings.spanish')}`
    );
  };

  const handleForceSpanish = async () => {
    await i18n.forceSpanish();
    Alert.alert('Idioma Forzado', 'Se ha forzado el idioma a Español');
  };

  const handleDarkModeToggle = () => {
    setDarkModeEnabled(!darkModeEnabled);
    Alert.alert(
      'Modo Oscuro',
      `Modo oscuro ${darkModeEnabled ? 'desactivado' : 'activado'}`
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent 
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      )}
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
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Language Selection */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <Text style={styles.sectionSubtitle}>{t('settings.languageDescription')}</Text>
        
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'en' && styles.languageOptionSelected
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Text style={styles.languageFlag}>🇺🇸</Text>
            <Text style={[
              styles.languageText,
              language === 'en' && styles.languageTextSelected
            ]}>
              {t('settings.english')}
            </Text>
            {language === 'en' && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              language === 'es' && styles.languageOptionSelected
            ]}
            onPress={() => handleLanguageChange('es')}
          >
            <Text style={styles.languageFlag}>🇪🇸</Text>
            <Text style={[
              styles.languageText,
              language === 'es' && styles.languageTextSelected
            ]}>
              {t('settings.spanish')}
            </Text>
            {language === 'es' && (
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Temporary Force Spanish Button */}
        <TouchableOpacity
          style={styles.forceButton}
          onPress={handleForceSpanish}
        >
          <Text style={styles.forceButtonText}>🔧 Forzar Español (Debug)</Text>
        </TouchableOpacity>
      </Card>

      {/* Notificaciones */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        <SettingItem
          icon="notifications"
          title="Notificaciones Push"
          subtitle="Recibir notificaciones de la app"
          rightComponent={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
            />
          }
        />
        <SettingItem
          icon="time"
          title="Recordatorios"
          subtitle="Configurar horarios de notificación"
          onPress={() => Alert.alert('Recordatorios', 'Configuración de recordatorios')}
        />
        <SettingItem
          icon="volume-high"
          title="Sonidos"
          subtitle="Configurar sonidos de notificación"
          onPress={() => Alert.alert('Sonidos', 'Configuración de sonidos')}
        />
      </Card>

      {/* Dispositivos */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Dispositivos</Text>
        <SettingItem
          icon="phone-portrait"
          title="Ring de Dispositivos"
          subtitle="Hacer sonar todos los dispositivos familiares"
          rightComponent={
            <Switch
              value={deviceRingEnabled}
              onValueChange={handleDeviceRingToggle}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor={deviceRingEnabled ? '#ffffff' : '#ffffff'}
            />
          }
        />
        <SettingItem
          icon="bluetooth"
          title="Dispositivos Conectados"
          subtitle="Gestionar dispositivos vinculados"
          onPress={() => Alert.alert('Dispositivos', 'Lista de dispositivos conectados')}
        />
        <SettingItem
          icon="location"
          title="Ubicación Familiar"
          subtitle="Compartir ubicación entre familiares"
          onPress={() => Alert.alert('Ubicación', 'Configuración de ubicación')}
        />
      </Card>

      {/* Apariencia */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <SettingItem
          icon="moon"
          title="Modo Oscuro"
          subtitle="Cambiar entre tema claro y oscuro"
          rightComponent={
            <Switch
              value={darkModeEnabled}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor={darkModeEnabled ? '#ffffff' : '#ffffff'}
            />
          }
        />
        <SettingItem
          icon="color-palette"
          title="Colores"
          subtitle="Personalizar colores de la app"
          onPress={() => Alert.alert('Colores', 'Personalización de colores')}
        />
        <SettingItem
          icon="text"
          title="Tamaño de Texto"
          subtitle="Ajustar tamaño de fuente"
          onPress={() => Alert.alert('Texto', 'Configuración de tamaño de texto')}
        />
      </Card>

      {/* Cuenta */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <SettingItem
          icon="person"
          title="Perfil"
          subtitle="Editar información personal"
          onPress={() => Alert.alert('Perfil', 'Editar perfil')}
        />
        <SettingItem
          icon="people"
          title="Familia"
          subtitle="Gestionar miembros de la familia"
          onPress={() => Alert.alert('Familia', 'Configuración de familia')}
        />
        <SettingItem
          icon="shield-checkmark"
          title="Privacidad"
          subtitle="Configurar privacidad y seguridad"
          onPress={() => Alert.alert('Privacidad', 'Configuración de privacidad')}
        />
      </Card>

      {/* Soporte */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte</Text>
        <SettingItem
          icon="help-circle"
          title="Ayuda"
          subtitle="Centro de ayuda y preguntas frecuentes"
          onPress={() => Alert.alert('Ayuda', 'Centro de ayuda')}
        />
        <SettingItem
          icon="mail"
          title="Contacto"
          subtitle="Enviar comentarios o reportar problemas"
          onPress={() => Alert.alert('Contacto', 'Enviar mensaje')}
        />
        <SettingItem
          icon="information-circle"
          title="Acerca de"
          subtitle="Información de la aplicación"
          onPress={() => Alert.alert('Acerca de', 'FamilyDash v1.0')}
        />
      </Card>

      {/* Botón de Cerrar Sesión */}
      <View style={styles.logoutSection}>
        <Button
          title="Cerrar Sesión"
          onPress={() => Alert.alert('Cerrar Sesión', '¿Estás seguro?')}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>FamilyDash v1.0</Text>
        <Text style={styles.footerSubtext}>Manteniendo familias conectadas</Text>
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
  placeholder: {
    width: 40,
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
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  languageContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    backgroundColor: '#e0e7ff',
    borderColor: theme.colors.primary,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  languageTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  forceButton: {
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  forceButtonText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  logoutSection: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  logoutButton: {
    borderColor: theme.colors.error,
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

export default SettingsScreen;
