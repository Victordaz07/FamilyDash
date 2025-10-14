import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Logger from './Logger';
import * as Device from 'expo-device';

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

if (!shouldDisableNotifications) {
  // Only configure notifications if not in Expo Go or SDK 53+
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('⚠️ Notifications disabled due to Expo Go compatibility:', error.message);
  }
} else {
  console.warn('⚠️ Notifications disabled - Running in Expo Go or SDK 53+');
  Logger.debug('🔇 Notifications disabled in Expo Go (use development build for push notifications)');
}

// Tipos para las notificaciones
export interface TaskNotification {
  id: string;
  title: string;
  assignedTo: string;
  dueDate?: string;
}

export interface GoalNotification {
  id: string;
  title: string;
  assignedTo: string;
  category: string;
}

export interface PenaltyNotification {
  id: string;
  title: string;
  assignedTo: string;
  duration: string;
  reason: string;
}

/**
 * Solicitar permisos de notificación
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Skip notification setup in Expo Go or SDK 53+
  if (shouldDisableNotifications) {
    Logger.debug('🔇 Skipping notification permissions in Expo Go or SDK 53+');
    return false;
  }

  try {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Logger.debug('Permisos de notificación denegados');
        return false;
      }

      return true;
    } else {
      Logger.debug('Debe usar un dispositivo físico para las notificaciones');
      return false;
    }
  } catch (error) {
    Logger.error('Error solicitando permisos de notificación:', error);
    return false;
  }
}

/**
 * Configurar canal de notificación para Android
 */
export async function configureNotificationChannel(): Promise<void> {
  try {
    if (shouldDisableNotifications) {
      Logger.debug('🔇 Skipping notification channel configuration in Expo Go or SDK 53+');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('familydash-default', {
        name: 'FamilyDash Default',
        description: 'Notificaciones por defecto de FamilyDash',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });

      // Canal para tareas
      await Notifications.setNotificationChannelAsync('familydash-tasks', {
        name: 'Tareas Familiares',
        description: 'Notificaciones de nuevas tareas asignadas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });

      // Canal para metas
      await Notifications.setNotificationChannelAsync('familydash-goals', {
        name: 'Metas Familiares',
        description: 'Notificaciones de nuevas metas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });

      // Canal para penas
      await Notifications.setNotificationChannelAsync('familydash-penalties', {
        name: 'Penas Familiares',
        description: 'Notificaciones de nuevas penas asignadas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F59E0B',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });
    }
  } catch (error) {
    Logger.error('Error configurando canales de notificación:', error);
  }
}

/**
 * Programar notificación de nueva tarea
 */
export async function scheduleTaskNotification(task: TaskNotification): Promise<void> {
  try {
    if (shouldDisableNotifications) {
      Logger.debug('🔇 Skipping task notification in Expo Go or SDK 53+');
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 Nueva Tarea Asignada',
        body: `${task.assignedTo}: ${task.title}${task.dueDate ? ` - Vence: ${task.dueDate}` : ''}`,
        data: {
          type: 'task',
          id: task.id,
          assignedTo: task.assignedTo,
          title: task.title
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { seconds: 2 }, // 2 segundos después para testing
    });

    Logger.debug(`Notificación de tarea programada: ${task.title}`);
  } catch (error) {
    Logger.error('Error programando notificación de tarea:', error);
  }
}

/**
 * Programar notificación de nueva meta
 */
export async function scheduleGoalNotification(goal: GoalNotification): Promise<void> {
  try {
    if (shouldDisableNotifications) {
      Logger.debug('🔇 Skipping goal notification in Expo Go or SDK 53+');
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Nueva Meta Creada',
        body: `${goal.assignedTo}: ${goal.title} (${goal.category})`,
        data: {
          type: 'goal',
          id: goal.id,
          assignedTo: goal.assignedTo,
          title: goal.title,
          category: goal.category
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { seconds: 2 }, // 2 segundos después para testing
    });

    Logger.debug(`Notificación de meta programada: ${goal.title}`);
  } catch (error) {
    Logger.error('Error programando notificación de meta:', error);
  }
}

/**
 * Programar notificación de nueva pena
 */
export async function schedulePenaltyNotification(penalty: PenaltyNotification): Promise<void> {
  try {
    if (shouldDisableNotifications) {
      Logger.debug('🔇 Skipping penalty notification in Expo Go or SDK 53+');
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Nueva Pena Asignada',
        body: `${penalty.assignedTo}: ${penalty.title} - ${penalty.duration} (${penalty.reason})`,
        data: {
          type: 'penalty',
          id: penalty.id,
          assignedTo: penalty.assignedTo,
          title: penalty.title,
          duration: penalty.duration,
          reason: penalty.reason
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: { seconds: 2 }, // 2 segundos después para testing
    });

    Logger.debug(`Notificación de pena programada: ${penalty.title}`);
  } catch (error) {
    Logger.error('Error programando notificación de pena:', error);
  }
}

/**
 * Cancelar todas las notificaciones pendientes
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    if (shouldDisableNotifications) {
      Logger.debug('🔇 Skipping cancel notifications in Expo Go or SDK 53+');
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    Logger.debug('Todas las notificaciones canceladas');
  } catch (error) {
    Logger.error('Error cancelando notificaciones:', error);
  }
}

/**
 * Obtener el token de notificación (para futuras implementaciones con servidor)
 */
export async function getNotificationToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      Logger.debug('Debe usar un dispositivo físico para obtener el token');
      return null;
    }

    // Temporarily disabled for Expo Go compatibility
    // const token = await Notifications.getExpoPushTokenAsync();
    // return token.data;
    return null;
  } catch (error) {
    Logger.error('Error obteniendo token de notificación:', error);
    return null;
  }
}

/**
 * Inicializar el sistema de notificaciones
 */
export async function initializeNotifications(): Promise<boolean> {
  try {
    Logger.debug('Inicializando sistema de notificaciones...');

    // Configurar canales
    await configureNotificationChannel();

    // Solicitar permisos
    const hasPermission = await requestNotificationPermissions();

    if (hasPermission) {
      Logger.debug('✅ Sistema de notificaciones inicializado correctamente');
      return true;
    } else {
      Logger.debug('❌ No se pudieron obtener permisos de notificación');
      return false;
    }
  } catch (error) {
    Logger.error('Error inicializando notificaciones:', error);
    return false;
  }
}



