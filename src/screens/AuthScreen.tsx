import React, { useState } from 'react';
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
import { useAuth } from '../context/AuthContext';

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
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    let result;
    
    if (isSignUp) {
      result = await signUp(email, password, name);
    } else {
      result = await signIn(email, password);
    }

    if (result.success) {
      // Navigation will be handled by AuthNavigator useEffect
      // navigation.navigate('Main');
    } else {
      Alert.alert('Error', result.error || 'Authentication failed');
    }
    
    setLoading(false);
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
                borderColor: '#E5E7EB'
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
              borderColor: '#E5E7EB'
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
              borderColor: '#E5E7EB'
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