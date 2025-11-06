import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthService } from '../services/firebase';
import { personService } from '../services/personService';
import { searchService } from '../services/searchService';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    const authService = getAuthService();
    
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        setUser(userData);
        
        // Set user ID in services
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
    const authService = getAuthService();
    await authService.signOut();
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
