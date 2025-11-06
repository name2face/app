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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { personService } from '../services/personService';

type AddPersonScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPerson'>;

const AddPersonScreen: React.FC = () => {
  const navigation = useNavigation<AddPersonScreenNavigationProp>();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickAdd = async () => {
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
              text: 'Add Details',
              onPress: () => {
                navigation.replace('PersonDetail', { personId: existingPerson.id });
              },
            },
            {
              text: 'Save Anyway',
              onPress: async () => {
                await saveNewPerson(trimmedName);
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
      await saveNewPerson(trimmedName);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add person');
      setLoading(false);
    }
  };

  const saveNewPerson = async (personName: string) => {
    try {
      setLoading(true);
      const person = await personService.addPerson({ name: personName });
      Alert.alert('Success', 'Person added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('PersonDetail', { personId: person.id }),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add person');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDetails = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    navigation.navigate('AddDetails', { name: trimmedName });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Quick Add</Text>
        <Text style={styles.description}>
          Enter the person's name to quickly save them. You can add more details later.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter name"
          value={name}
          onChangeText={setName}
          autoFocus
          editable={!loading}
        />

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleQuickAdd}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Save</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleAddDetails}
            disabled={loading}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Add Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  buttons: {
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});

export default AddPersonScreen;
