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
import { Person, Note } from '../types';
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
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
      setNotes(fetchedPerson.notes || []);
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
        notes,
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

  const addNote = () => {
    if (!newNoteContent.trim()) return;
    
    const now = new Date();
    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent.trim(),
      createdAt: now,
      updatedAt: now,
    };
    
    setNotes([...notes, newNote]);
    setNewNoteContent('');
  };

  const updateNote = () => {
    if (!editingNoteId || !newNoteContent.trim()) return;
    
    setNotes(notes.map(n => {
      if (n.id === editingNoteId) {
        return {
          ...n,
          content: newNoteContent.trim(),
          updatedAt: new Date(),
        };
      }
      return n;
    }));
    
    setEditingNoteId(null);
    setNewNoteContent('');
  };

  const deleteNote = (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setNotes(notes.filter(n => n.id !== id)),
        },
      ]
    );
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setNewNoteContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setNewNoteContent('');
  };

  const formatDate = (date: Date | any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <Text style={styles.label}>Notes</Text>
          
          {notes.map(note => (
            <View key={note.id} style={styles.noteItem}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteDate}>
                  {formatDate(note.createdAt)}
                  {note.updatedAt > note.createdAt && ` (Updated: ${formatDate(note.updatedAt)})`}
                </Text>
                <View style={styles.noteActions}>
                  <TouchableOpacity onPress={() => startEditing(note)} style={styles.noteActionBtn}>
                    <Text style={styles.editActionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteNote(note.id)} style={styles.noteActionBtn}>
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.noteContent}>{note.content}</Text>
            </View>
          ))}

          <View style={styles.addNoteContainer}>
            <Text style={styles.subLabel}>{editingNoteId ? 'Edit Note' : 'Add New Note'}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter note content..."
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              numberOfLines={4}
              editable={!saving}
              textAlignVertical="top"
            />
            <View style={styles.noteInputActions}>
              {editingNoteId ? (
                <>
                  <TouchableOpacity
                    style={[styles.smallButton, styles.cancelButton]}
                    onPress={cancelEditing}
                    disabled={saving}
                  >
                    <Text style={styles.smallButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallButton, styles.saveButton]}
                    onPress={updateNote}
                    disabled={saving || !newNoteContent.trim()}
                  >
                    <Text style={styles.smallButtonText}>Update Note</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.smallButton, styles.saveButton]}
                  onPress={addNote}
                  disabled={saving || !newNoteContent.trim()}
                >
                  <Text style={styles.smallButtonText}>Add Note</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {person && (
          <View style={styles.section}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.dateText}>
              {formatDate(person.createdAt)}
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
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
          disabled={saving}
        >
          <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete Person</Text>
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
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
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
    minHeight: 80,
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
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  noteItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 12,
    color: '#888',
  },
  noteActions: {
    flexDirection: 'row',
  },
  noteActionBtn: {
    marginLeft: 10,
  },
  editActionText: {
    color: '#007AFF',
    fontSize: 12,
  },
  deleteActionText: {
    color: '#FF3B30',
    fontSize: 12,
  },
  noteContent: {
    fontSize: 15,
    color: '#333',
  },
  addNoteContainer: {
    marginTop: 10,
  },
  noteInputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#8e8e93',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EditDetailsScreen;
