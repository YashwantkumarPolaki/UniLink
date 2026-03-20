// UniLink Service Worker — handles push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'UniLink'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: data.tag || 'unilink-notification',
    data: data.url || '/',
    vibrate: [100, 50, 100],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === event.notification.data && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(event.notification.data || '/')
    })
  )
})
