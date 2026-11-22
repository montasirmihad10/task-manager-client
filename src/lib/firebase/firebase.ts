import { envConfig } from "@/config/envConfig";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, Messaging, isSupported } from "firebase/messaging";

function hasFirebaseConfig() {
  return Boolean(
    envConfig.firebase.apiKey &&
      envConfig.firebase.projectId &&
      envConfig.firebase.appId,
  );
}

let app: FirebaseApp | null = null;

if (hasFirebaseConfig()) {
  app =
    getApps().length === 0
      ? initializeApp({
          apiKey: envConfig.firebase.apiKey,
          authDomain: envConfig.firebase.authDomain,
          projectId: envConfig.firebase.projectId,
          storageBucket: envConfig.firebase.storageBucket,
          messagingSenderId: envConfig.firebase.messagingSenderId,
          appId: envConfig.firebase.appId,
        })
      : getApps()[0];
}

export const getMessagingInstance = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined" || !app) return null;

  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch {
    // Missing config or unsupported browser — skip quietly
    return null;
  }
};

export default app;
