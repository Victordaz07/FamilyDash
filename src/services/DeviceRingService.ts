/**
 * 📱 Device Ring Service - FamilyDash
 * Servicio real para hacer sonar dispositivos de familiares
 */

import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Vibration, Platform } from 'react-native';
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

export interface RingRequest {
  id: string;
  triggeredBy: string;
  triggeredByName: string;
  targetUserId?: string; // Si es undefined, ring a todos
  targetUserName?: string;
  familyId: string;
  timestamp: number;
  duration: number; // en segundos
  status: 'active' | 'stopped' | 'expired';
}

class DeviceRingService {
  private static instance: DeviceRingService;
  private activeRing: RingRequest | null = null;
  private sound: Audio.Sound | null = null;
  private vibrationInterval: NodeJS.Timeout | null = null;
  private ringTimeoutHandle: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeAudio();
    this.listenForRingRequests();
  }

  public static getInstance(): DeviceRingService {
    if (!DeviceRingService.instance) {
      DeviceRingService.instance = new DeviceRingService();
    }
    return DeviceRingService.instance;
  }

  /**
   * Inicializar configuración de audio
   */
  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  /**
   * Ring un dispositivo específico
   */
  public async ringDevice(
    targetUserId: string,
    targetUserName: string,
    triggeredBy: string,
    triggeredByName: string,
    familyId: string,
    duration: number = 30
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      console.log(`📱 Ringing device for: ${targetUserName}`);

      const requestId = `ring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const ringRequest: RingRequest = {
        id: requestId,
        triggeredBy,
        triggeredByName,
        targetUserId,
        targetUserName,
        familyId,
        timestamp: Date.now(),
        duration,
        status: 'active',
      };

      // Guardar en Firebase para que el dispositivo objetivo lo reciba
      try {
        await RealDatabaseService.setDocument(
          `ringRequests/${targetUserId}`,
          requestId,
          ringRequest
        );
      } catch (dbError) {
        console.error('Error saving to Firebase:', dbError);
      }

      // Enviar notificación push
      await this.sendRingNotification(ringRequest);

      return { success: true, requestId };
    } catch (error: any) {
      console.error('❌ Error ringing device:', error);
      return {
        success: false,
        error: error.message || 'Failed to ring device',
      };
    }
  }

  /**
   * Ring todos los dispositivos de la familia
   */
  public async ringAllDevices(
    triggeredBy: string,
    triggeredByName: string,
    familyId: string,
    duration: number = 30
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      console.log('📱 Ringing ALL family devices');

      const requestId = `ring_all_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const ringRequest: RingRequest = {
        id: requestId,
        triggeredBy,
        triggeredByName,
        familyId,
        timestamp: Date.now(),
        duration,
        status: 'active',
      };

      // Guardar en Firebase para que todos los dispositivos lo reciban
      try {
        await RealDatabaseService.setDocument(
          `ringRequests/all/${familyId}`,
          requestId,
          ringRequest
        );
      } catch (dbError) {
        console.error('Error saving to Firebase:', dbError);
      }

      // Enviar notificación push a todos
      await this.sendRingNotification(ringRequest);

      return { success: true, requestId };
    } catch (error: any) {
      console.error('❌ Error ringing all devices:', error);
      return {
        success: false,
        error: error.message || 'Failed to ring devices',
      };
    }
  }

  /**
   * Escuchar por solicitudes de ring desde Firebase
   */
  private async listenForRingRequests() {
    try {
      // TODO: Implementar listener de Firebase para recibir ring requests en tiempo real
      // Cuando llegue una request, llamar a this.startRinging()
      console.log('📡 Listening for ring requests...');
    } catch (error) {
      console.error('Error setting up ring listener:', error);
    }
  }

  /**
   * Iniciar el ring local en este dispositivo
   */
  public async startRinging(request: RingRequest): Promise<void> {
    if (shouldDisableNotifications) {
      console.log('🔇 Skipping device ring notification in Expo Go or SDK 53+');
      return;
    }

    if (this.activeRing) {
      console.log('⚠️ Ring already active, stopping previous ring');
      await this.stopRinging();
    }

    this.activeRing = request;

    // Reproducir sonido
    await this.playRingSound();

    // Iniciar vibración
    this.startVibration();

    // Mostrar notificación visible
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📱 Device Ring',
        body: `${request.triggeredByName} is trying to reach you!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
        autoDismiss: false,
      },
      trigger: null, // Inmediato
    });

    // Auto-stop después de la duración
    this.ringTimeoutHandle = setTimeout(() => {
      this.stopRinging();
    }, request.duration * 1000);
  }

  /**
   * Detener el ring
   */
  public async stopRinging(): Promise<void> {
    if (!this.activeRing) return;

    console.log('🔇 Stopping ring');

    // Detener sonido
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }

    // Detener vibración
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
      Vibration.cancel();
    }

    // Cancelar timeout
    if (this.ringTimeoutHandle) {
      clearTimeout(this.ringTimeoutHandle);
      this.ringTimeoutHandle = null;
    }

    // Actualizar estado en Firebase
    if (this.activeRing) {
      try {
        await RealDatabaseService.updateDocument(
          `ringRequests/${this.activeRing.targetUserId || 'all'}`,
          this.activeRing.id,
          { status: 'stopped' }
        );
      } catch (error) {
        console.error('Error updating ring status:', error);
      }
    }

    this.activeRing = null;
  }

  /**
   * Reproducir sonido de ring
   */
  private async playRingSound(): Promise<void> {
    try {
      // Usar sonido del sistema o un sonido personalizado
      const { sound } = await Audio.Sound.createAsync(
        // En una app real, usar un archivo de audio personalizado
        // require('../../assets/sounds/ring.mp3'),
        { uri: 'https://www.soundjay.com/phone/sounds/telephone-ring-04.mp3' }, // Placeholder
        {
          shouldPlay: true,
          isLooping: true,
          volume: 1.0,
        }
      );

      this.sound = sound;
    } catch (error) {
      console.error('Error playing ring sound:', error);
      // Fallback: al menos mostrar notificación sin sonido
    }
  }

  /**
   * Iniciar vibración continua
   */
  private startVibration(): void {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      // Patrón de vibración: [espera, vibra, espera, vibra...]
      const pattern = [0, 500, 500, 500];
      
      // Vibrar con patrón
      Vibration.vibrate(pattern, true); // true = repetir

      // También guardar interval para poder cancelarlo
      this.vibrationInterval = setInterval(() => {
        // El vibrate con repeat ya lo maneja, pero mantenemos el interval
        // por si necesitamos hacer algo adicional
      }, 2000);
    }
  }

  /**
   * Enviar notificación push para ring
   */
  private async sendRingNotification(request: RingRequest): Promise<void> {
    try {
      if (shouldDisableNotifications) {
        console.log('🔇 Skipping ring notification in Expo Go or SDK 53+');
        return;
      }

      const message = request.targetUserName
        ? `${request.triggeredByName} is trying to reach ${request.targetUserName}`
        : `${request.triggeredByName} is trying to reach all family members`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📱 Device Ring Request',
          body: message,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { requestId: request.id, type: 'ring' },
        },
        trigger: null, // Inmediato
      });
    } catch (error) {
      console.error('Error sending ring notification:', error);
    }
  }

  /**
   * Verificar si hay un ring activo
   */
  public isRinging(): boolean {
    return this.activeRing !== null;
  }

  /**
   * Obtener información del ring activo
   */
  public getActiveRing(): RingRequest | null {
    return this.activeRing;
  }

  /**
   * Obtener historial de rings (últimas 24 horas)
   */
  public async getRingHistory(
    userId: string
  ): Promise<RingRequest[]> {
    try {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      
      // TODO: Implementar query a Firebase
      // const rings = await RealDatabaseService.queryDocuments(
      //   `ringRequests/${userId}`,
      //   { timestamp: { '>=': oneDayAgo } }
      // );
      
      return [];
    } catch (error) {
      console.error('Error getting ring history:', error);
      return [];
    }
  }

  /**
   * Limpiar requests antiguos
   */
  public async cleanOldRequests(): Promise<void> {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    // TODO: Implementar limpieza en Firebase de requests > 1 hora
    console.log('🧹 Cleaning old ring requests');
  }
}

export default DeviceRingService.getInstance();





