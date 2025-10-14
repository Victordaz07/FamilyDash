/**
 * ⏰ SCHEDULE SERVICE — FamilyDash+
 * Servicio para manejar horarios y rutinas familiares
 */

import { firestore } from '@/config/firebase';
import Logger from './Logger';

export interface FamilySchedule {
  id: string;
  title: string;
  description?: string;
  type: 'routine' | 'event' | 'reminder' | 'task';
  frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  time: string;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
  date?: string; // For one-time events
  category: 'morning' | 'afternoon' | 'evening' | 'night' | 'work' | 'school' | 'family' | 'personal';
  isShared: boolean;
  assignedTo?: string[]; // Member IDs
  familyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleCompletion {
  id: string;
  scheduleId: string;
  memberId: string;
  completedAt: string;
  notes?: string;
}

export interface ScheduleStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  shared: number;
  personal: number;
  completionRate: number;
}

class ScheduleService {
  private collection = 'familySchedules';
  private completionsCollection = 'scheduleCompletions';

  /**
   * Obtener todos los horarios de una familia
   */
  async getFamilySchedules(familyId: string): Promise<FamilySchedule[]> {
    try {
      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilySchedule[];
    } catch (error) {
      Logger.error('Error getting family schedules:', error);
      throw new Error('No se pudieron cargar los horarios familiares');
    }
  }

  /**
   * Obtener horarios por categoría
   */
  async getSchedulesByCategory(familyId: string, category: string): Promise<FamilySchedule[]> {
    try {
      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilySchedule[];
    } catch (error) {
      Logger.error('Error getting schedules by category:', error);
      throw new Error('No se pudieron cargar los horarios por categoría');
    }
  }

  /**
   * Obtener horarios por tipo
   */
  async getSchedulesByType(familyId: string, type: string): Promise<FamilySchedule[]> {
    try {
      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .where('type', '==', type)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilySchedule[];
    } catch (error) {
      Logger.error('Error getting schedules by type:', error);
      throw new Error('No se pudieron cargar los horarios por tipo');
    }
  }

  /**
   * Agregar nuevo horario
   */
  async addSchedule(schedule: Omit<FamilySchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await firestore.collection(this.collection).add({
        ...schedule,
        createdAt: now,
        updatedAt: now,
      });

      return docRef.id;
    } catch (error) {
      Logger.error('Error adding schedule:', error);
      throw new Error('No se pudo agregar el horario');
    }
  }

  /**
   * Actualizar horario existente
   */
  async updateSchedule(scheduleId: string, updates: Partial<FamilySchedule>): Promise<void> {
    try {
      await firestore.collection(this.collection).doc(scheduleId).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      Logger.error('Error updating schedule:', error);
      throw new Error('No se pudo actualizar el horario');
    }
  }

  /**
   * Eliminar horario
   */
  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      // Eliminar también las completaciones asociadas
      const completionsSnapshot = await firestore
        .collection(this.completionsCollection)
        .where('scheduleId', '==', scheduleId)
        .get();

      const batch = firestore.batch();
      
      // Eliminar completaciones
      completionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Eliminar horario
      batch.delete(firestore.collection(this.collection).doc(scheduleId));
      
      await batch.commit();
    } catch (error) {
      Logger.error('Error deleting schedule:', error);
      throw new Error('No se pudo eliminar el horario');
    }
  }

  /**
   * Obtener horarios de hoy
   */
  async getTodaySchedules(familyId: string): Promise<FamilySchedule[]> {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const todayStr = today.toISOString().split('T')[0];

      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .get();

      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilySchedule[];

      // Filtrar horarios para hoy
      const todaySchedules = schedules.filter(schedule => {
        switch (schedule.frequency) {
          case 'daily':
            return true;
          case 'weekly':
            return schedule.dayOfWeek === dayOfWeek;
          case 'monthly':
            // Para mensual, verificar si es el día del mes
            return today.getDate() === 1; // Simplificado: solo el primer día del mes
          case 'once':
            return schedule.date === todayStr;
          default:
            return false;
        }
      });

      return todaySchedules.sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
      Logger.error('Error getting today schedules:', error);
      throw new Error('No se pudieron cargar los horarios de hoy');
    }
  }

  /**
   * Obtener horarios de esta semana
   */
  async getWeekSchedules(familyId: string): Promise<FamilySchedule[]> {
    try {
      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .get();

      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilySchedule[];

      // Filtrar horarios para esta semana
      const weekSchedules = schedules.filter(schedule => {
        switch (schedule.frequency) {
          case 'daily':
          case 'weekly':
            return true;
          case 'monthly':
            return true; // Incluir mensuales
          case 'once':
            // Verificar si el evento único es esta semana
            if (schedule.date) {
              const eventDate = new Date(schedule.date);
              const today = new Date();
              const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
              const weekEnd = new Date(today.setDate(today.getDate() + 6));
              return eventDate >= weekStart && eventDate <= weekEnd;
            }
            return false;
          default:
            return false;
        }
      });

      return weekSchedules;
    } catch (error) {
      Logger.error('Error getting week schedules:', error);
      throw new Error('No se pudieron cargar los horarios de la semana');
    }
  }

  /**
   * Marcar horario como completado
   */
  async markScheduleCompleted(scheduleId: string, memberId: string, notes?: string): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await firestore.collection(this.completionsCollection).add({
        scheduleId,
        memberId,
        completedAt: now,
        notes,
      });

      return docRef.id;
    } catch (error) {
      Logger.error('Error marking schedule completed:', error);
      throw new Error('No se pudo marcar el horario como completado');
    }
  }

  /**
   * Obtener completaciones de un horario
   */
  async getScheduleCompletions(scheduleId: string): Promise<ScheduleCompletion[]> {
    try {
      const snapshot = await firestore
        .collection(this.completionsCollection)
        .where('scheduleId', '==', scheduleId)
        .orderBy('completedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScheduleCompletion[];
    } catch (error) {
      Logger.error('Error getting schedule completions:', error);
      throw new Error('No se pudieron cargar las completaciones del horario');
    }
  }

  /**
   * Obtener estadísticas de horarios
   */
  async getScheduleStats(familyId: string): Promise<ScheduleStats> {
    try {
      const schedules = await this.getFamilySchedules(familyId);
      
      const stats: ScheduleStats = {
        total: schedules.length,
        byType: {},
        byCategory: {},
        shared: 0,
        personal: 0,
        completionRate: 0,
      };

      let totalCompletions = 0;
      let totalPossibleCompletions = 0;

      schedules.forEach(schedule => {
        // Contar por tipo
        stats.byType[schedule.type] = (stats.byType[schedule.type] || 0) + 1;
        
        // Contar por categoría
        stats.byCategory[schedule.category] = (stats.byCategory[schedule.category] || 0) + 1;
        
        // Contar por visibilidad
        if (schedule.isShared) {
          stats.shared++;
        } else {
          stats.personal++;
        }

        // Calcular completaciones posibles
        const daysSinceCreation = Math.floor(
          (Date.now() - new Date(schedule.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        switch (schedule.frequency) {
          case 'daily':
            totalPossibleCompletions += daysSinceCreation;
            break;
          case 'weekly':
            totalPossibleCompletions += Math.floor(daysSinceCreation / 7);
            break;
          case 'monthly':
            totalPossibleCompletions += Math.floor(daysSinceCreation / 30);
            break;
          case 'once':
            totalPossibleCompletions += 1;
            break;
        }
      });

      // Obtener completaciones reales
      const completionsSnapshot = await firestore
        .collection(this.completionsCollection)
        .get();

      totalCompletions = completionsSnapshot.size;

      // Calcular tasa de completación
      if (totalPossibleCompletions > 0) {
        stats.completionRate = Math.round((totalCompletions / totalPossibleCompletions) * 100);
      }

      return stats;
    } catch (error) {
      Logger.error('Error getting schedule stats:', error);
      throw new Error('No se pudieron cargar las estadísticas de horarios');
    }
  }

  /**
   * Obtener próximos horarios
   */
  async getUpcomingSchedules(familyId: string, limit: number = 5): Promise<FamilySchedule[]> {
    try {
      const todaySchedules = await this.getTodaySchedules(familyId);
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();

      // Filtrar horarios que aún no han pasado hoy
      const upcomingToday = todaySchedules.filter(schedule => {
        const scheduleTime = parseInt(schedule.time.replace(':', ''));
        return scheduleTime > currentTime;
      });

      // Si no hay suficientes para hoy, agregar de mañana
      if (upcomingToday.length < limit) {
        const tomorrowSchedules = await this.getTomorrowSchedules(familyId);
        const remaining = limit - upcomingToday.length;
        return [...upcomingToday, ...tomorrowSchedules.slice(0, remaining)];
      }

      return upcomingToday.slice(0, limit);
    } catch (error) {
      Logger.error('Error getting upcoming schedules:', error);
      throw new Error('No se pudieron cargar los próximos horarios');
    }
  }

  /**
   * Obtener horarios de mañana
   */
  private async getTomorrowSchedules(familyId: string): Promise<FamilySchedule[]> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfWeek = tomorrow.getDay();
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .get();

      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilySchedule[];

      // Filtrar horarios para mañana
      const tomorrowSchedules = schedules.filter(schedule => {
        switch (schedule.frequency) {
          case 'daily':
            return true;
          case 'weekly':
            return schedule.dayOfWeek === dayOfWeek;
          case 'monthly':
            return tomorrow.getDate() === 1;
          case 'once':
            return schedule.date === tomorrowStr;
          default:
            return false;
        }
      });

      return tomorrowSchedules.sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
      Logger.error('Error getting tomorrow schedules:', error);
      return [];
    }
  }

  /**
   * Buscar horarios por título o descripción
   */
  async searchSchedules(familyId: string, query: string): Promise<FamilySchedule[]> {
    try {
      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .get();

      const schedules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilySchedule[];

      // Filtrar por título o descripción (búsqueda local)
      const filteredSchedules = schedules.filter(schedule => 
        schedule.title.toLowerCase().includes(query.toLowerCase()) ||
        (schedule.description && schedule.description.toLowerCase().includes(query.toLowerCase()))
      );

      return filteredSchedules;
    } catch (error) {
      Logger.error('Error searching schedules:', error);
      throw new Error('No se pudo buscar los horarios');
    }
  }

  /**
   * Validar formato de hora
   */
  validateTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Validar formato de fecha
   */
  validateDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }

  /**
   * Obtener horarios por visibilidad
   */
  async getSchedulesByVisibility(familyId: string, isShared: boolean): Promise<FamilySchedule[]> {
    try {
      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .where('isShared', '==', isShared)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FamilySchedule[];
    } catch (error) {
      Logger.error('Error getting schedules by visibility:', error);
      throw new Error('No se pudieron cargar los horarios por visibilidad');
    }
  }
}

export const scheduleService = new ScheduleService();




