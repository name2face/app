import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { Person } from '../types';
import { personService } from '../services/personService';
import { searchService } from '../services/searchService';
import { useAuth } from './AuthContext';

interface DataContextType {
  persons: Person[];
  loading: boolean;
  refreshPersons: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPersons([]);
      setLoading(false);
      return;
    }

    // Subscribe to real-time updates on native platforms
    // This enables offline-first behavior with Firebase persistence
    if (Platform.OS !== 'web') {
      const unsubscribe = personService.subscribeToPersons((updatedPersons) => {
        setPersons(updatedPersons);
        // Update search index with new data
        searchService.updateIndex(updatedPersons);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // On web, just fetch initially
      refreshPersons();
    }
  }, [user]);

  const refreshPersons = async () => {
    if (!user) {
      setPersons([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedPersons = await personService.getAllPersons();
      setPersons(fetchedPersons);
      
      // Update search index
      searchService.updateIndex(fetchedPersons);
    } catch (error) {
      console.error('Error fetching persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const value: DataContextType = {
    persons,
    loading,
    refreshPersons,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
