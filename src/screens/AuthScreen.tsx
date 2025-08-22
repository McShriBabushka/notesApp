import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signUp, signIn, clearError } from '../store/slices/authSlice';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type AuthScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Auth'>;
};

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAuth = async () => {
  if (!email || !password || (isSignUp && !name)) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  if (isSignUp) {
    // extra checks here 👇
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters long');
      return;
    }
  }

  try {
    if (isSignUp) {
      await dispatch(signUp({ email, password, name })).unwrap();
    } else {
      await dispatch(signIn({ email, password })).unwrap();
    }
  } catch (err: any) {
    Alert.alert("Error", err.message || "Something went wrong");
  }
};


  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: 20
        }}
      >
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          padding: 32,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 32,
            color: '#1F2937'
          }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          
          {isSignUp && (
            <TextInput
              style={{
                backgroundColor: '#F3F4F6',
                padding: 16,
                borderRadius: 16,
                marginBottom: 16,
                fontSize: 16,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                color: '#111827'
              }}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#9CA3AF"
            />
          )}
          
          <TextInput
            style={{
              backgroundColor: '#F3F4F6',
              padding: 16,
              borderRadius: 16,
              marginBottom: 16,
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              color: '#111827'
            }}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />
          
          <TextInput
            style={{
              backgroundColor: '#F3F4F6',
              padding: 16,
              borderRadius: 16,
              marginBottom: 16,
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              color: '#111827'
            }}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />
          
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#9CA3AF' : '#3B82F6',
              padding: 16,
              borderRadius: 16,
              alignItems: 'center',
              marginTop: 12
            }}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={{
              color: 'white',
              fontSize: 18,
              fontWeight: 'bold'
            }}>
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              marginTop: 20,
              alignItems: 'center'
            }}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={{
              color: '#3B82F6',
              fontSize: 16
            }}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}