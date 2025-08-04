import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateNote, deleteNote } from '../store/slices/notesSlice';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface EditNoteModalProps {
  visible: boolean;
  note: Note;
  onClose: () => void;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({ visible, note, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please add a title or content');
      return;
    }

    if (user) {
      dispatch(updateNote({
        userId: user.id,
        id: note.id,
        title: title.trim() || 'Untitled',
        content: content.trim()
      }));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (user) {
              dispatch(deleteNote({ userId: user.id, id: note.id }));
              onClose();
            }
          },
        },
      ]
    );
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
          <TouchableOpacity onPress={onClose}>
            <Text style={{
              fontSize: 16,
              color: '#3B82F6',
              fontWeight: '600'
            }}>Done</Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1F2937'
          }}>Edit Note</Text>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={{
              fontSize: 16,
              color: '#EF4444',
              fontWeight: '600'
            }}>Delete</Text>
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
            onBlur={handleSave}
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
            onBlur={handleSave}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditNoteModal;