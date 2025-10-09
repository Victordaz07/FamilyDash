/**
 * 📍 LOCATION SERVICE — FamilyDash+
 * Servicio para manejar ubicaciones guardadas de la familia
 */

import { firestore } from '../config/firebase';
import Logger from './Logger';

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: 'home' | 'work' | 'school' | 'hospital' | 'shopping' | 'other';
  description?: string;
  isShared: boolean;
  familyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyHome {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  familyId: string;
  createdAt: string;
  updatedAt: string;
}

class LocationService {
  private collection = 'locations';
  private familyHomeCollection = 'familyHomes';

  /**
   * Obtener todas las ubicaciones guardadas de una familia
   */
  async getFamilyLocations(familyId: string): Promise<SavedLocation[]> {
    try {
      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedLocation[];
    } catch (error) {
      Logger.error('Error getting family locations:', error);
      throw new Error('No se pudieron cargar las ubicaciones');
    }
  }

  /**
   * Obtener ubicaciones por categoría
   */
  async getLocationsByCategory(familyId: string, category: string): Promise<SavedLocation[]> {
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
      })) as SavedLocation[];
    } catch (error) {
      Logger.error('Error getting locations by category:', error);
      throw new Error('No se pudieron cargar las ubicaciones por categoría');
    }
  }

  /**
   * Agregar nueva ubicación
   */
  async addLocation(location: Omit<SavedLocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await firestore.collection(this.collection).add({
        ...location,
        createdAt: now,
        updatedAt: now,
      });

      return docRef.id;
    } catch (error) {
      Logger.error('Error adding location:', error);
      throw new Error('No se pudo agregar la ubicación');
    }
  }

  /**
   * Actualizar ubicación existente
   */
  async updateLocation(locationId: string, updates: Partial<SavedLocation>): Promise<void> {
    try {
      await firestore.collection(this.collection).doc(locationId).update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      Logger.error('Error updating location:', error);
      throw new Error('No se pudo actualizar la ubicación');
    }
  }

  /**
   * Eliminar ubicación
   */
  async deleteLocation(locationId: string): Promise<void> {
    try {
      await firestore.collection(this.collection).doc(locationId).delete();
    } catch (error) {
      Logger.error('Error deleting location:', error);
      throw new Error('No se pudo eliminar la ubicación');
    }
  }

  /**
   * Obtener casa principal de la familia
   */
  async getFamilyHome(familyId: string): Promise<FamilyHome | null> {
    try {
      const snapshot = await firestore
        .collection(this.familyHomeCollection)
        .where('familyId', '==', familyId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as FamilyHome;
    } catch (error) {
      Logger.error('Error getting family home:', error);
      throw new Error('No se pudo cargar la información de la casa');
    }
  }

  /**
   * Establecer casa principal de la familia
   */
  async setFamilyHome(home: Omit<FamilyHome, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      
      // Verificar si ya existe una casa para esta familia
      const existingHome = await this.getFamilyHome(home.familyId);
      
      if (existingHome) {
        // Actualizar casa existente
        await firestore.collection(this.familyHomeCollection).doc(existingHome.id).update({
          ...home,
          updatedAt: now,
        });
        return existingHome.id;
      } else {
        // Crear nueva casa
        const docRef = await firestore.collection(this.familyHomeCollection).add({
          ...home,
          createdAt: now,
          updatedAt: now,
        });
        return docRef.id;
      }
    } catch (error) {
      Logger.error('Error setting family home:', error);
      throw new Error('No se pudo establecer la casa familiar');
    }
  }

  /**
   * Eliminar casa principal de la familia
   */
  async deleteFamilyHome(familyId: string): Promise<void> {
    try {
      const home = await this.getFamilyHome(familyId);
      if (home) {
        await firestore.collection(this.familyHomeCollection).doc(home.id).delete();
      }
    } catch (error) {
      Logger.error('Error deleting family home:', error);
      throw new Error('No se pudo eliminar la casa familiar');
    }
  }

  /**
   * Buscar ubicaciones por nombre o dirección
   */
  async searchLocations(familyId: string, query: string): Promise<SavedLocation[]> {
    try {
      const snapshot = await firestore
        .collection(this.collection)
        .where('familyId', '==', familyId)
        .get();

      const locations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedLocation[];

      // Filtrar por nombre o dirección (búsqueda local)
      const filteredLocations = locations.filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase()) ||
        location.city.toLowerCase().includes(query.toLowerCase())
      );

      return filteredLocations;
    } catch (error) {
      Logger.error('Error searching locations:', error);
      throw new Error('No se pudo buscar las ubicaciones');
    }
  }

  /**
   * Obtener ubicaciones compartidas vs personales
   */
  async getLocationsByVisibility(familyId: string, isShared: boolean): Promise<SavedLocation[]> {
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
      })) as SavedLocation[];
    } catch (error) {
      Logger.error('Error getting locations by visibility:', error);
      throw new Error('No se pudieron cargar las ubicaciones por visibilidad');
    }
  }

  /**
   * Obtener estadísticas de ubicaciones
   */
  async getLocationStats(familyId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    shared: number;
    personal: number;
  }> {
    try {
      const locations = await this.getFamilyLocations(familyId);
      
      const stats = {
        total: locations.length,
        byCategory: {} as Record<string, number>,
        shared: 0,
        personal: 0,
      };

      locations.forEach(location => {
        // Contar por categoría
        stats.byCategory[location.category] = (stats.byCategory[location.category] || 0) + 1;
        
        // Contar por visibilidad
        if (location.isShared) {
          stats.shared++;
        } else {
          stats.personal++;
        }
      });

      return stats;
    } catch (error) {
      Logger.error('Error getting location stats:', error);
      throw new Error('No se pudieron cargar las estadísticas de ubicaciones');
    }
  }

  /**
   * Obtener ubicaciones frecuentes (más utilizadas)
   */
  async getFrequentLocations(familyId: string, limit: number = 5): Promise<SavedLocation[]> {
    try {
      // Por ahora retornamos las más recientes
      // En el futuro se podría implementar un sistema de uso/visitas
      const locations = await this.getFamilyLocations(familyId);
      return locations.slice(0, limit);
    } catch (error) {
      Logger.error('Error getting frequent locations:', error);
      throw new Error('No se pudieron cargar las ubicaciones frecuentes');
    }
  }

  /**
   * Validar coordenadas
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  /**
   * Calcular distancia entre dos puntos (en kilómetros)
   */
  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const locationService = new LocationService();
