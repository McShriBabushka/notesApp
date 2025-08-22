import React, { useEffect } from 'react';
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
  PhotoQuality,
} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  signOut,
  setProfileImage,
  loadProfileImage,
} from '../store/slices/authSlice';
import { clearNotes } from '../store/slices/notesSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, profileImage } = useAppSelector((state) => state.auth);
  const { notes } = useAppSelector((state) => state.notes);

  // Load saved profile image when user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(loadProfileImage(user.id));
    }
  }, [user?.id, dispatch]);

  const saveProfileImage = async (imageUri: string) => {
    if (user?.id) {
      try {
        await AsyncStorage.setItem(`profileImage_${user.id}`, imageUri);
        dispatch(setProfileImage(imageUri));
      } catch (error) {
        console.log('Error saving profile image:', error);
      }
    }
  };

  // 🔑 Request Camera Permission (Android only)
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true; // iOS auto-handles
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'We need access to your camera to take profile pictures.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const selectImage = async () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as PhotoQuality,
    };

    Alert.alert('Select Profile Picture', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const hasPermission = await requestCameraPermission();
          if (hasPermission) {
            launchCamera(options, handleImageResponse);
          } else {
            Alert.alert(
              'Permission Denied',
              'Camera access is required to take a profile photo.'
            );
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: () => {
          launchImageLibrary(options, handleImageResponse);
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) return;

    if (response.errorMessage) {
      Alert.alert('Error', response.errorMessage);
      return;
    }

    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) saveProfileImage(imageUri);
    }
  };

  const removeImage = () => {
    Alert.alert('Remove Profile Picture', 'Remove your profile picture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          if (user?.id) {
            try {
              await AsyncStorage.removeItem(`profileImage_${user.id}`);
              dispatch(setProfileImage(null));
            } catch (error) {
              console.log('Error removing profile image:', error);
            }
          }
        },
      },
    ]);
  };

  const handleSignOut = () => {
    dispatch(clearNotes());
    dispatch(signOut());
  };

  const DefaultProfileIcon = () => (
    <View
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
      }}
    >
      <Text
        style={{
          fontSize: 48,
          color: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        👤
      </Text>
    </View>
  );

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 15,
          }}
        >
          <Text style={{ fontSize: 25, fontWeight: 'bold', color: 'white' }}>
            Profile
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}
            onPress={handleSignOut}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Picture */}
        <View
          style={{
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity onPress={selectImage} style={{ position: 'relative' }}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 3,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            ) : (
              <DefaultProfileIcon />
            )}

            {/* Edit overlay */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'white',
              }}
            >
              <Text style={{ fontSize: 16, color: '#333' }}>✏️</Text>
            </View>
          </TouchableOpacity>

          {/* Change / Remove Buttons */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={selectImage}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 15,
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                {profileImage ? 'Change' : 'Add Photo'}
              </Text>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity
                onPress={removeImage}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 15,
                }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                  Remove
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* User Information */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            margin: 20,
            padding: 20,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 12,
            }}
          >
            Account Information
          </Text>

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: 4,
              }}
            >
              Name
            </Text>
            <Text style={{ fontSize: 16, color: 'white', fontWeight: '500' }}>
              {user?.name || 'N/A'}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: 4,
              }}
            >
              Email
            </Text>
            <Text style={{ fontSize: 16, color: 'white', fontWeight: '500' }}>
              {user?.email || 'N/A'}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: 4,
              }}
            >
              Member Since
            </Text>
            <Text style={{ fontSize: 16, color: 'white', fontWeight: '500' }}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-GB')
                : 'N/A'}
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: 14,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: 4,
              }}
            >
              Total Notes
            </Text>
            <Text style={{ fontSize: 16, color: 'white', fontWeight: '500' }}>
              {notes.length}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
