// Add custom jest matchers from @testing-library/react-native
import '@testing-library/react-native/extend-expect';

// Mock Firebase
jest.mock('./src/services/firebase', () => ({
  initializeFirebase: jest.fn().mockResolvedValue({}),
  getAuthService: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    onAuthStateChanged: jest.fn(),
  })),
  getFirestoreService: jest.fn(() => ({
    collection: jest.fn(),
    doc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    onSnapshot: jest.fn(),
    enablePersistence: jest.fn(),
  })),
  getStorageService: jest.fn(() => ({
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
    deleteObject: jest.fn(),
  })),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
