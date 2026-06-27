const PUBLIC_VAPID_KEY = 'BIdOd22mLpV5HMsHtmS4uIEl79-zYoJ5b7zpFAGZh000rX_Vx_4MpR9SbnuGUIW4K6YNS17081YMeYayJ1MdUH4';

function urlBase64ToArrayBuffer(b: string): ArrayBuffer {
  const padding = '='.repeat((4 - (b.length % 4)) % 4);
  const safe = (b + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(safe);
  const buffer = new ArrayBuffer(raw.length);
  const arr = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return buffer;
}

let swRegistration: ServiceWorkerRegistration | null = null;

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function initPushNotifications(): Promise<void> {
  if (!isPushSupported()) return;
  
  try {
    swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    const sub = await swRegistration.pushManager.getSubscription();
    if (sub) {
      try {
        const resp = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        const data = await resp.json();
        if (!data.valid) {
          await sub.unsubscribe();
          localStorage.removeItem('notify-subscribed');
        }
      } catch {
        // Ignore network errors during verify
      }
    }
  } catch {
    // Ignore registration errors
  }
}

export async function subscribeToPush(): Promise<boolean> {
  if (Notification.permission === 'denied') return false;
  if (Notification.permission === 'default') await Notification.requestPermission();
  if (Notification.permission !== 'granted') return false;

  try {
    if (!swRegistration) {
      swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    }
    let sub = await swRegistration.pushManager.getSubscription();
    if (sub) return true;

    sub = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToArrayBuffer(PUBLIC_VAPID_KEY),
    });

    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub }),
    });

    localStorage.setItem('notify-subscribed', 'true');

    const notificationOptions: NotificationOptions & { vibrate?: number[] } = {
      body: "You'll get notified of new analyses.",
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'subscribed',
      vibrate: [200, 100, 200],
    };

    swRegistration.showNotification('Subscribed!', notificationOptions);

    return true;
  } catch {
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const sub = await swRegistration?.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    localStorage.removeItem('notify-subscribed');
    return true;
  } catch {
    return false;
  }
}

export function isSubscribed(): boolean {
  return localStorage.getItem('notify-subscribed') === 'true';
}
