/**
 * 🚨 Emergency Service - FamilyDash
 * Servicio real para manejar emergencias familiares
 */

import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import RealDatabaseService from './database/RealDatabaseService';

// Check if we're running in Expo Go (SDK 53+ has issues with notifications)
const isExpoGo = typeof global !== 'undefined' && global.__expo && global.__expo.Constants &&
  global.__expo.Constants.executionEnvironment === 'storeClient';

// Additional check for SDK 53+ compatibility
const isSDK53Plus = typeof global !== 'undefined' && global.__expo &&
  global.__expo.Constants && global.__expo.Constants.expoVersion &&
  parseInt(global.__expo.Constants.expoVersion.split('.')[0]) >= 53;

// Check if we're in development mode with Expo Go
const isDevelopment = __DEV__;
const isExpoGoApp = typeof global !== 'undefined' && global.__expo && 
  global.__expo.Constants && global.__expo.Constants.appOwnership === 'expo';

const shouldDisableNotifications = isExpoGo || isSDK53Plus || (isDevelopment && isExpoGoApp);

export interface EmergencyAlert {
  id: string;
  type: 'medical' | 'safety' | 'urgent' | 'custom';
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  triggeredBy: string;
  triggeredByName: string;
  familyId: string;
  timestamp: number;
  status: 'active' | 'resolved' | 'cancelled';
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  priority: number;
}

class EmergencyService {
  private static instance: EmergencyService;
  private activeAlerts: Map<string, EmergencyAlert> = new Map();
  private emergencyContacts: EmergencyContact[] = [];

  private constructor() {
    this.initializeNotifications();
  }

  public static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  private async initializeNotifications() {
    if (shouldDisableNotifications) {
      console.log('🔇 Skipping emergency notification channel setup in Expo Go or SDK 53+');
      return;
    }

    // Configurar notificaciones de emergencia con prioridad alta
    await Notifications.setNotificationChannelAsync('emergency', {
      name: 'Emergency Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  /**
   * Enviar alerta de emergencia a todos los miembros de la familia
   */
  public async sendEmergencyAlert(
    type: EmergencyAlert['type'],
    message: string,
    userId: string,
    userName: string,
    familyId: string,
    location?: EmergencyAlert['location']
  ): Promise<{ success: boolean; alertId?: string; error?: string }> {
    try {
      console.log('🚨 Sending emergency alert:', type, message);

      const alertId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const alert: EmergencyAlert = {
        id: alertId,
        type,
        message,
        location,
        triggeredBy: userId,
        triggeredByName: userName,
        familyId,
        timestamp: Date.now(),
        status: 'active',
      };

      // Guardar en local
      this.activeAlerts.set(alertId, alert);

      // Guardar en Firebase
      try {
        await RealDatabaseService.setDocument('emergencyAlerts', alertId, alert);
      } catch (dbError) {
        console.error('Error saving to Firebase:', dbError);
        // Continuar aunque falle Firebase
      }

      // Enviar notificación push a todos los dispositivos familiares
      await this.sendPushNotificationToFamily(alert);

      // Llamar a contactos de emergencia si es necesario
      if (type === 'medical' || type === 'safety') {
        await this.notifyEmergencyContacts(alert);
      }

      return { success: true, alertId };
    } catch (error: any) {
      console.error('❌ Error sending emergency alert:', error);
      return {
        success: false,
        error: error.message || 'Failed to send emergency alert',
      };
    }
  }

  /**
   * Activar modo de emergencia (aumenta prioridad de notificaciones y ubicación)
   */
  public async activateEmergencyMode(
    userId: string,
    userName: string,
    familyId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚨 Activating emergency mode for:', userName);

      if (shouldDisableNotifications) {
        console.log('🔇 Skipping emergency mode notification in Expo Go or SDK 53+');
        return { success: true };
      }

      const alert: EmergencyAlert = {
        id: `emergency_mode_${Date.now()}`,
        type: 'urgent',
        message: reason || `${userName} activated emergency mode`,
        triggeredBy: userId,
        triggeredByName: userName,
        familyId,
        timestamp: Date.now(),
        status: 'active',
      };

      this.activeAlerts.set(alert.id, alert);

      // Guardar en Firebase
      try {
        await RealDatabaseService.setDocument('emergencyAlerts', alert.id, alert);
        await RealDatabaseService.setDocument('emergencyMode', familyId, {
          active: true,
          activatedBy: userId,
          activatedByName: userName,
          timestamp: Date.now(),
          reason,
        });
      } catch (dbError) {
        console.error('Error saving emergency mode to Firebase:', dbError);
      }

      // Notificar a todos
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 EMERGENCY MODE ACTIVATED',
          body: alert.message,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'emergency',
        },
        trigger: null, // Inmediato
      });

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error activating emergency mode:', error);
      return {
        success: false,
        error: error.message || 'Failed to activate emergency mode',
      };
    }
  }

  /**
   * Desactivar modo de emergencia
   */
  public async deactivateEmergencyMode(
    familyId: string
  ): Promise<{ success: boolean }> {
    try {
      await RealDatabaseService.setDocument('emergencyMode', familyId, {
        active: false,
        deactivatedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error deactivating emergency mode:', error);
      return { success: false };
    }
  }

  /**
   * Resolver alerta de emergencia
   */
  public async resolveAlert(
    alertId: string,
    resolvedBy: string
  ): Promise<{ success: boolean }> {
    try {
      const alert = this.activeAlerts.get(alertId);
      if (alert) {
        alert.status = 'resolved';
        this.activeAlerts.set(alertId, alert);

        await RealDatabaseService.updateDocument('emergencyAlerts', alertId, {
          status: 'resolved',
          resolvedBy,
          resolvedAt: Date.now(),
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error resolving alert:', error);
      return { success: false };
    }
  }

  /**
   * Obtener alertas activas
   */
  public getActiveAlerts(): EmergencyAlert[] {
    return Array.from(this.activeAlerts.values()).filter(
      (alert) => alert.status === 'active'
    );
  }

  /**
   * Agregar contacto de emergencia
   */
  public addEmergencyContact(contact: EmergencyContact): void {
    this.emergencyContacts.push(contact);
    // TODO: Guardar en AsyncStorage o Firebase
  }

  /**
   * Enviar notificación push a familia
   */
  private async sendPushNotificationToFamily(
    alert: EmergencyAlert
  ): Promise<void> {
    try {
      if (shouldDisableNotifications) {
        console.log('🔇 Skipping emergency push notification in Expo Go or SDK 53+');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚨 EMERGENCY: ${alert.type.toUpperCase()}`,
          body: `${alert.triggeredByName}: ${alert.message}`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          categoryIdentifier: 'emergency',
          data: { alertId: alert.id, type: alert.type },
        },
        trigger: null, // Inmediato
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Notificar a contactos de emergencia externos
   */
  private async notifyEmergencyContacts(
    alert: EmergencyAlert
  ): Promise<void> {
    // En una implementación real, aquí se llamaría/enviaría SMS a contactos
    console.log('📞 Notifying emergency contacts:', this.emergencyContacts);
    
    // TODO: Integrar con servicio de SMS/llamadas
    // Por ejemplo: Twilio API para enviar SMS
  }

  /**
   * Obtener ubicación actual del usuario
   */
  public async getCurrentLocation(): Promise<EmergencyAlert['location'] | null> {
    try {
      // TODO: Implementar con expo-location
      // const { status } = await Location.requestForegroundPermissionsAsync();
      // if (status !== 'granted') return null;
      // const location = await Location.getCurrentPositionAsync({});
      // return { latitude: location.coords.latitude, longitude: location.coords.longitude };
      
      console.log('📍 Location service not yet implemented');
      return null;
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  /**
   * Limpiar alertas antiguas (más de 24 horas)
   */
  public cleanOldAlerts(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    this.activeAlerts.forEach((alert, id) => {
      if (alert.timestamp < oneDayAgo && alert.status !== 'active') {
        this.activeAlerts.delete(id);
      }
    });
  }
}

export default EmergencyService.getInstance();





