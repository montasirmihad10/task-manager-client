function trimTrailingSlash(value?: string) {
  return value ? value.replace(/\/$/, "") : value;
}

export const envConfig = {
  /** Full API root including /api/v1 */
  baseApi: trimTrailingSlash(process.env.NEXT_PUBLIC_BASE_API_URL),
  /** Public site origin (client) */
  baseUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_BASE_URL),
  /** Socket.IO host (no /api/v1) */
  socketUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_SOCKET_URL),
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  },
};
