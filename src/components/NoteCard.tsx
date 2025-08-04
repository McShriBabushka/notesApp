import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteNote } from '../store/slices/notesSlice';
import EditNoteModal from './EditNoteModal';
import { formatDate } from '../utils/dateUtils';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

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
            }
          }
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 24,
          padding: 16,
          marginBottom: 16,
          width: '48%',
          minHeight: 120,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
        onPress={() => setModalVisible(true)}
        onLongPress={handleDelete}
      >
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: 8
        }} numberOfLines={2}>
          {note.title}
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#6B7280',
          lineHeight: 20,
          flex: 1
        }} numberOfLines={2}>
          {note.content}
        </Text>
        <Text style={{
          fontSize: 12,
          color: '#9CA3AF',
          marginTop: 8
        }}>
          {formatDate(note.createdAt)}
        </Text>
      </TouchableOpacity>

      <EditNoteModal
        visible={modalVisible}
        note={note}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default NoteCard;