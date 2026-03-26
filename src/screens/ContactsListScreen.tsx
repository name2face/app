import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Person } from '../types';
import { personService } from '../services/personService';
import { useAuth } from '../contexts/AuthContext';
import { offlineStorage } from '../utils/offlineStorage';

type ContactsListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ContactsList'>;

const ContactsListScreen: React.FC = () => {
  const navigation = useNavigation<ContactsListScreenNavigationProp>();
  const { user, isLoggedOutMode } = useAuth();
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ContactsListScreen useEffect - user:', user?.uid, 'isLoggedOutMode:', isLoggedOutMode);

    if (isLoggedOutMode) {
      // Load from offline storage
      console.log('Loading contacts from offline storage');
      try {
        const offlinePersons = offlineStorage.loadPersons();
        console.log('Loaded', offlinePersons.length, 'persons from offline storage');
        setPersons(offlinePersons);
      } catch (error) {
        console.error('Error loading offline persons:', error);
        setPersons([]);
      }
      setLoading(false);
    } else if (user) {
      // Load from Firebase
      personService.setUserId(user.uid);
      console.log('ContactsListScreen calling subscribeToPersons');
      const unsubscribe = personService.subscribeToPersons((updatedPersons) => {
        console.log('ContactsListScreen received updatedPersons:', updatedPersons.length);
        setPersons(updatedPersons);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Not logged in and not in offline mode - shouldn't happen but handle gracefully
      console.log('ContactsListScreen: Not logged in and not in offline mode');
      setPersons([]);
      setLoading(false);
    }
  }, [user, isLoggedOutMode]);

  // Refresh data when screen comes into focus (e.g., after editing a person)
  useFocusEffect(
    React.useCallback(() => {
      console.log('ContactsListScreen focused - refreshing data');
      if (isLoggedOutMode) {
        try {
          const offlinePersons = offlineStorage.loadPersons();
          console.log('Refreshed', offlinePersons.length, 'persons from offline storage');
          setPersons(offlinePersons);
        } catch (error) {
          console.error('Error loading offline persons:', error);
        }
      }
    }, [isLoggedOutMode])
  );

  const handlePersonPress = (person: Person) => {
    navigation.navigate('PersonDetail', { personId: person.id });
  };

  const renderItem = ({ item }: { item: Person }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePersonPress(item)}
    >
      <Text style={styles.name}>{item.name}</Text>
      {item.memoryHooks ? (
        <Text style={styles.context} numberOfLines={2}>
          {item.memoryHooks}
        </Text>
      ) : null}
      <View style={styles.footer}>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {persons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Contacts Yet</Text>
          <Text style={styles.emptyText}>
            Add people to your collection to see them here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {persons.length} {persons.length === 1 ? 'Contact' : 'Contacts'}
            </Text>
          </View>
          <FlatList
            data={persons}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  context: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'center',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ContactsListScreen;
