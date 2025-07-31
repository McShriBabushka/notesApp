import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNotes } from '../context/NotesContext';

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ visible, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { addNote } = useNotes();

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please add a title or content');
      return;
    }

    await addNote(title.trim() || 'Untitled', content.trim());
    setTitle('');
    setContent('');
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: '#F9FAFB'
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingTop: 64,
          backgroundColor: 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        }}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={{
              fontSize: 16,
              color: '#6B7280'
            }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1F2937'
          }}>New Note</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={{
              fontSize: 16,
              color: '#3B82F6',
              fontWeight: '600'
            }}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={{
          flex: 1,
          padding: 20
        }}>
          <TextInput
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 20,
              color: '#1F2937'
            }}
            placeholder="Note title..."
            value={title}
            onChangeText={setTitle}
            multiline
            placeholderTextColor="#9CA3AF"
          />
          
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              lineHeight: 24,
              color: '#1F2937'
            }}
            placeholder="Start writing your note..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddNoteModal;