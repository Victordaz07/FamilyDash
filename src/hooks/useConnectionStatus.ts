/**
 * 📡 useConnectionStatus Hook
 * Hook reutilizable para monitorear estado de conexión
 * Elimina código duplicado en Dashboard, Settings, y otros screens
 */

import { useState, useEffect } from 'react';
import RealDatabaseService from '../services/database/RealDatabaseService';

interface ConnectionStatus {
  isConnected: boolean;
  lastSyncTime: Date;
  checkConnection: () => Promise<void>;
}

export const useConnectionStatus = (
  checkInterval: number = 30000 // 30 segundos por defecto
): ConnectionStatus => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const checkConnection = async () => {
    try {
      const connected = await RealDatabaseService.checkConnection();
      setIsConnected(connected);
      if (connected) {
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Check inmediatamente
    checkConnection();

    // Luego check periódico
    const interval = setInterval(checkConnection, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return {
    isConnected,
    lastSyncTime,
    checkConnection,
  };
};
