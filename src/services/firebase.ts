import { Platform } from 'react-native';
import { firebaseConfig, isWeb, isNative } from '../config/firebase';

// Types for both Firebase implementations
export interface FirebaseAuthService {
  signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  getCurrentUser: () => any;
  onAuthStateChanged: (callback: (user: any) => void) => () => void;
}

export interface FirebaseFirestoreService {
  collection: (path: string) => any;
  doc: (path: string) => any;
  query: (...args: any[]) => any;
  where: (...args: any[]) => any;
  orderBy: (...args: any[]) => any;
  limit: (count: number) => any;
  getDocs: (query: any) => Promise<any>;
  getDoc: (docRef: any) => Promise<any>;
  addDoc: (collectionRef: any, data: any) => Promise<any>;
  setDoc: (docRef: any, data: any, options?: any) => Promise<void>;
  updateDoc: (docRef: any, data: any) => Promise<void>;
  deleteDoc: (docRef: any) => Promise<void>;
  onSnapshot: (query: any, callback: (snapshot: any) => void, onError?: (error: any) => void) => () => void;
  enablePersistence: () => Promise<void>;
}

export interface FirebaseStorageService {
  ref: (path: string) => any;
  uploadBytes: (ref: any, data: any) => Promise<any>;
  getDownloadURL: (ref: any) => Promise<string>;
  deleteObject: (ref: any) => Promise<void>;
}

let authService: FirebaseAuthService | null = null;
let firestoreService: FirebaseFirestoreService | null = null;
let storageService: FirebaseStorageService | null = null;

// Initialize Firebase based on platform
export const initializeFirebase = async () => {
  if (isWeb) {
    // Web Firebase initialization
    const { initializeApp } = await import('firebase/app');
    const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = await import('firebase/auth');
    const { getFirestore, collection, doc, query, where, orderBy, limit, getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, enableIndexedDbPersistence } = await import('firebase/firestore');
    const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = await import('firebase/storage');

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);

    // Note: Web version does not enable offline persistence as per spec
    // Only native platforms use offline persistence

    authService = {
      signInWithEmailAndPassword: (email, password) => signInWithEmailAndPassword(auth, email, password),
      createUserWithEmailAndPassword: (email, password) => createUserWithEmailAndPassword(auth, email, password),
      signOut: () => signOut(auth),
      getCurrentUser: () => auth.currentUser,
      onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
    };

    firestoreService = {
      collection: (path) => collection(firestore, path),
      doc: (path) => doc(firestore, path),
      query,
      where,
      orderBy,
      limit,
      getDocs,
      getDoc,
      addDoc,
      setDoc,
      updateDoc,
      deleteDoc,
      onSnapshot: (q, callback, onError) => onSnapshot(q, callback, onError),
      enablePersistence: async () => {
        // Web version is online-only per spec
        console.log('Web version: offline persistence not enabled');
      },
    };

    storageService = {
      ref: (path) => ref(storage, path),
      uploadBytes: (r, data) => uploadBytes(r, data),
      getDownloadURL: (r) => getDownloadURL(r),
      deleteObject: (r) => deleteObject(r),
    };
  } else if (isNative) {
    // Native Firebase initialization using @react-native-firebase
    const auth = (await import('@react-native-firebase/auth')).default;
    const firestore = (await import('@react-native-firebase/firestore')).default;
    const storage = (await import('@react-native-firebase/storage')).default;

    // Enable offline persistence for native platforms
    await firestore().settings({ persistence: true });

    authService = {
      signInWithEmailAndPassword: (email, password) => auth().signInWithEmailAndPassword(email, password),
      createUserWithEmailAndPassword: (email, password) => auth().createUserWithEmailAndPassword(email, password),
      signOut: () => auth().signOut(),
      getCurrentUser: () => auth().currentUser,
      onAuthStateChanged: (callback) => auth().onAuthStateChanged(callback),
    };

    // Create a compatible wrapper for native Firestore
    // Native Firebase uses a different query pattern - queries are built by chaining methods on collections
    firestoreService = {
      collection: (path) => firestore().collection(path),
      doc: (path) => firestore().doc(path),
      // For native, query just returns the collection/query passed to it
      // The actual filtering is done via .where() calls on the collection
      query: (collection, ...constraints) => {
        let query = collection;
        constraints.forEach(constraint => {
          if (constraint && typeof constraint === 'object') {
            if (constraint.type === 'where') {
              query = query.where(constraint.field, constraint.op, constraint.value);
            } else if (constraint.type === 'orderBy') {
              query = query.orderBy(constraint.field, constraint.direction);
            } else if (constraint.type === 'limit') {
              query = query.limit(constraint.count);
            }
          }
        });
        return query;
      },
      where: (field, op, value) => ({ type: 'where', field, op, value }),
      orderBy: (field, direction) => ({ type: 'orderBy', field, direction }),
      limit: (count) => ({ type: 'limit', count }),
      getDocs: async (collectionRef) => {
        const snapshot = await collectionRef.get();
        return {
          ...snapshot,
          empty: snapshot.empty,
          docs: snapshot.docs,
        };
      },
      getDoc: async (docRef) => {
        const snapshot = await docRef.get();
        return {
          ...snapshot,
          exists: snapshot.exists,
          id: snapshot.id,
          data: () => snapshot.data(),
        };
      },
      addDoc: async (collectionRef, data) => {
        return await collectionRef.add(data);
      },
      setDoc: async (docRef, data, options) => {
        return await docRef.set(data, options);
      },
      updateDoc: async (docRef, data) => {
        return await docRef.update(data);
      },
      deleteDoc: async (docRef) => {
        return await docRef.delete();
      },
      onSnapshot: (query, callback, onError) => {
        return query.onSnapshot((snapshot: any) => {
          callback({
            ...snapshot,
            empty: snapshot.empty,
            docs: snapshot.docs,
          });
        }, onError);
      },
      enablePersistence: async () => {
        console.log('Native: offline persistence enabled by default');
      },
    };

    storageService = {
      ref: (path) => storage().ref(path),
      uploadBytes: async (ref, data) => {
        // Convert to format expected by native
        return await ref.put(data);
      },
      getDownloadURL: async (ref) => {
        return await ref.getDownloadURL();
      },
      deleteObject: async (ref) => {
        return await ref.delete();
      },
    };
  }

  return { authService, firestoreService, storageService };
};

export const getAuthService = (): FirebaseAuthService => {
  if (!authService) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.');
  }
  return authService;
};

export const getFirestoreService = (): FirebaseFirestoreService => {
  if (!firestoreService) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.');
  }
  return firestoreService;
};

export const getStorageService = (): FirebaseStorageService => {
  if (!storageService) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.');
  }
  return storageService;
};
