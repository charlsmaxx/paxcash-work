// Minimal frontend notification utilities for push subscription
// Uses backend endpoints:
// - GET /api/notifications/vapid-key
// - POST /api/notifications/subscribe
// - POST /api/notifications/unsubscribe

const API_BASE = 'http://localhost:5000';
const SW_PATH = '/push-sw.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getVapidPublicKey() {
  const res = await fetch(`${API_BASE}/api/notifications/vapid-key`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to get VAPID key');
  return data.publicKey;
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) throw new Error('Service workers not supported');
  const registration = await navigator.serviceWorker.register(SW_PATH);
  return registration;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) throw new Error('Notifications not supported');
  const result = await Notification.requestPermission();
  if (result !== 'granted') throw new Error('Notification permission denied');
  return true;
}

export async function subscribeToPush(userId) {
  if (!userId) throw new Error('Missing userId');
  const registration = await registerServiceWorker();
  await requestNotificationPermission();

  const publicKey = await getVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  });

  // Persist subscription with backend
  const res = await fetch(`${API_BASE}/api/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      subscription: {
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys
      }
    })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to subscribe');

  localStorage.setItem('push_subscribed', 'true');
  localStorage.setItem('push_endpoint', subscription.endpoint);

  return subscription;
}

export async function getExistingSubscription() {
  if (!('serviceWorker' in navigator)) return null;
  const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function unsubscribeFromPush(userId) {
  const existing = await getExistingSubscription();
  if (!existing) return false;

  try {
    await existing.unsubscribe();
  } catch (e) {
    // continue regardless
  }

  const endpoint = existing.endpoint;
  await fetch(`${API_BASE}/api/notifications/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, endpoint })
  });

  localStorage.removeItem('push_subscribed');
  localStorage.removeItem('push_endpoint');
  return true;
}

export function isSubscribedLocally() {
  return localStorage.getItem('push_subscribed') === 'true';
}
