import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signOut } from '../store/slices/authSlice';
import { clearNotes } from '../store/slices/notesSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const { notes } = useAppSelector((state) => state.notes);

  const handleSignOut = () => {
    dispatch(clearNotes());
    dispatch(signOut());
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 15,
          }}
        >
          <Text style={{ fontSize: 25, fontWeight: "bold", color: "white" }}>
            Profile
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
            onPress={handleSignOut}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Information Card */}
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          margin: 20,
          padding: 20,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 12,
          }}>
            Account Information
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 4,
            }}>
              Name
            </Text>
            <Text style={{
              fontSize: 16,
              color: 'white',
              fontWeight: '500',
            }}>
              {user?.name || 'N/A'}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 4,
            }}>
              Email
            </Text>
            <Text style={{
              fontSize: 16,
              color: 'white',
              fontWeight: '500',
            }}>
              {user?.email || 'N/A'}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 4,
            }}>
              Member Since
            </Text>
            <Text style={{
              fontSize: 16,
              color: 'white',
              fontWeight: '500',
            }}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'}
            </Text>
          </View>

          <View>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: 4,
            }}>
              Total Notes
            </Text>
            <Text style={{
              fontSize: 16,
              color: 'white',
              fontWeight: '500',
            }}>
              {notes.length}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}