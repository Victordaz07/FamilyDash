/**
 * Hook simplificado para verificar el estado de verificación de email
 * Evita bucles infinitos usando una verificación estática
 */

import { useEffect, useState } from 'react';
import { auth } from '@/config/firebase';

export function useEmailVerificationGate() {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    
    const checkVerification = async () => {
      try {
        // Only check verification if there's an authenticated user
        if (!auth.currentUser) {
          if (mounted) {
            setVerified(false);
            setLoading(false);
          }
          return;
        }

        // Simple check without reloading - just check current state
        const isVerified = auth.currentUser.emailVerified;
        if (mounted) {
          setVerified(isVerified);
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
  }, []); // Empty dependency array to prevent infinite loops

  return { loading, verified };
}
