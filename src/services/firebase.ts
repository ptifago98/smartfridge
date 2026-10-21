import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// When you save a file, Expo reloads it (Fast Refresh).
// Without this check, Firebase would be initialised twice and crash.
const isFirstInit = getApps().length === 0;

export const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// initializeAuth + AsyncStorage = the user stays signed in after closing the app.
// With plain getAuth(), you'd get a NEW user (and an empty fridge) on every launch.
export const auth: Auth = isFirstInit
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

export const db = isFirstInit
  ? initializeFirestore(app, { ignoreUndefinedProperties: true })
  : getFirestore(app);