import React, { useState } from 'react';
import {
  FlatList,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddNoteModal from '../components/AddNoteModal';
import NoteCard from '../components/NoteCard';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { notes } = useNotes();
  const [modalVisible, setModalVisible] = useState(false);

  const renderNote = ({ item }: { item: any }) => (
    <NoteCard note={item} />
  );

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        {/* header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white'
          }}>My Notes</Text>
          <TouchableOpacity 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20
            }}
            onPress={signOut}
          >
            <Text style={{
              color: 'white',
              fontSize: 14,
              fontWeight: '600'
            }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* user Infornation */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{
            fontSize: 18,
            color: 'white',
            fontWeight: '600'
          }}>
            Welcome, {user?.name || user?.email}!
          </Text>
          <Text style={{
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: 4
          }}>
            {notes.length} notes
          </Text>
        </View>

        {/* notes List */}
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {notes.length === 0 ? (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{
                fontSize: 18,
                color: 'white',
                fontWeight: '600',
                marginBottom: 12
              }}>
                No notes yet
              </Text>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center'
              }}>
                Tap the + button to add your first note
              </Text>
            </View>
          ) : (
            <FlatList
              data={notes}
              renderItem={renderNote}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </View>

        {/* add note Button*/}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 32,
            right: 32,
            width: 64,
            height: 64,
            backgroundColor: '#3B82F6',
            borderRadius: 32,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8
          }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{
            color: 'white',
            fontSize: 32,
            fontWeight: '300'
          }}>+</Text>
        </TouchableOpacity>

        {/* Add Note Modal */}
        <AddNoteModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}