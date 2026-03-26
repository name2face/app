import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthService } from '../services/firebase';
import { personService } from '../services/personService';
import { searchService } from '../services/searchService';
import { offlineStorage } from '../utils/offlineStorage';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedOutMode: boolean;
  isNetworkOffline: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  enterLoggedOutMode: () => void;
  exitLoggedOutMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedOutMode, setIsLoggedOutMode] = useState(false);
  const [isNetworkOffline, setIsNetworkOffline] = useState(false);
  
  console.log('🎯 AuthProvider render - user:', user?.email || 'NULL', 'isLoggedOutMode:', isLoggedOutMode, 'loading:', loading);

  useEffect(() => {
    // Check if logged out mode is already enabled
    const loggedOutMode = offlineStorage.isLoggedOutMode();
    setIsLoggedOutMode(loggedOutMode);

    // Add network connectivity listeners
    const handleOnline = () => {
      console.log('🌐 Network is online');
      setIsNetworkOffline(false);
    };
    const handleOffline = () => {
      console.log('🌐 Network is offline');
      setIsNetworkOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsNetworkOffline(!navigator.onLine);

    // Cleanup function for network listeners
    const cleanupNetworkListeners = () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };

    // Handle logged out mode
    if (loggedOutMode) {
      console.log('🎯 In logged out mode - skipping Firebase auth');
      personService.setUserId(null);
      searchService.setUserId(null);
      personService.setLoggedOutMode(true);
      setLoading(false);
      return cleanupNetworkListeners;
    }

    // Normal Firebase authentication flow
    const authService = getAuthService();
    
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      console.log('🔔 onAuthStateChanged fired. User:', firebaseUser ? firebaseUser.email : 'NULL');
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        console.log('✅ Setting user:', userData.email);
        setUser(userData);
        
        // Set user ID in services
        personService.setUserId(firebaseUser.uid);
        searchService.setUserId(firebaseUser.uid);
      } else {
        console.log('🔴 User logged out - setting user to null');
        setUser(null);
        personService.setUserId(null);
        searchService.setUserId(null);
      }
      setLoading(false);
    });

    // Return cleanup function for both network listeners and Firebase subscription
    return () => {
      cleanupNetworkListeners();
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const authService = getAuthService();
    await authService.signInWithEmailAndPassword(email, password);
  };

  const signUp = async (email: string, password: string) => {
    const authService = getAuthService();
    await authService.createUserWithEmailAndPassword(email, password);
  };

  const signOut = async () => {
    console.log('🔴 AuthContext.signOut() called');
    const authService = getAuthService();
    console.log('📍 Got auth service:', authService ? 'YES' : 'NO');
    try {
      const result = await authService.signOut();
      console.log('✅ authService.signOut() completed:', result);
    } catch (err) {
      console.error('❌ authService.signOut() error:', err);
      throw err;
    }
  };

  const enterLoggedOutMode = () => {
    console.log('⬇️ Entering logged out mode');
    offlineStorage.setLoggedOutMode(true);
    setIsLoggedOutMode(true);
    setUser(null);
    personService.setUserId(null);
    personService.setLoggedOutMode(true);
    searchService.setUserId(null);
    searchService.setLoggedOutMode(true);
  };

  const exitLoggedOutMode = () => {
    console.log('⬇️ Exiting logged out mode, re-initializing Firebase auth listener');
    offlineStorage.setLoggedOutMode(false);
    setIsLoggedOutMode(false);
    personService.setLoggedOutMode(false);
    searchService.setLoggedOutMode(false);
    // Re-initialize Firebase auth listener
    const authService = getAuthService();
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        setUser(userData);
        personService.setUserId(firebaseUser.uid);
        searchService.setUserId(firebaseUser.uid);
      } else {
        setUser(null);
        personService.setUserId(null);
        searchService.setUserId(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  };

  const sendPasswordResetEmail = async (email: string) => {
    const authService = getAuthService();
    try {
      console.log('🔐 Sending password reset email to:', email);
      await authService.sendPasswordResetEmail(email);
      console.log('✅ Password reset email sent successfully');
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isLoggedOutMode,
    isNetworkOffline,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    enterLoggedOutMode,
    exitLoggedOutMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
