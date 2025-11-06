import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { personService } from '../services/personService';
import { Person } from '../types';
import { Picker } from '@react-native-picker/picker';
import TagsInput from '../components/TagsInput';

type EditDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditDetails'>;
type EditDetailsScreenRouteProp = RouteProp<RootStackParamList, 'EditDetails'>;

const EditDetailsScreen: React.FC = () => {
  const navigation = useNavigation<EditDetailsScreenNavigationProp>();
  const route = useRoute<EditDetailsScreenRouteProp>();

  const [person, setPerson] = useState<Person | null>(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other' | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [memoryHooks, setMemoryHooks] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPerson();
  }, [route.params.personId]);

  const loadPerson = async () => {
    try {
      setLoading(true);
      const fetchedPerson = await personService.getPersonById(route.params.personId);
      setPerson(fetchedPerson);
      setName(fetchedPerson.name);
      setGender(fetchedPerson.gender || null);
      setTags(fetchedPerson.tags);
      setMemoryHooks(fetchedPerson.memoryHooks || '');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load person');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setSaving(true);
    try {
      await personService.updatePerson(route.params.personId, {
        name: trimmedName,
        gender,
        tags,
        memoryHooks,
      });
      Alert.alert('Success', 'Person updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update person');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Person',
      'Are you sure you want to delete this person? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await personService.deletePerson(route.params.personId);
              Alert.alert('Success', 'Person deleted successfully!', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Home'),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete person');
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
            editable={!saving}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gender (Optional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              enabled={!saving}
              style={styles.picker}
            >
              <Picker.Item label="Prefer not to specify" value={null} />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <TagsInput
            selectedTags={tags}
            onTagsChange={setTags}
            editable={!saving}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Memory Hooks / Notes for Recall</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter notes to help you remember this person..."
            value={memoryHooks}
            onChangeText={setMemoryHooks}
            multiline
            numberOfLines={6}
            editable={!saving}
            textAlignVertical="top"
          />
        </View>

        {person && (
          <View style={styles.section}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.dateText}>
              {person.createdAt instanceof Date
                ? person.createdAt.toLocaleDateString()
                : new Date(person.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
          disabled={saving}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    minHeight: 120,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});

export default EditDetailsScreen;
