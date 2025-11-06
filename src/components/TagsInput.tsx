import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const QUICK_TAGS = ['Work', 'Social', 'Event', 'Service', 'Hobby'];

interface TagsInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  editable?: boolean;
}

const TagsInput: React.FC<TagsInputProps> = ({
  selectedTags,
  onTagsChange,
  editable = true,
}) => {
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (tag: string) => {
    if (!editable) return;
    
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      onTagsChange([...selectedTags, trimmed]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    if (!editable) return;
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        The Goal of Remembering Who Someone Is and Where You Know Them From
      </Text>

      <Text style={styles.subtitle}>Quick Tags</Text>
      <View style={styles.quickTags}>
        {QUICK_TAGS.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tag,
              selectedTags.includes(tag) && styles.selectedTag,
            ]}
            onPress={() => toggleTag(tag)}
            disabled={!editable}
          >
            <Text
              style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.selectedTagText,
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {editable && (
        <>
          <Text style={styles.subtitle}>Custom Tags</Text>
          <View style={styles.customTagInput}>
            <TextInput
              style={styles.input}
              placeholder="Add Custom Tag"
              value={customTag}
              onChangeText={setCustomTag}
              onSubmitEditing={addCustomTag}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addCustomTag}
              disabled={!customTag.trim()}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {selectedTags.length > 0 && (
        <>
          <Text style={styles.subtitle}>Selected Tags</Text>
          <View style={styles.selectedTags}>
            {selectedTags.map(tag => (
              <View key={tag} style={styles.selectedTagChip}>
                <Text style={styles.selectedTagChipText}>{tag}</Text>
                {editable && (
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
    marginTop: 15,
  },
  quickTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'white',
  },
  selectedTag: {
    backgroundColor: '#007AFF',
  },
  tagText: {
    color: '#007AFF',
    fontSize: 14,
  },
  selectedTagText: {
    color: 'white',
  },
  customTagInput: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectedTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  selectedTagChipText: {
    color: '#007AFF',
    fontSize: 14,
  },
  removeTagText: {
    color: '#007AFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TagsInput;
