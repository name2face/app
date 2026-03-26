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
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { searchService } from '../services/searchService';
import TagsInput from '../components/TagsInput';

type SearchQueryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SearchQuery'>;

const SearchQueryScreen: React.FC = () => {
  const navigation = useNavigation<SearchQueryScreenNavigationProp>();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [memoryHooks, setMemoryHooks] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleGender = (selectedGender: 'Female' | 'Male') => {
    // If clicking the same gender, deselect it (toggle to null)
    // If clicking a different gender, select it
    // Can only have one gender selected at a time
    setGender(prev => prev === selectedGender ? null : selectedGender);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const query = {
        name: name.trim() || undefined,
        genders: gender ? [gender] : undefined,
        tags: tags.length > 0 ? tags : undefined,
        memoryHooks: memoryHooks.trim() || undefined,
        notes: memoryHooks.trim() || undefined,
      };
      console.log('🔎 SearchQueryScreen sending query:', JSON.stringify(query, null, 2));
      console.log('   - name:', query.name);
      console.log('   - genders:', query.genders);
      console.log('   - tags:', query.tags);
      console.log('   - memoryHooks:', query.memoryHooks);
      
      const results = await searchService.search(query);
      console.log('🔎 Got results:', results.length);
      
      navigation.navigate('SearchResults', { results });
    } catch (error: any) {
      console.error('🔎 Search error:', error);
      Alert.alert('Error', error.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const hasQuery = name.trim() || gender || tags.length > 0 || memoryHooks.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Search by name..."
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderButtonContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'Female' && styles.genderButtonSelected,
              ]}
              onPress={() => toggleGender('Female')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'Female' && styles.genderButtonTextSelected,
                ]}
              >
                👩 Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'Male' && styles.genderButtonSelected,
              ]}
              onPress={() => toggleGender('Male')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  gender === 'Male' && styles.genderButtonTextSelected,
                ]}
              >
                👨 Male
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Quick Tags</Text>
          <TagsInput
            selectedTags={tags}
            onTagsChange={setTags}
            editable={!loading}
            allowCustomTags={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Memory Hooks / Notes</Text>
          {Platform.OS === 'web' && (
            <Text style={styles.note}>
              Note: Full-text search on memory hooks has limited capabilities on web.
            </Text>
          )}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Search in your notes..."
            value={memoryHooks}
            onChangeText={setMemoryHooks}
            multiline
            numberOfLines={4}
            editable={!loading}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.searchButton, !hasQuery && styles.disabledButton]}
          onPress={handleSearch}
          disabled={loading || !hasQuery}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Search</Text>
          )}
        </TouchableOpacity>

        {!hasQuery && (
          <Text style={styles.hint}>
            Please enter at least one search criterion
          </Text>
        )}
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    lineHeight: 20,
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
  note: {
    fontSize: 12,
    color: '#FF9500',
    marginBottom: 8,
    fontStyle: 'italic',
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
    minHeight: 100,
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
  searchButton: {
    backgroundColor: '#34C759',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 10,
  },
  genderButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  genderButtonTextSelected: {
    color: 'white',
  },
});

export default SearchQueryScreen;
