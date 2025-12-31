import React, { useState } from 'react';
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
import { Note } from '../types';
import { Picker } from '@react-native-picker/picker';
import TagsInput from '../components/TagsInput';

type AddDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddDetails'>;
type AddDetailsScreenRouteProp = RouteProp<RootStackParamList, 'AddDetails'>;

const AddDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AddDetailsScreenNavigationProp>();
  const route = useRoute<AddDetailsScreenRouteProp>();

  const [name, setName] = useState(route.params?.name || '');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other' | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [initialNote, setInitialNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setLoading(true);
    try {
      // Check for duplicate
      const existingPerson = await personService.findPersonByName(trimmedName);

      if (existingPerson) {
        // Show duplicate dialog
        setLoading(false);
        Alert.alert(
          'Duplicate Name Found',
          `A person named "${trimmedName}" already exists. What would you like to do?`,
          [
            {
              text: 'View Existing',
              onPress: () => {
                navigation.replace('PersonDetail', { personId: existingPerson.id });
              },
            },
            {
              text: 'Save Anyway',
              onPress: async () => {
                await saveNewPerson();
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
        return;
      }

      // No duplicate, save directly
      await saveNewPerson();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add person');
      setLoading(false);
    }
  };

  const saveNewPerson = async () => {
    try {
      setLoading(true);
      
      const notes: Note[] = [];
      if (initialNote.trim()) {
        const now = new Date();
        notes.push({
          id: Date.now().toString(),
          content: initialNote.trim(),
          createdAt: now,
          updatedAt: now,
        });
      }

      const person = await personService.addPerson({
        name: name.trim(),
        gender,
        tags,
        notes,
      });
      navigation.replace('PersonDetail', { personId: person.id });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add person');
      setLoading(false);
    }
  };

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
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gender (Optional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              enabled={!loading}
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
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Initial Note</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter notes to help you remember this person..."
            value={initialNote}
            onChangeText={setInitialNote}
            multiline
            numberOfLines={6}
            editable={!loading}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
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
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddDetailsScreen;
