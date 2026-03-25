import { Platform } from 'react-native';
import { Person, PersonInput } from '../types';

const OFFLINE_PERSONS_KEY = 'name2face_offline_persons';
const LOGGED_OUT_MODE_KEY = 'name2face_logged_out_mode';

/**
 * Offline storage utility for web
 * Handles localStorage operations for logged out mode (using app without login)
 */
export const offlineStorage = {
  /**
   * Check if logged out mode is enabled
   */
  isLoggedOutMode(): boolean {
    if (Platform.OS !== 'web') return false;
    try {
      const mode = localStorage.getItem(LOGGED_OUT_MODE_KEY);
      return mode === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Enable/disable logged out mode
   */
  setLoggedOutMode(enabled: boolean): void {
    if (Platform.OS !== 'web') return;
    try {
      localStorage.setItem(LOGGED_OUT_MODE_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting logged out mode:', error);
    }
  },

  /**
   * Save person to offline storage
   */
  savePerson(person: Person): void {
    if (Platform.OS !== 'web') return;
    try {
      const persons = this.loadPersons();
      const index = persons.findIndex(p => p.id === person.id);
      if (index >= 0) {
        persons[index] = person;
      } else {
        persons.push(person);
      }
      localStorage.setItem(OFFLINE_PERSONS_KEY, JSON.stringify(persons));
    } catch (error) {
      console.error('Error saving person to offline storage:', error);
    }
  },

  /**
   * Load all persons from offline storage
   */
  loadPersons(): Person[] {
    if (Platform.OS !== 'web') return [];
    try {
      const data = localStorage.getItem(OFFLINE_PERSONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading persons from offline storage:', error);
      return [];
    }
  },

  /**
   * Delete person from offline storage
   */
  deletePerson(personId: string): void {
    if (Platform.OS !== 'web') return;
    try {
      const persons = this.loadPersons();
      const filtered = persons.filter(p => p.id !== personId);
      localStorage.setItem(OFFLINE_PERSONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting person from offline storage:', error);
    }
  },

  /**
   * Clear all offline data
   */
  clearAll(): void {
    if (Platform.OS !== 'web') return;
    try {
      localStorage.removeItem(OFFLINE_PERSONS_KEY);
      localStorage.removeItem(OFFLINE_MODE_KEY);
    } catch (error) {
      console.error('Error clearing offline storage:', error);
    }
  },
};
