import { useState, useEffect } from 'react';
import { initPushNotifications, isSubscribed, subscribeToPush, unsubscribeFromPush, isPushSupported } from '../services/notificationService';

export function useNotification() {
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const hasSupport = isPushSupported();
      setSupported(hasSupport);
      
      if (hasSupport) {
        await initPushNotifications();
      }
      
      setSubscribed(isSubscribed());
      setLoading(false);
    };
    check();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    const ok = await subscribeToPush();
    setSubscribed(ok);
    setLoading(false);
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    await unsubscribeFromPush();
    setSubscribed(false);
    setLoading(false);
  };

  return { subscribed, supported, loading, subscribe: handleSubscribe, unsubscribe: handleUnsubscribe };
}
