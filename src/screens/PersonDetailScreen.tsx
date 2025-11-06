import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { personService } from '../services/personService';
import { Person } from '../types';

type PersonDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PersonDetail'>;
type PersonDetailScreenRouteProp = RouteProp<RootStackParamList, 'PersonDetail'>;

const PersonDetailScreen: React.FC = () => {
  const navigation = useNavigation<PersonDetailScreenNavigationProp>();
  const route = useRoute<PersonDetailScreenRouteProp>();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerson();
  }, [route.params.personId]);

  const loadPerson = async () => {
    try {
      setLoading(true);
      const fetchedPerson = await personService.getPersonById(route.params.personId);
      setPerson(fetchedPerson);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load person');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (person) {
      navigation.navigate('EditDetails', { personId: person.id });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!person) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Person not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.name}>{person.name}</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {person.gender && (
        <View style={styles.section}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{person.gender}</Text>
        </View>
      )}

      {person.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Tags</Text>
          <View style={styles.tags}>
            {person.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {person.memoryHooks && (
        <View style={styles.section}>
          <Text style={styles.label}>Memory Hooks / Notes</Text>
          <Text style={styles.value}>{person.memoryHooks}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Created</Text>
        <Text style={styles.value}>
          {person.createdAt instanceof Date
            ? person.createdAt.toLocaleDateString()
            : new Date(person.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default PersonDetailScreen;
