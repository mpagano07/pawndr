'use client';
import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

export function PushNotificationManager() {
  const { isSupported, isSubscribed, permission, subscribe } = usePushNotifications();

  useEffect(() => {
    if (isSupported && !isSubscribed && permission === 'default') {
      const timer = setTimeout(() => {
        toast('¿Quieres recibir notificaciones de nuevos mensajes y matches?', {
          action: {
            label: 'Activar',
            onClick: () => subscribe(),
          },
          duration: 10000,
          id: 'push-prompt',
        });
      }, 3000); // Wait a bit before prompting
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, isSubscribed, permission, subscribe]);

  return null;
}
