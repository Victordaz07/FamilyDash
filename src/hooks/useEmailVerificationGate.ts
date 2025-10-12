/**
 * Hook para verificar el estado de verificación de email
 * Recarga el usuario y sincroniza el estado con Firestore
 */

import { useEffect, useState } from 'react';
import { RealAuthService } from '../services/auth/RealAuthService';

const authService = new RealAuthService();

export function useEmailVerificationGate() {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    
    const checkVerification = async () => {
      try {
        const ok = await authService.reloadAndSyncEmailVerified();
        if (mounted) {
          setVerified(ok);
        }
      } catch (error) {
        console.error('Error checking email verification:', error);
        if (mounted) {
          setVerified(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkVerification();

    return () => { 
      mounted = false; 
    };
  }, []);

  return { loading, verified };
}
