import { Platform } from 'react-native';

// Firebase configuration for Web
// Note: Native platforms (iOS/Android) will use @react-native-firebase
// which is configured via native config files (google-services.json, GoogleService-Info.plist)
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

console.log('process:', process.env);
console.log('Firebase API Key:', firebaseConfig.apiKey);

export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';
