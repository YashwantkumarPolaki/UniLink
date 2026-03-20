import { useState, useEffect } from 'react'
import API from '../api'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported] = useState(() => 'serviceWorker' in navigator && 'PushManager' in window)

  useEffect(() => {
    if (!isSupported) return
    navigator.serviceWorker.ready.then(reg => {
      reg.pushManager.getSubscription().then(sub => setIsSubscribed(!!sub))
    }).catch(() => {})
  }, [isSupported])

  const requestPermission = async () => {
    if (!isSupported || !VAPID_PUBLIC_KEY) return
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const subJson = sub.toJSON()
      await API.post('/notifications/subscribe', {
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      })
      setIsSubscribed(true)
    } catch {
      // Silently fail — push notifications are optional
    }
  }

  return { isSubscribed, isSupported, requestPermission }
}
